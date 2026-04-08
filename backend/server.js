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