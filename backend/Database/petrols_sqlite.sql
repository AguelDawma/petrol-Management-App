CREATE TABLE IF NOT EXISTS FUEL_TYPE (
    fuel_type_id INTEGER PRIMARY KEY AUTOINCREMENT,
    fuel_name TEXT NOT NULL,
    fuel_code TEXT NOT NULL UNIQUE,
    fuel_price REAL NOT NULL
);

CREATE TABLE IF NOT EXISTS FILLING_STATION (
    station_id INTEGER PRIMARY KEY AUTOINCREMENT,
    station_name TEXT NOT NULL,
    brand TEXT NOT NULL,
    area TEXT NOT NULL,
    address TEXT NOT NULL,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    rating REAL DEFAULT 0,
    reviews INTEGER DEFAULT 0,
    available BOOLEAN DEFAULT 1,
    maps_url TEXT NULL,
    operating_hours TEXT NOT NULL,
    is_active BOOLEAN DEFAULT 1,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS FUEL_AVAILABILITY (
    availability_id INTEGER PRIMARY KEY AUTOINCREMENT,
    station_id INTEGER NOT NULL,
    fuel_type_id INTEGER NOT NULL,
    is_available BOOLEAN NOT NULL DEFAULT 0,
    price_per_litre REAL NOT NULL,
    quantity_in_stock REAL NULL,
    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (station_id) REFERENCES FILLING_STATION(station_id) ON DELETE CASCADE,
    FOREIGN KEY (fuel_type_id) REFERENCES FUEL_TYPE(fuel_type_id) ON DELETE CASCADE,
    UNIQUE (station_id, fuel_type_id)
);

CREATE TABLE IF NOT EXISTS USER (
    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE,
    phone_number TEXT,
    password_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT OR IGNORE INTO FUEL_TYPE (fuel_type_id, fuel_name, fuel_code, fuel_price) VALUES
    (1, 'Premium Motor Spirit', 'PMS', 617),
    (2, 'Diesel', 'AGO', 620),
    (3, 'LPG', 'LPG', 450);

INSERT OR IGNORE INTO FILLING_STATION (station_id, station_name, brand, area, address, latitude, longitude, rating, reviews, available, maps_url, operating_hours, is_active) VALUES
    (1, 'NNPC Mega Station', 'NNPC', 'Victoria Island', '12 Adeola Odeku St, VI, Lagos', 6.4281, 3.4219, 4.7, 214, 1, 'https://www.google.com/maps/place/?q=place_id:ChIJ7aVxnOTH...','24 hrs', 1),
    (2, 'TotalEnergies', 'Total', 'Lekki Phase 1', '45 Admiralty Way, Lekki, Lagos', 6.4350, 3.4750, 4.3, 187, 1, 'https://www.google.com/maps/place/?q=place_id:ChIJp6yY7pqx...', '6am – 10pm', 1),
    (3, 'Conoil Station', 'Conoil', 'Ikeja GRA', '7 Mobolaji Bank-Anthony Way, Ikeja', 6.5833, 3.3500, 3.8, 93, 0, '', '7am – 9pm', 1),
    (4, 'Oando Express', 'Oando', 'Surulere', '22 Adeniran Ogunsanya St, Surulere', 6.4990, 3.3540, 4.1, 156, 1, 'https://www.google.com/maps/place/?q=place_id:ChIJk5gVRnwJ...', '24 hrs', 1),
    (5, 'Tholo Filling Station', 'Ardova', 'Maryland', '15 Ikorodu Road, Maryland, Lagos', -29.44740367505628, 27.71530668374899, 4.5, 112, 1, '', '6am – 11pm', 1),
    (6, 'MRS Petroleum', 'MRS', 'Gbagada', '3 Hospital Road, Gbagada, Lagos', 6.5430, 3.3800, 3.5, 47, 0, '', '7am – 8pm', 1);

INSERT OR IGNORE INTO FUEL_AVAILABILITY (availability_id, station_id, fuel_type_id, is_available, price_per_litre, quantity_in_stock) VALUES
    (1, 1, 1, 1, 617, 1200),
    (2, 1, 2, 1, 620, 800),
    (3, 1, 3, 1, 450, 500),
    (4, 2, 1, 1, 620, 1000),
    (5, 2, 2, 1, 621, 700),
    (6, 3, 2, 0, 622, 0),
    (7, 3, 3, 1, 455, 230),
    (8, 4, 1, 1, 615, 1100),
    (9, 4, 2, 1, 618, 450),
    (10, 5, 1, 1, 625, 510),
    (11, 5, 3, 1, 452, 220),
    (12, 6, 1, 0, 619, 0);
INSERT OR IGNORE INTO `USER` (`full_name`, `email`, `phone_number`, `password_hash`) VALUES ('Thandy', 'thandy@gmail.com', NULL, '$2b$10$40RrIvaX/9gbjXYTjN2pQOeDOozr6FzDAKiaxoEf2NTiL75JLuQYy');
