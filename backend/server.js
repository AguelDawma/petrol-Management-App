const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const Anthropic = require('@anthropic-ai/sdk');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const dbPath = path.join(__dirname, 'Database', 'petrol.db');
const db = new sqlite3.Database(dbPath);

const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
});

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

app.post('/api/stations/import-osm', async (req, res) => {
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
            db.run(`
                INSERT OR IGNORE INTO FILLING_STATION 
                (station_name, brand, area, address, latitude, longitude, operating_hours, is_active) 
                VALUES (?, ?, ?, ?, ?, ?, ?, 1)
            `,
            [
                station.tags?.name || 'Unnamed Station',
                station.tags?.brand || 'Unknown Brand',
                station.tags?.locality || station.tags?.suburb || 'Unknown Area',
                station.tags?.addr_street || 'No address',
                station.lat,
                station.lon,
                station.tags?.opening_hours || '24 hrs'
            ],
            function(err) {
                if (!err && this.changes > 0) importedCount++;
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