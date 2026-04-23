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
                    const ULD95 = fuelRows.find(r => r.fuel_code === 'ULD95');
                    const price = ULD95?.price_per_litre ?? fuelRows[0]?.price_per_litre ?? null;

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

const PORT = process.env.PORT || 3000;

// ====================
// CRUD OPERATIONS FOR STATIONS
// ====================

// Get single station by ID
app.get('/api/stations/:id', (req, res) => {
    try {
        const { id } = req.params;
        
        if (!id || isNaN(id)) {
            return res.status(400).json({ error: 'Invalid station ID' });
        }

        db.get('SELECT * FROM FILLING_STATION WHERE station_id = ?', [id], (err, station) => {
            if (err) {
                console.error('Error fetching station:', err);
                return res.status(500).json({ error: 'Database error' });
            }

            if (!station) {
                return res.status(404).json({ error: 'Station not found' });
            }

            // Get fuel availability
            db.all(
                `SELECT ft.fuel_code, fa.is_available, fa.price_per_litre, fa.quantity_in_stock
                 FROM FUEL_AVAILABILITY fa
                 JOIN FUEL_TYPE ft ON fa.fuel_type_id = ft.fuel_type_id
                 WHERE fa.station_id = ?`,
                [id],
                (err, fuels) => {
                    if (err) {
                        return res.status(500).json({ error: 'Database error' });
                    }

                    res.json({
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
                        phone_number: station.phone_number,
                        manager_name: station.manager_name,
                        fuels
                    });
                }
            );
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Create new station (CRUD - Create)
app.post('/api/stations', authenticateToken, async (req, res) => {
    try {
        const { station_name, brand, area, address, latitude, longitude, operating_hours, phone_number, manager_name } = req.body;

        // Validation
        if (!station_name || !brand || !area || !address || latitude === undefined || longitude === undefined) {
            return res.status(400).json({ error: 'Missing required fields: station_name, brand, area, address, latitude, longitude' });
        }

        if (isNaN(latitude) || isNaN(longitude)) {
            return res.status(400).json({ error: 'Latitude and longitude must be valid numbers' });
        }

        db.run(
            `INSERT INTO FILLING_STATION (station_name, brand, area, address, latitude, longitude, operating_hours, phone_number, manager_name, is_active) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
            [station_name, brand, area, address, latitude, longitude, operating_hours || '6am - 9pm', phone_number || null, manager_name || null],
            function(err) {
                if (err) {
                    console.error('Error creating station:', err);
                    return res.status(500).json({ error: 'Failed to create station' });
                }

                // Log transaction
                db.run(
                    `INSERT INTO TRANSACTION_LOG (user_id, station_id, transaction_type, transaction_details, status)
                     VALUES (?, ?, ?, ?, ?)`,
                    [req.user.user_id, this.lastID, 'STATION_CREATED', `Created station: ${station_name}`, 'completed']
                );

                res.status(201).json({
                    message: 'Station created successfully',
                    station_id: this.lastID
                });
            }
        );
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update station (CRUD - Update)
app.put('/api/stations/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { station_name, brand, area, address, latitude, longitude, operating_hours, phone_number, manager_name, available } = req.body;

        if (!id || isNaN(id)) {
            return res.status(400).json({ error: 'Invalid station ID' });
        }

        // Check if station exists
        db.get('SELECT * FROM FILLING_STATION WHERE station_id = ?', [id], (err, station) => {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }

            if (!station) {
                return res.status(404).json({ error: 'Station not found' });
            }

            // Prepare update values
            const updates = [];
            const values = [];

            if (station_name !== undefined) {
                updates.push('station_name = ?');
                values.push(station_name);
            }
            if (brand !== undefined) {
                updates.push('brand = ?');
                values.push(brand);
            }
            if (area !== undefined) {
                updates.push('area = ?');
                values.push(area);
            }
            if (address !== undefined) {
                updates.push('address = ?');
                values.push(address);
            }
            if (latitude !== undefined) {
                updates.push('latitude = ?');
                values.push(latitude);
            }
            if (longitude !== undefined) {
                updates.push('longitude = ?');
                values.push(longitude);
            }
            if (operating_hours !== undefined) {
                updates.push('operating_hours = ?');
                values.push(operating_hours);
            }
            if (phone_number !== undefined) {
                updates.push('phone_number = ?');
                values.push(phone_number);
            }
            if (manager_name !== undefined) {
                updates.push('manager_name = ?');
                values.push(manager_name);
            }
            if (available !== undefined) {
                updates.push('available = ?');
                values.push(available ? 1 : 0);
            }

            if (updates.length === 0) {
                return res.status(400).json({ error: 'No fields to update' });
            }

            updates.push('updated_at = CURRENT_TIMESTAMP');
            values.push(id);

            db.run(
                `UPDATE FILLING_STATION SET ${updates.join(', ')} WHERE station_id = ?`,
                values,
                function(err) {
                    if (err) {
                        console.error('Error updating station:', err);
                        return res.status(500).json({ error: 'Failed to update station' });
                    }

                    // Log transaction
                    db.run(
                        `INSERT INTO TRANSACTION_LOG (user_id, station_id, transaction_type, transaction_details, status)
                         VALUES (?, ?, ?, ?, ?)`,
                        [req.user.user_id, id, 'STATION_UPDATED', `Updated station: ${station_name || station.station_name}`, 'completed']
                    );

                    res.json({ message: 'Station updated successfully' });
                }
            );
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete station (CRUD - Delete)
app.delete('/api/stations/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;

        if (!id || isNaN(id)) {
            return res.status(400).json({ error: 'Invalid station ID' });
        }

        db.get('SELECT station_name FROM FILLING_STATION WHERE station_id = ?', [id], (err, station) => {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }

            if (!station) {
                return res.status(404).json({ error: 'Station not found' });
            }

            // Soft delete - set is_active to 0
            db.run(
                'UPDATE FILLING_STATION SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE station_id = ?',
                [id],
                function(err) {
                    if (err) {
                        console.error('Error deleting station:', err);
                        return res.status(500).json({ error: 'Failed to delete station' });
                    }

                    // Log transaction
                    db.run(
                        `INSERT INTO TRANSACTION_LOG (user_id, station_id, transaction_type, transaction_details, status)
                         VALUES (?, ?, ?, ?, ?)`,
                        [req.user.user_id, id, 'STATION_DELETED', `Deleted station: ${station.station_name}`, 'completed']
                    );

                    res.json({ message: 'Station deleted successfully' });
                }
            );
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ====================
// REPORT ENDPOINTS
// ====================

// Report 1: Station Performance Report (from FILLING_STATION and FUEL_AVAILABILITY)
app.get('/api/reports/station-performance', (req, res) => {
    try {
        db.all(
            `SELECT 
                fs.station_id,
                fs.station_name,
                fs.brand,
                fs.area,
                fs.rating,
                fs.reviews,
                COUNT(DISTINCT fa.fuel_type_id) as fuel_types_available,
                AVG(fa.price_per_litre) as avg_fuel_price,
                SUM(fa.quantity_in_stock) as total_stock,
                fs.operating_hours,
                fs.available
            FROM FILLING_STATION fs
            LEFT JOIN FUEL_AVAILABILITY fa ON fs.station_id = fa.station_id
            WHERE fs.is_active = 1
            GROUP BY fs.station_id, fs.station_name, fs.brand, fs.area, fs.rating, fs.reviews, fs.operating_hours, fs.available
            ORDER BY fs.rating DESC`,
            [],
            (err, rows) => {
                if (err) {
                    console.error('Error generating report:', err);
                    return res.status(500).json({ error: 'Failed to generate report' });
                }

                res.json({
                    report_name: 'Station Performance Report',
                    description: 'Shows rating, available fuel types, and stock levels for each station',
                    total_stations: rows.length,
                    data: rows
                });
            }
        );
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Report 2: Fuel Availability and Pricing Report (from FUEL_AVAILABILITY and FUEL_TYPE)
app.get('/api/reports/fuel-availability', (req, res) => {
    try {
        db.all(
            `SELECT 
                ft.fuel_code,
                ft.fuel_name,
                COUNT(fa.availability_id) as total_stations_offering,
                SUM(CASE WHEN fa.is_available = 1 THEN 1 ELSE 0 END) as stations_with_stock,
                MIN(fa.price_per_litre) as min_price,
                MAX(fa.price_per_litre) as max_price,
                AVG(fa.price_per_litre) as avg_price,
                ROUND(SUM(COALESCE(fa.quantity_in_stock, 0))) as total_stock_liters
            FROM FUEL_TYPE ft
            LEFT JOIN FUEL_AVAILABILITY fa ON ft.fuel_type_id = fa.fuel_type_id
            GROUP BY ft.fuel_type_id, ft.fuel_code, ft.fuel_name
            ORDER BY ft.fuel_code`,
            [],
            (err, rows) => {
                if (err) {
                    console.error('Error generating report:', err);
                    return res.status(500).json({ error: 'Failed to generate report' });
                }

                res.json({
                    report_name: 'Fuel Availability and Pricing Report',
                    description: 'Shows fuel availability across stations with pricing comparison',
                    fuel_types: rows.length,
                    data: rows
                });
            }
        );
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Report 3: User Activity and Reviews Report (from STATION_REVIEW, USER, and FILLING_STATION)
app.get('/api/reports/user-activity', (req, res) => {
    try {
        db.all(
            `SELECT 
                u.user_id,
                u.full_name,
                u.email,
                COUNT(sr.review_id) as reviews_posted,
                AVG(sr.rating) as avg_rating_given,
                COUNT(DISTINCT sr.station_id) as stations_reviewed,
                MAX(sr.created_at) as last_review_date
            FROM USER u
            LEFT JOIN STATION_REVIEW sr ON u.user_id = sr.user_id
            GROUP BY u.user_id, u.full_name, u.email
            ORDER BY COUNT(sr.review_id) DESC`,
            [],
            (err, rows) => {
                if (err) {
                    console.error('Error generating report:', err);
                    return res.status(500).json({ error: 'Failed to generate report' });
                }

                res.json({
                    report_name: 'User Activity and Reviews Report',
                    description: 'Shows user engagement with reviews and station ratings',
                    active_users: rows.filter(r => r.reviews_posted > 0).length,
                    data: rows
                });
            }
        );
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Report 4: Transaction Summary Report (from TRANSACTION_LOG, USER, and FILLING_STATION)
app.get('/api/reports/transaction-summary', (req, res) => {
    try {
        db.all(
            `SELECT 
                u.user_id,
                u.full_name,
                fs.station_name,
                tl.transaction_type,
                COUNT(tl.transaction_id) as transaction_count,
                tl.status,
                MIN(tl.timestamp) as first_transaction,
                MAX(tl.timestamp) as last_transaction
            FROM TRANSACTION_LOG tl
            LEFT JOIN USER u ON tl.user_id = u.user_id
            LEFT JOIN FILLING_STATION fs ON tl.station_id = fs.station_id
            GROUP BY u.user_id, u.full_name, fs.station_name, tl.transaction_type, tl.status
            ORDER BY tl.timestamp DESC`,
            [],
            (err, rows) => {
                if (err) {
                    console.error('Error generating report:', err);
                    return res.status(500).json({ error: 'Failed to generate report' });
                }

                res.json({
                    report_name: 'Transaction Summary Report',
                    description: 'Shows transaction activity across users and stations',
                    total_transactions: rows.length,
                    data: rows
                });
            }
        );
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ====================
// REVIEW OPERATIONS
// ====================

// Get reviews for a station
app.get('/api/stations/:id/reviews', (req, res) => {
    try {
        const { id } = req.params;

        db.all(
            `SELECT sr.review_id, sr.rating, sr.review_text, u.full_name, sr.created_at
             FROM STATION_REVIEW sr
             JOIN USER u ON sr.user_id = u.user_id
             WHERE sr.station_id = ?
             ORDER BY sr.created_at DESC`,
            [id],
            (err, rows) => {
                if (err) {
                    return res.status(500).json({ error: 'Database error' });
                }

                res.json(rows);
            }
        );
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Add review for a station
app.post('/api/stations/:id/reviews', authenticateToken, (req, res) => {
    try {
        const { id } = req.params;
        const { rating, review_text } = req.body;

        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ error: 'Rating must be between 1 and 5' });
        }

        db.run(
            `INSERT INTO STATION_REVIEW (station_id, user_id, rating, review_text)
             VALUES (?, ?, ?, ?)`,
            [id, req.user.user_id, rating, review_text || null],
            function(err) {
                if (err) {
                    console.error('Error creating review:', err);
                    return res.status(500).json({ error: 'Failed to create review' });
                }

                // Update station rating
                db.get(
                    `SELECT AVG(rating) as avg_rating, COUNT(*) as review_count
                     FROM STATION_REVIEW WHERE station_id = ?`,
                    [id],
                    (err, data) => {
                        if (!err && data) {
                            db.run(
                                'UPDATE FILLING_STATION SET rating = ?, reviews = ? WHERE station_id = ?',
                                [data.avg_rating, data.review_count, id]
                            );
                        }
                    }
                );

                // Log transaction
                db.run(
                    `INSERT INTO TRANSACTION_LOG (user_id, station_id, transaction_type, transaction_details, status)
                     VALUES (?, ?, ?, ?, ?)`,
                    [req.user.user_id, id, 'REVIEW_POSTED', `Posted ${rating}-star review`, 'completed']
                );

                res.status(201).json({
                    message: 'Review created successfully',
                    review_id: this.lastID
                });
            }
        );
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});