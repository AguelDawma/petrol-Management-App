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
    (1, 'Premium Motor Spirit', 'PMS', 617),
    (2, 'Diesel', 'AGO', 620),
    (3, 'LPG', 'LPG', 450);

INSERT OR IGNORE INTO FILLING_STATION (station_id, station_name, brand, area, address, latitude, longitude, rating, reviews, available, maps_url, operating_hours, is_active, phone_number, manager_name) VALUES
    (1, 'NNPC Mega Station', 'NNPC', 'Victoria Island', '12 Adeola Odeku St, VI, Lagos', 6.4281, 3.4219, 4.7, 214, 1, 'https://www.google.com/maps/place/?q=place_id:ChIJ7aVxnOTH...','24 hrs', 1, '+234-800-123-4567', 'John Smith'),
    (2, 'TotalEnergies', 'Total', 'Lekki Phase 1', '45 Admiralty Way, Lekki, Lagos', 6.4350, 3.4750, 4.3, 187, 1, 'https://www.google.com/maps/place/?q=place_id:ChIJp6yY7pqx...', '6am – 10pm', 1, '+234-801-234-5678', 'Sarah Johnson'),
    (3, 'Conoil Station', 'Conoil', 'Ikeja GRA', '7 Mobolaji Bank-Anthony Way, Ikeja', 6.5833, 3.3500, 3.8, 93, 0, '', '7am – 9pm', 1, '+234-802-345-6789', 'Michael Brown'),
    (4, 'Oando Express', 'Oando', 'Surulere', '22 Adeniran Ogunsanya St, Surulere', 6.4990, 3.3540, 4.1, 156, 1, 'https://www.google.com/maps/place/?q=place_id:ChIJk5gVRnwJ...', '24 hrs', 1, '+234-803-456-7890', 'David Wilson'),
    (5, 'Ardova Filling Station', 'Ardova', 'Maryland', '15 Ikorodu Road, Maryland, Lagos', 6.5200, 3.3950, 4.5, 112, 1, '', '6am – 11pm', 1, '+234-804-567-8901', 'Patricia Moore'),
    (6, 'MRS Petroleum', 'MRS', 'Gbagada', '3 Hospital Road, Gbagada, Lagos', 6.5430, 3.3800, 3.5, 47, 0, '', '7am – 8pm', 1, '+234-805-678-9012', 'Samuel Taylor'),
    (7, 'Shell Service Station', 'Shell', 'Ikoyi', '88 Awolowo Road, Ikoyi, Lagos', 6.4620, 3.4080, 4.6, 198, 1, '', '24 hrs', 1, '+234-806-789-0123', 'Jennifer Davis'),
    (8, 'Petrocam Station', 'Petrocam', 'Bariga', '34 Ikorodu Road, Bariga, Lagos', 6.5180, 3.3770, 3.9, 76, 1, '', '6am – 10pm', 1, '+234-807-890-1234', 'Robert Anderson'),
    (9, 'NNPC Mega Station II', 'NNPC', 'Ajah', '200 Lekki-Epe Expressway, Ajah', 6.3890, 3.5450, 4.4, 165, 1, '', '24 hrs', 1, '+234-808-901-2345', 'Maria Garcia'),
    (10, 'Fuel Express', 'Fuel Express', 'Yaba', '50 Sabo Road, Yaba, Lagos', 6.5080, 3.3580, 3.7, 88, 0, '', '6am – 9pm', 1, '+234-809-012-3456', 'Thomas White');

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
    ('Thandy Mthembu', 'thandy@gmail.com', '+256-700-123456', '$2b$10$40RrIvaX/9gbjXYTjN2pQOeDOozr6FzDAKiaxoEf2NTiL75JLuQYy', 'customer'),
    ('Test User', 'test_automation@example.com', '123', '$2b$10$iwZYNZP7i1OSq.whWKTPr.bplLfzb9dsbeKhE1nrZgl9OoVQw3kNO', 'customer'),
    ('Thapelo Mthembu', 'thapelo@gmail.com', '+256-700-654321', '$2b$10$vMK/tIA78GetPrqZ0iHtqO8nauBo4TnhTtSg1hHfWxnEUYDzNV2Bi', 'customer'),
    ('Admin User', 'admin@petrolpeek.com', '+256-701-111111', '$2b$10$Admin.Hash.Here.For.Testing.Only.Secure.Password.Hash', 'admin'),
    ('James Kimani', 'james.kimani@gmail.com', '+254-722-333444', '$2b$10$9KU/4dXFYjPQkLmNvW2zNuAaB1C2D3E4F5G6H7I8J9K0L1M2N3O4', 'customer'),
    ('Mary Okonkwo', 'mary.okonkwo@gmail.com', '+234-701-555666', '$2b$10$PQ5R6S7T8U9V0W1X2Y3Z4A5B6C7D8E9F0G1H2I3J4K5L6M7N8O9P', 'customer'),
    ('Peter Mwangi', 'peter.mwangi@gmail.com', '+254-723-777888', '$2b$10$Q0R1S2T3U4V5W6X7Y8Z9A0B1C2D3E4F5G6H7I8J9K0L1M2N3O4P5', 'customer');

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
    (1, 1, 1, 'FUEL_PURCHASE', 'Purchased 50L of PMS at 617/L', 'completed'),
    (2, 2, 2, 'FUEL_PURCHASE', 'Purchased 40L of AGO at 621/L', 'completed'),
    (3, 3, 4, 'FUEL_PURCHASE', 'Purchased 35L of PMS at 615/L', 'completed'),
    (4, 4, 5, 'FUEL_PURCHASE', 'Purchased 60L of LPG at 452/L', 'completed'),
    (5, 5, 1, 'FUEL_PURCHASE', 'Purchased 45L of AGO at 620/L', 'completed'),
    (6, 6, 7, 'FUEL_PURCHASE', 'Purchased 55L of PMS at 616/L', 'completed'),
    (7, 7, 8, 'FUEL_PURCHASE', 'Purchased 50L of AGO at 621/L', 'completed'),
    (8, 1, 9, 'REVIEW_POSTED', 'Posted 5-star review', 'completed'),
    (9, 2, 2, 'REVIEW_POSTED', 'Posted 4-star review', 'completed'),
    (10, 3, 3, 'STATION_VIEWED', 'Viewed station details', 'completed'),
    (11, 4, 4, 'DIRECTIONS_REQUEST', 'Requested directions', 'completed'),
    (12, 5, 5, 'PRICE_CHECK', 'Checked fuel prices', 'completed');
