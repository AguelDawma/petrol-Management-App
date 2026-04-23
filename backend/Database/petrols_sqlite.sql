-- Fuel Type Table
CREATE TABLE IF NOT EXISTS FUEL_TYPE (
    fuel_type_id INTEGER PRIMARY KEY AUTOINCREMENT,
    fuel_name TEXT NOT NULL,
    fuel_code TEXT NOT NULL UNIQUE,
    fuel_price REAL NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Filling Station Table (Main Entity)
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
    phone_number TEXT,
    manager_name TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Fuel Availability Table
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

-- User Table for authentication
CREATE TABLE IF NOT EXISTS USER (
    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone_number TEXT,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'customer',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Station Review Table (for reports)
CREATE TABLE IF NOT EXISTS STATION_REVIEW (
    review_id INTEGER PRIMARY KEY AUTOINCREMENT,
    station_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
    review_text TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (station_id) REFERENCES FILLING_STATION(station_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES USER(user_id) ON DELETE CASCADE
);

-- Transaction Log Table (for transaction logic)
CREATE TABLE IF NOT EXISTS TRANSACTION_LOG (
    transaction_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    station_id INTEGER,
    transaction_type TEXT NOT NULL,
    transaction_details TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    status TEXT DEFAULT 'completed',
    FOREIGN KEY (user_id) REFERENCES USER(user_id) ON DELETE SET NULL,
    FOREIGN KEY (station_id) REFERENCES FILLING_STATION(station_id) ON DELETE SET NULL
);

-- Create indexes for optimization
CREATE INDEX IF NOT EXISTS idx_station_area ON FILLING_STATION(area);
CREATE INDEX IF NOT EXISTS idx_station_brand ON FILLING_STATION(brand);
CREATE INDEX IF NOT EXISTS idx_station_active ON FILLING_STATION(is_active);
CREATE INDEX IF NOT EXISTS idx_fuel_availability_station ON FUEL_AVAILABILITY(station_id);
CREATE INDEX IF NOT EXISTS idx_fuel_availability_fuel_type ON FUEL_AVAILABILITY(fuel_type_id);
CREATE INDEX IF NOT EXISTS idx_user_email ON USER(email);
CREATE INDEX IF NOT EXISTS idx_review_station ON STATION_REVIEW(station_id);
CREATE INDEX IF NOT EXISTS idx_transaction_user ON TRANSACTION_LOG(user_id);
CREATE INDEX IF NOT EXISTS idx_transaction_type ON TRANSACTION_LOG(transaction_type);

INSERT OR IGNORE INTO FUEL_TYPE (fuel_type_id, fuel_name, fuel_code, fuel_price) VALUES
    (1, 'Unleaded Petrol 95', 'ULD95', 23.30),
    (2, 'Diesel', '50PPM', 30.50),
    (3, 'Unleaded Petrol 93', 'ULD93', 22.50);

INSERT OR IGNORE INTO FILLING_STATION (station_name, brand, area, address, latitude, longitude, rating, reviews, available, maps_url, operating_hours, is_active, phone_number, manager_name) VALUES
    ('Unnamed Station', 'Unnamed Station', 'Unknown Area', 'No address', -29.29349935, 27.518469925, 0, 0, 1, 'https://www.openstreetmap.org/?mlat=-29.29349935&mlon=27.518469925&zoom=17', '24 hrs', 1, NULL, NULL),
    ('Puma', 'Puma', 'Maseru', 'Maseru', -29.310610542857145, 27.488018314285714, 0, 0, 1, 'https://www.openstreetmap.org/?mlat=-29.310610542857145&mlon=27.488018314285714&zoom=17', '24 hrs', 1, NULL, NULL),
    ('Total', 'Total', 'Corner Upper Thamae, Maseru', 'Corner Upper Thamae Rd & Main South 1', -29.3340542, 27.50905980909091, 0, 0, 1, 'https://www.openstreetmap.org/?mlat=-29.3340542&mlon=27.50905980909091&zoom=17', '24 hrs', 1, NULL, NULL),
    ('mother and sons filling station', 'mother and sons filling station', 'Mothers and Sons', 'No address', -29.40273328, 27.565350619999997, 0, 0, 1, 'https://www.openstreetmap.org/?mlat=-29.40273328&mlon=27.565350619999997&zoom=17', '24 hrs', 1, NULL, NULL),
    ('Unnamed Station', 'Unnamed Station', 'Unknown Area', 'Main South', -29.3355330125, 27.5094929, 0, 0, 1, 'https://www.openstreetmap.org/?mlat=-29.3355330125&mlon=27.5094929&zoom=17', '24 hrs', 1, NULL, NULL),
    ('Unnamed Station', 'Unnamed Station', 'Unknown Area', 'No address', -29.31683936, 27.483490940000003, 0, 0, 1, 'https://www.openstreetmap.org/?mlat=-29.31683936&mlon=27.483490940000003&zoom=17', '24 hrs', 1, NULL, NULL),
    ('Sekautu Tholo Filling Station', 'Tholo', 'Tholo Roma Ha Sekautu', 'No address', -29.44738822, 27.715465719999997, 0, 0, 1, 'https://www.openstreetmap.org/?mlat=-29.44738822&mlon=27.715465719999997&zoom=17', '08:00-21:00', 1, NULL, NULL),
    ('Puma', 'Puma', 'Unknown Area', 'Thabong Link', -29.3150731, 27.5106857, 0, 0, 1, 'https://www.openstreetmap.org/?mlat=-29.3150731&mlon=27.5106857&zoom=17', '24 hrs', 1, NULL, NULL),
    ('Puma', 'Puma', 'Unknown Area', 'Principal Highway', -29.3687621, 27.5377439, 0, 0, 1, 'https://www.openstreetmap.org/?mlat=-29.3687621&mlon=27.5377439&zoom=17', '24 hrs', 1, NULL, NULL),
    ('Ha Mots''oeneng Filling station', 'Ha Mots''oeneng Filling station', 'Unknown Area', 'No address', -29.3475657, 27.5184829, 0, 0, 1, 'https://www.openstreetmap.org/?mlat=-29.3475657&mlon=27.5184829&zoom=17', '24 hrs', 1, NULL, NULL),
    ('Lake Site Filling Station', 'Lake Site Filling Station', 'Unknown Area', 'No address', -29.3127952, 27.5100366, 0, 0, 1, 'https://www.openstreetmap.org/?mlat=-29.3127952&mlon=27.5100366&zoom=17', '24 hrs', 1, NULL, NULL),
    ('Mochaochele', 'Shell', 'Unknown Area', 'No address', -29.4113716, 27.6194745, 0, 0, 1, 'https://www.openstreetmap.org/?mlat=-29.4113716&mlon=27.6194745&zoom=17', '24 hrs', 1, NULL, NULL),
    ('Pioneer Filling Station', 'Engen', 'Pioneer, Maseru', 'Pioneer Road', -29.3147122, 27.4794926, 0, 0, 1, 'https://www.openstreetmap.org/?mlat=-29.3147122&mlon=27.4794926&zoom=17', 'Mo-Su,PH 00:00+', 1, NULL, NULL),
    ('Unnamed Station', 'Unnamed Station', 'Unknown Area', 'No address', -29.4196271, 27.561662, 0, 0, 1, 'https://www.openstreetmap.org/?mlat=-29.4196271&mlon=27.561662&zoom=17', '24 hrs', 1, NULL, NULL),
    ('Sparrows', 'Puma', 'Unknown Area', 'Dove Road', -29.3157524, 27.4799403, 0, 0, 1, 'https://www.openstreetmap.org/?mlat=-29.3157524&mlon=27.4799403&zoom=17', '24 hrs', 1, NULL, NULL),
    ('Engen', 'Engen', 'Unknown Area', 'No address', -29.3373962, 27.5107428, 0, 0, 1, 'https://www.openstreetmap.org/?mlat=-29.3373962&mlon=27.5107428&zoom=17', '24 hrs', 1, NULL, NULL),
    ('PUMA', 'Puma', 'Unknown Area', 'No address', -29.6228558, 27.4963254, 0, 0, 1, 'https://www.openstreetmap.org/?mlat=-29.6228558&mlon=27.4963254&zoom=17', '24 hrs', 1, NULL, NULL),
    ('Puma', 'Puma', 'Unknown Area', 'No address', -29.4028343, 27.564891, 0, 0, 1, 'https://www.openstreetmap.org/?mlat=-29.4028343&mlon=27.564891&zoom=17', '24 hrs', 1, NULL, NULL),
    ('Puma', 'Puma', 'Unknown Area', 'No address', -29.319583, 27.4960617, 0, 0, 1, 'https://www.openstreetmap.org/?mlat=-29.319583&mlon=27.4960617&zoom=17', '24 hrs', 1, NULL, NULL),
    ('Total', 'Total', 'Unknown Area', 'No address', -29.4024404, 27.7952082, 0, 0, 1, 'https://www.openstreetmap.org/?mlat=-29.4024404&mlon=27.7952082&zoom=17', '24 hrs', 1, NULL, NULL),
    ('Puma', 'Puma', 'Unknown Area', 'Pope John Paul II Road', -29.3323966, 27.4856952, 0, 0, 1, 'https://www.openstreetmap.org/?mlat=-29.3323966&mlon=27.4856952&zoom=17', '24/7', 1, NULL, NULL),
    ('Masianokeng Filling Station', 'Puma', 'Masianokeng', 'Principal Highway', -29.4044703, 27.5618515, 0, 0, 1, 'https://www.openstreetmap.org/?mlat=-29.4044703&mlon=27.5618515&zoom=17', '24/7', 1, NULL, NULL),
    ('Unnamed Station', 'Unnamed Station', 'Unknown Area', 'No address', -29.3610894, 27.528495, 0, 0, 1, 'https://www.openstreetmap.org/?mlat=-29.3610894&mlon=27.528495&zoom=17', '24 hrs', 1, NULL, NULL),
    ('Puma', 'Puma', 'Unknown Area', 'Main North 1', -29.3062787, 27.5146181, 0, 0, 1, 'https://www.openstreetmap.org/?mlat=-29.3062787&mlon=27.5146181&zoom=17', '24 hrs', 1, NULL, NULL),
    ('Puma', 'Puma', 'Unknown Area', 'No address', -29.3400753, 27.513741, 0, 0, 1, 'https://www.openstreetmap.org/?mlat=-29.3400753&mlon=27.513741&zoom=17', '24/7', 1, NULL, NULL),
    ('Roma Filling Station', 'Roma Filling Station', 'Roma', 'Roma', -29.4518024, 27.720777, 0, 0, 1, 'https://www.openstreetmap.org/?mlat=-29.4518024&mlon=27.720777&zoom=17', '24 hrs', 1, NULL, NULL),
    ('Total', 'TotalEnergies', 'Unknown Area', 'Main North 1', -29.2882647, 27.523698, 0, 0, 1, 'https://www.openstreetmap.org/?mlat=-29.2882647&mlon=27.523698&zoom=17', '24 hrs', 1, NULL, NULL);

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
    (12, 6, 1, 0, 619, 0),
    (13, 6, 2, 1, 623, 350),
    (14, 7, 1, 1, 616, 1300),
    (15, 7, 2, 1, 619, 900),
    (16, 7, 3, 1, 451, 600),
    (17, 8, 1, 1, 618, 950),
    (18, 8, 2, 1, 621, 550),
    (19, 9, 1, 1, 617, 1150),
    (20, 9, 2, 1, 620, 750),
    (21, 9, 3, 1, 450, 400),
    (22, 10, 1, 0, 619, 0),
    (23, 10, 2, 1, 622, 300);

INSERT OR IGNORE INTO `USER` (`full_name`, `email`, `phone_number`, `password_hash`, `role`) VALUES 
    ('Thandy Letseka', 'thandy@gmail.com', '+26657663456', '$2b$10$40RrIvaX/9gbjXYTjN2pQOeDOozr6FzDAKiaxoEf2NTiL75JLuQYy', 'customer'),
    ('Test User', 'test_automation@example.com', '123', '$2b$10$iwZYNZP7i1OSq.whWKTPr.bplLfzb9dsbeKhE1nrZgl9OoVQw3kNO', 'customer'),
    ('Thapelo Mrelaxo', 'thapelo@gmail.com', '+2665678901', '$2b$10$vMK/tIA78GetPrqZ0iHtqO8nauBo4TnhTtSg1hHfWxnEUYDzNV2Bi', 'customer'),
    ('Admin User', 'admin@petrolpeek.com', '5711111', '$2b$10$Admin.Hash.Here.For.Testing.Only.Secure.Password.Hash', 'admin'),
    ('James Kimani', 'james.kimani@gmail.com', '5670094', '$2b$10$9KU/4dXFYjPQkLmNvW2zNuAaB1C2D3E4F5G6H7I8J9K0L1M2N3O4', 'customer'),
    ('Mary Lekhooa', 'mary.lekhooa@gmail.com', '53456789', '$2b$10$PQ5R6S7T8U9V0W1X2Y3Z4A5B6C7D8E9F0G1H2I3J4K5L6M7N8O9P', 'customer'),
    ('Peter WaLeSystems', 'peter.walesystems@gmail.com', '567896445', '$2b$10$Q0R1S2T3U4V5W6X7Y8Z9A0B1C2D3E4F5G6H7I8J9K0L1M2N3O4P5', 'customer');

INSERT OR IGNORE INTO STATION_REVIEW (review_id, station_id, user_id, rating, review_text) VALUES
    (1, 1, 1, 5, 'Excellent service and very clean facilities'),
    (2, 1, 2, 4, 'Good prices, but queue is long during peak hours'),
    (3, 2, 3, 5, 'Best premium fuel quality in the area'),
    (4, 3, 4, 3, 'Average service, prices could be better'),
    (5, 4, 5, 4, 'Very professional staff, convenient location'),
    (6, 5, 6, 5, 'Clean facilities and friendly attendants'),
    (7, 7, 1, 5, 'Always has stock, 24hr service is reliable'),
    (8, 7, 2, 4, 'Good prices and location'),
    (9, 8, 3, 4, 'Decent fuel quality, polite staff'),
    (10, 9, 4, 5, 'Modern equipment and excellent maintenance'),
    (11, 2, 6, 4, 'Consistent pricing across locations'),
    (12, 5, 7, 5, 'Best customer service I have experienced');

INSERT OR IGNORE INTO TRANSACTION_LOG (transaction_id, user_id, station_id, transaction_type, transaction_details, status) VALUES
    (1, 1, 1, 'FUEL_PURCHASE', 'Purchased 50L of ULD95', 'completed'),
    (2, 2, 2, 'FUEL_PURCHASE', 'Purchased 40L of 50PPM', 'completed'),
    (3, 3, 4, 'FUEL_PURCHASE', 'Purchased 35L of ULD95', 'completed'),
    (4, 4, 5, 'FUEL_PURCHASE', 'Purchased 60L of ULD93', 'completed'),
    (5, 5, 1, 'FUEL_PURCHASE', 'Purchased 45L of 50PPM', 'completed'),
    (6, 6, 7, 'FUEL_PURCHASE', 'Purchased 55L of ULD95', 'completed'),
    (7, 7, 8, 'FUEL_PURCHASE', 'Purchased 50L of 50PPM', 'completed'),
    (8, 1, 9, 'REVIEW_POSTED', 'Posted 5-star review', 'completed'),
    (9, 2, 2, 'REVIEW_POSTED', 'Posted 4-star review', 'completed'),
    (10, 3, 3, 'STATION_VIEWED', 'Viewed station details', 'completed'),
    (11, 4, 4, 'DIRECTIONS_REQUEST', 'Requested directions', 'completed'),
    (12, 5, 5, 'PRICE_CHECK', 'Checked fuel prices', 'completed');
INSERT OR IGNORE INTO `USER` (`full_name`, `email`, `phone_number`, `password_hash`) VALUES ('Test User', 'test@example.com', NULL, '$2b$10$hS10F0uEcS64e/JH1dxQwuMKK6WjdGiYibwcRT2UC/pGop7O8mFda');
INSERT OR IGNORE INTO `USER` (`full_name`, `email`, `phone_number`, `password_hash`) VALUES ('Mirror', 'mirror@gmail.com', NULL, '$2b$10$LCN7oh0gYFJ.xYbeTD2py.YkQdh//jMVWy94SltqVaI7Rsay9jhuy');
INSERT OR IGNORE INTO `USER` (`full_name`, `email`, `phone_number`, `password_hash`) VALUES ('Test User2', 'test2@example.com', NULL, '$2b$10$lgpfmjHEI9vt3OQp74YLzexUXICHGnickP.kUW1x0FcrpoyyXQmWy');
INSERT OR IGNORE INTO `USER` (`full_name`, `email`, `phone_number`, `password_hash`) VALUES ('Thapelo Peter', 'thapelopeter@gmail.com', NULL, '$2b$10$5Y.c.FCv28/z.ESAyjRdgu0XkfvVKGCHO.zvG7m7oQY68zxsgmkIa');
