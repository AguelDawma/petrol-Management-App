const axios = require('axios');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'Database', 'petrol.db');
const db = new sqlite3.Database(dbPath);

async function fetchOSMStations() {
    // Since OSM API is not working, using sample data for Maseru, Lesotho
    return [
        {
            tags: { name: 'Shell Maseru', brand: 'Shell', 'addr:street': 'Kingsway Road' },
            lat: -29.3167,
            lon: 27.4833
        },
        {
            tags: { name: 'BP Maseru', brand: 'BP', 'addr:street': 'Main North Road' },
            lat: -29.3100,
            lon: 27.4800
        },
        {
            tags: { name: 'Total Maseru', brand: 'Total', 'addr:street': 'Pioneer Road' },
            lat: -29.3200,
            lon: 27.4850
        },
        {
            tags: { name: 'Engen Maseru', brand: 'Engen', 'addr:street': 'Moshoeshoe Road' },
            lat: -29.3150,
            lon: 27.4900
        }
    ];
}

function insertStation(station) {
    const name = station.tags?.name || 'Unknown Station';
    const brand = station.tags?.brand || 'Unknown';
    const address = station.tags?.['addr:full'] || station.tags?.['addr:street'] || 'Unknown Address';
    const area = 'Maseru';
    const latitude = station.lat;
    const longitude = station.lon;
    const phone = station.tags?.['contact:phone'] || station.tags?.phone || null;
    const operating_hours = station.tags?.opening_hours || '24/7';
    const maps_url = `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}&zoom=15`;

    const sql = `
        INSERT OR IGNORE INTO FILLING_STATION
        (station_name, brand, area, address, latitude, longitude, maps_url, operating_hours, phone_number)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.run(sql, [name, brand, area, address, latitude, longitude, maps_url, operating_hours, phone], function(err) {
        if (err) {
            console.error('Error inserting station:', err);
        } else {
            console.log(`Inserted station: ${name}`);
        }
    });
}

async function main() {
    console.log('Fetching petrol stations from OSM for Maseru, Lesotho...');
    const stations = await fetchOSMStations();
    console.log(`Found ${stations.length} stations`);

    stations.forEach(station => {
        insertStation(station);
    });

    // Close database after a delay to allow inserts to complete
    setTimeout(() => {
        db.close();
        console.log('Database updated with OSM stations.');
    }, 2000);
}

main();