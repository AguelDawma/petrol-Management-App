const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const Anthropic = require('@anthropic-ai/sdk');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const dbPath = path.join(__dirname, 'Database', 'petrol.db');
const db = new sqlite3.Database(dbPath);
const mysqlScriptPath = path.join(__dirname, 'Database', 'petrols.sql');
const sqliteScriptPath = path.join(__dirname, 'Database', 'petrols_sqlite.sql');

const encodeSqlValue = (value) => {
    if (value === null || value === undefined) {
        return 'NULL';
    }
    if (typeof value === 'boolean') {
        return value ? '1' : '0';
    }
    if (typeof value === 'number' && Number.isFinite(value)) {
        return value;
    }
    return `'${String(value).replace(/'/g, "''")}'`;
};

const buildInsertSql = (table, columns, values, dialect = 'mysql', opts = {}) => {
    const prefix = dialect === 'sqlite'
        ? opts.ignore ? 'INSERT OR IGNORE INTO' : 'INSERT INTO'
        : opts.ignore ? 'INSERT IGNORE INTO' : 'INSERT INTO';
    const columnList = columns.map(column => `\`${column}\``).join(', ');
    const valueList = values.map(encodeSqlValue).join(', ');
    return `${prefix} ${table} (${columnList}) VALUES (${valueList});`;
};

const appendInsertSqlScripts = (table, columns, values, opts = {}) => {
    try {
        const mysqlSql = buildInsertSql(table, columns, values, 'mysql', opts);
        const sqliteSql = buildInsertSql(table, columns, values, 'sqlite', opts);
        fs.appendFileSync(mysqlScriptPath, `${mysqlSql}\n`);
        fs.appendFileSync(sqliteScriptPath, `${sqliteSql}\n`);
    } catch (error) {
        console.error('Failed to append SQL script to petrols.sql and petrols_sqlite.sql:', error);
    }
};

const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
});

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Authentication middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    });
};

// Initialize database
const initDb = () => {
    const sqlPath = path.join(__dirname, 'Database', 'petrols_sqlite.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    db.serialize(() => {
        db.run('PRAGMA foreign_keys = ON;');
        db.exec(sql, (err) => {
            if (err) {
                console.error('Error executing SQL:', err);
            } else {
                console.log('Database initialized');
            }
        });
    });
};

initDb();

db.on('open', () => {
    console.log('Connected to SQLite database');
});

app.get('/', (req, res) => {
    res.send('Petrol Peek API is running');
});

// Authentication routes
app.post('/api/auth/register', async (req, res) => {
    try {
        const { full_name, email, phone_number, password } = req.body;

        if (!full_name || !email || !password) {
            return res.status(400).json({ error: 'Full name, email, and password are required' });
        }

        // Check if user already exists
        db.get('SELECT email FROM USER WHERE email = ?', [email], async (err, row) => {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }

            if (row) {
                return res.status(409).json({ error: 'User already exists' });
            }

            // Hash password
            const saltRounds = 10;
            const password_hash = await bcrypt.hash(password, saltRounds);

            // Insert new user
            db.run(
                'INSERT INTO USER (full_name, email, phone_number, password_hash) VALUES (?, ?, ?, ?)',
                [full_name, email, phone_number || null, password_hash],
                function(err) {
                    if (err) {
                        return res.status(500).json({ error: 'Failed to create user' });
                    }

                    appendInsertSqlScripts(
                        '`USER`',
                        ['full_name', 'email', 'phone_number', 'password_hash'],
                        [full_name, email, phone_number || null, password_hash],
                        { ignore: true }
                    );

                    // Generate JWT token
                    const token = jwt.sign(
                        { user_id: this.lastID, email, full_name },
                        JWT_SECRET,
                        { expiresIn: '24h' }
                    );

                    res.status(201).json({
                        message: 'User created successfully',
                        token,
                        user: { user_id: this.lastID, full_name, email, phone_number }
                    });
                }
            );
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/auth/login', (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        db.get('SELECT * FROM USER WHERE email = ?', [email], async (err, user) => {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }

            if (!user) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            // Check password
            const isValidPassword = await bcrypt.compare(password, user.password_hash);
            if (!isValidPassword) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            // Generate JWT token
            const token = jwt.sign(
                { user_id: user.user_id, email: user.email, full_name: user.full_name },
                JWT_SECRET,
                { expiresIn: '24h' }
            );

            res.json({
                message: 'Login successful',
                token,
                user: {
                    user_id: user.user_id,
                    full_name: user.full_name,
                    email: user.email,
                    phone_number: user.phone_number
                }
            });
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/auth/profile', authenticateToken, (req, res) => {
    db.get('SELECT user_id, full_name, email, phone_number, created_at FROM USER WHERE user_id = ?',
        [req.user.user_id], (err, user) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ user });
    });
});

