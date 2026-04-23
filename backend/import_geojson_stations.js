const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const geojsonPath = 'C:/Users/Administrator/Downloads/export.geojson';
const dbPath = path.join(__dirname, 'Database', 'petrol.db');
const sqlPath = path.join(__dirname, 'Database', 'petrols_sqlite.sql');

const readGeojson = () => {
  const raw = fs.readFileSync(geojsonPath, 'utf8');
  const data = JSON.parse(raw);
  if (!data.features || !Array.isArray(data.features)) {
    throw new Error('GeoJSON does not contain a valid FeatureCollection');
  }
  return data.features;
};

const getCentroid = (geometry) => {
  if (!geometry || !geometry.type || !geometry.coordinates) return null;
  if (geometry.type === 'Point') {
    const [lng, lat] = geometry.coordinates;
    return { lat, lng };
  }

  const ring = geometry.type === 'Polygon'
    ? geometry.coordinates[0]
    : geometry.type === 'MultiPolygon'
      ? geometry.coordinates[0][0]
      : null;

  if (!ring || !Array.isArray(ring) || ring.length === 0) return null;

  let sumLat = 0;
  let sumLng = 0;
  ring.forEach(coord => {
    sumLng += coord[0];
    sumLat += coord[1];
  });
  return {
    lat: sumLat / ring.length,
    lng: sumLng / ring.length,
  };
};

const normalizeString = (value, fallback) => {
  if (typeof value === 'string' && value.trim().length > 0) {
    return value.trim();
  }
  return fallback;
};

const buildStation = (feature) => {
  const props = feature.properties || {};
  const tags = props.tags || props;
  const name = normalizeString(tags.name || tags['name'] || props.name || props['name'], 'Unnamed Station');
  const brand = normalizeString(tags.brand || tags.operator || tags.name, 'Unknown Brand');
  const area = normalizeString(
    tags.locality || tags.suburb || tags.city || tags.village || tags.town || tags.county || tags.state,
    'Unknown Area'
  );
  const street = normalizeString(tags['addr:street'] || tags['addr:housename'] || tags['addr:housenumber'] || '');
  const house = normalizeString(tags['addr:housenumber'] || '', '');
  const address = normalizeString(
    tags['addr:full'] || tags['addr:street'] || tags['addr:housename'] || tags['addr:housenumber'] || tags['addr:place'] || tags['addr:city'],
    'No address'
  );
  const phone = normalizeString(tags['contact:phone'] || tags.phone || tags['phone'], null);
  const hours = normalizeString(tags.opening_hours || tags.hours || '24 hrs', '24 hrs');
  const mapsUrl = `https://www.openstreetmap.org/?mlat=${tags._lat || 0}&mlon=${tags._lon || 0}&zoom=17`;

  const centroid = getCentroid(feature.geometry);
  if (!centroid) {
    throw new Error('Feature does not contain usable coordinates');
  }

  return {
    station_name: name,
    brand,
    area,
    address,
    latitude: centroid.lat,
    longitude: centroid.lng,
    rating: 0,
    reviews: 0,
    available: 1,
    maps_url: `https://www.openstreetmap.org/?mlat=${centroid.lat}&mlon=${centroid.lng}&zoom=17`,
    operating_hours: hours,
    is_active: 1,
    phone_number: phone,
    manager_name: null,
  };
};

const formatSqlValue = (value) => {
  if (value === null || value === undefined) return 'NULL';
  if (typeof value === 'boolean') return value ? '1' : '0';
  if (typeof value === 'number') return value;
  return `'${String(value).replace(/'/g, "''")}'`;
};

const buildInsertRows = (stations) => {
  return stations.map(station => {
    const values = [
      station.station_name,
      station.brand,
      station.area,
      station.address,
      station.latitude,
      station.longitude,
      station.rating,
      station.reviews,
      station.available,
      station.maps_url,
      station.operating_hours,
      station.is_active,
      station.phone_number,
      station.manager_name,
    ].map(formatSqlValue).join(', ');
    return `(${values})`;
  });
};

const importStations = () => {
  const features = readGeojson();
  const stations = features.map(buildStation);

  const db = new sqlite3.Database(dbPath);
  db.serialize(() => {
    db.run('PRAGMA foreign_keys = ON;');
    db.run('BEGIN TRANSACTION;');
    db.run('DELETE FROM FUEL_AVAILABILITY;');
    db.run('DELETE FROM FILLING_STATION;');

    const stmt = db.prepare(`INSERT INTO FILLING_STATION
      (station_name, brand, area, address, latitude, longitude, rating, reviews, available, maps_url, operating_hours, is_active, phone_number, manager_name)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);

    stations.forEach(station => {
      stmt.run([
        station.station_name,
        station.brand,
        station.area,
        station.address,
        station.latitude,
        station.longitude,
        station.rating,
        station.reviews,
        station.available,
        station.maps_url,
        station.operating_hours,
        station.is_active,
        station.phone_number,
        station.manager_name,
      ]);
    });

    stmt.finalize();
    db.run('COMMIT;');
  });

  db.close();

  const sqlText = fs.readFileSync(sqlPath, 'utf8');
  const startMarker = 'INSERT OR IGNORE INTO FILLING_STATION';
  const endMarker = 'INSERT OR IGNORE INTO FUEL_AVAILABILITY';
  const startIndex = sqlText.indexOf(startMarker);
  const endIndex = sqlText.indexOf(endMarker);

  if (startIndex === -1 || endIndex === -1) {
    throw new Error('Could not find FILLING_STATION block in sqlite SQL file');
  }

  const before = sqlText.slice(0, startIndex);
  const after = sqlText.slice(endIndex);

  const newRows = buildInsertRows(stations).join(',\n    ');
  const newStationSql = `${startMarker} (station_name, brand, area, address, latitude, longitude, rating, reviews, available, maps_url, operating_hours, is_active, phone_number, manager_name) VALUES\n    ${newRows};\n\n`;

  fs.writeFileSync(sqlPath, before + newStationSql + after, 'utf8');

  console.log(`Replaced ${stations.length} FILLING_STATION rows from GeoJSON.`);
};

try {
  importStations();
} catch (error) {
  console.error('Failed to import stations:', error);
  process.exit(1);
}