INSERT OR IGNORE INTO `USER` (`full_name`, `email`, `phone_number`, `password_hash`) VALUES ('Test User', 'test@example.com', NULL, '$2b$10$hS10F0uEcS64e/JH1dxQwuMKK6WjdGiYibwcRT2UC/pGop7O8mFda');
INSERT OR IGNORE INTO `USER` (`full_name`, `email`, `phone_number`, `password_hash`) VALUES ('Mirror', 'mirror@gmail.com', NULL, '$2b$10$LCN7oh0gYFJ.xYbeTD2py.YkQdh//jMVWy94SltqVaI7Rsay9jhuy');
INSERT OR IGNORE INTO `USER` (`full_name`, `email`, `phone_number`, `password_hash`) VALUES ('Test User2', 'test2@example.com', NULL, '$2b$10$lgpfmjHEI9vt3OQp74YLzexUXICHGnickP.kUW1x0FcrpoyyXQmWy');
INSERT OR IGNORE INTO `USER` (`full_name`, `email`, `phone_number`, `password_hash`) VALUES ('Thapelo Peter', 'thapelopeter@gmail.com', NULL, '$2b$10$5Y.c.FCv28/z.ESAyjRdgu0XkfvVKGCHO.zvG7m7oQY68zxsgmkIa');
INSERT OR IGNORE INTO `USER` (`full_name`, `email`, `phone_number`, `password_hash`) VALUES ('Debug User', 'test+ppfhfu@example.com', '1234567890', '$2b$10$WjWnwtjvtffT79o3ArNNa.qI.Rsj/aEh8ZSGdcW2PC/W1ktMLleAu');
INSERT OR IGNORE INTO `USER` (`full_name`, `email`, `phone_number`, `password_hash`) VALUES ('Debug User 2', 'test+acjvsz@example.com', '1234567890', '$2b$10$I7aXHPpsqxNPz4yCnyco7OKTXQqIA8b5jEpbM/MufwuANzoXf5mD2');
INSERT OR IGNORE INTO `USER` (`full_name`, `email`, `phone_number`, `password_hash`) VALUES ('Smoke Test User', 'test+oabeex@example.com', '1234567890', '$2b$10$Wp8gyMBgOJaIXWgcP0299e04/S4.OuPk5L/gfbrcrzgLEWozANfii');
INSERT OR IGNORE INTO `USER` (`full_name`, `email`, `phone_number`, `password_hash`) VALUES ('Thapelo', 'thapelo@petrolpeek.com', NULL, '$2b$10$ih2dnA6byQTS2si9.Auisef9SeC2hBuLZpGYAZ2OgzfLaqexVxn1W');