app.get('/api/stations', (req, res) => {
    db.all('SELECT * FROM FILLING_STATION WHERE is_active = 1', [], (err, rows) => {
        if (err) {
            console.error('Error fetching stations:', err);
            return res.status(500).json({ error: 'Unable to load stations' });
        }

        const stationPromises = rows.map(station => new Promise((resolve, reject) => {
            db.all(
                `SELECT ft.fuel_code, fa.is_available, fa.price_per_litre
                 FROM FUEL_AVAILABILITY fa
                 JOIN FUEL_TYPE ft ON fa.fuel_type_id = ft.fuel_type_id
                 WHERE fa.station_id = ?`,
                [station.station_id],
                (err, fuelRows) => {
                    if (err) {
                        return reject(err);
                    }

                    const fuels = fuelRows.map(r => r.fuel_code);
                    const pms = fuelRows.find(r => r.fuel_code === 'PMS');
                    const price = pms?.price_per_litre ?? fuelRows[0]?.price_per_litre ?? null;

                    resolve({
                        id: station.station_id,
                        name: station.station_name,
                        brand: station.brand,
                        area: station.area,
                        address: station.address,
                        lat: station.latitude,
                        lng: station.longitude,
                        rating: station.rating,
                        reviews: station.reviews,
                        available: Boolean(station.available),
                        hours: station.operating_hours,
                        maps_url: station.maps_url,
                        fuels,
                        price,
                    });
                }
            );
        }));

        Promise.all(stationPromises)
            .then(result => res.json(result))
            .catch(err => {
                console.error('Error fetching station fuels:', err);
                res.status(500).json({ error: 'Unable to load combined station data' });
            });
    });
});

app.post('/api/stations/import-osm', authenticateToken, async (req, res) => {
    try {
        const { bounds } = req.body;
        if (!bounds) {
            return res.status(400).json({ error: 'Bounds are required (format: "south,west,north,east")' });
        }

        // Fetch from OpenStreetMap
        const query = `[out:json];node["amenity"="fuel"](${bounds});out;`;
        const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;

        const osmResponse = await fetch(url);
        const osmData = await osmResponse.json();

        if (!osmData.elements || osmData.elements.length === 0) {
            return res.json({ imported: 0, message: 'No stations found in bounds' });
        }

        let importedCount = 0;

        // Insert each station into database
        osmData.elements.forEach(station => {
            const stationName = station.tags?.name || 'Unnamed Station';
            const brand = station.tags?.brand || 'Unknown Brand';
            const area = station.tags?.locality || station.tags?.suburb || 'Unknown Area';
            const address = station.tags?.addr_street || 'No address';
            const latitude = station.lat;
            const longitude = station.lon;
            const operatingHours = station.tags?.opening_hours || '24 hrs';

            db.run(`
                INSERT OR IGNORE INTO FILLING_STATION 
                (station_name, brand, area, address, latitude, longitude, operating_hours, is_active) 
                VALUES (?, ?, ?, ?, ?, ?, ?, 1)
            `,
            [
                stationName,
                brand,
                area,
                address,
                latitude,
                longitude,
                operatingHours
            ],
            function(err) {
                if (!err && this.changes > 0) {
                    importedCount++;
                    appendInsertSqlScripts(
                        'FILLING_STATION',
                        ['station_name', 'brand', 'area', 'address', 'latitude', 'longitude', 'operating_hours', 'is_active'],
                        [stationName, brand, area, address, latitude, longitude, operatingHours, 1],
                        { ignore: true }
                    );
                }
            });
        });

        // Wait a brief moment for all inserts to complete
        setTimeout(() => {
            res.json({ 
                imported: importedCount, 
                total: osmData.elements.length,
                message: `Imported ${importedCount} stations from OpenStreetMap`
            });
        }, 500);

    } catch (error) {
        console.error('Error importing OSM data:', error);
        res.status(500).json({ error: 'Failed to import stations' });
    }
});

app.post('/api/claude', async (req, res) => {
    try {
        const { prompt } = req.body;
        if (!prompt) {
            return res.status(400).json({ error: 'Prompt is required' });
        }

        const message = await anthropic.messages.create({
            model: 'claude-3-haiku-20240307',
            max_tokens: 1000,
            messages: [{ role: 'user', content: prompt }],
        });

        res.json({ response: message.content[0].text });
    } catch (error) {
        console.error('Error calling Claude API:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});