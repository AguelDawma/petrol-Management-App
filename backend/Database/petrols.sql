DROP SCHEMA IF EXISTS fuelnow_db ;
CREATE SCHEMA IF NOT EXISTS fuelnow_db;
USE fuelnow_db;

-- 1. Create FUEL_TYPE Table
CREATE TABLE IF NOT EXISTS FUEL_TYPE (
    fuel_type_id INT PRIMARY KEY AUTO_INCREMENT,
    fuel_name VARCHAR(255) NOT NULL,
    fuel_code VARCHAR(50) NOT NULL UNIQUE,
    fuel_price DECIMAL(10, 2) NOT NULL
);

-- 2. Create FILLING_STATION Table
CREATE TABLE IF NOT EXISTS FILLING_STATION (
    station_id INT PRIMARY KEY AUTO_INCREMENT,
    station_name VARCHAR(255) NOT NULL,
    brand VARCHAR(100) NOT NULL,
    area VARCHAR(100) NOT NULL,
    address TEXT NOT NULL,
    latitude DOUBLE NOT NULL,
    longitude DOUBLE NOT NULL,
    rating DECIMAL(3, 2) DEFAULT 0,
    reviews INT DEFAULT 0,
    available BOOLEAN DEFAULT TRUE,
    maps_url TEXT NULL,
    operating_hours VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 3. Create FUEL_AVAILABILITY Table
CREATE TABLE IF NOT EXISTS FUEL_AVAILABILITY (
    availability_id INT PRIMARY KEY AUTO_INCREMENT,
    station_id INT NOT NULL,
    fuel_type_id INT NOT NULL,
    is_available BOOLEAN NOT NULL DEFAULT FALSE,
    price_per_litre DECIMAL(10, 2) NOT NULL,
    quantity_in_stock DECIMAL(10, 2) NULL,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_station FOREIGN KEY (station_id) REFERENCES FILLING_STATION(station_id) ON DELETE CASCADE,
    CONSTRAINT fk_fuel_type FOREIGN KEY (fuel_type_id) REFERENCES FUEL_TYPE(fuel_type_id) ON DELETE CASCADE,
    UNIQUE (station_id, fuel_type_id)
);

-- 4. Create USER Table
-- Note: 'USER' is a reserved word in MySQL; it's better to use 'USERS' or backticks `USER`
CREATE TABLE IF NOT EXISTS `USER` (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone_number VARCHAR(20),
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- INSERT DATA
INSERT IGNORE INTO FUEL_TYPE (fuel_type_id, fuel_name, fuel_code, fuel_price) VALUES
    (1, 'Premium Motor Spirit', 'ULD95', 617),
    (2, 'Diesel', '50PPM', 620),
    (3, 'ULD93', 'ULD93', 450);

INSERT IGNORE INTO FILLING_STATION (station_id, station_name, brand, area, address, latitude, longitude, rating, reviews, available, maps_url, operating_hours, is_active) VALUES
    (1, 'Shell Maseru', 'Shell', 'Kingsway', '123 Kingsway Road, Maseru', -29.6109, 27.5554, 4.7, 214, 1, 'https://www.google.com/maps/place/?q=place_id:ChIJ7aVxnOTH...','24 hrs', '24 hrs', 1),
    (2, 'BP Maseru', 'BP', 'Main North Road', '45 Main North Road, Maseru', -29.6120, 27.5560, 4.3, 187, 1, 'https://www.google.com/maps/place/?q=place_id:ChIJp6yY7pqx...', '6am – 10pm', 1),
    (3, 'Nyuma Filling Station', 'Nyuma', 'Ha Thetsane', '120 Ha Thetsane Road, Maseru', -29.6105, 27.5575, 3.8, 93, 0, '', '7am – 9pm', 1),
    (4, 'Lesedi Petrol Station', 'Lesedi', 'Qeme', '22 Qeme Main Road, Maseru', -29.6128, 27.5545, 4.1, 156, 1, 'https://www.google.com/maps/place/?q=place_id:ChIJk5gVRnwJ...', '24 hrs', 1),
    (5, 'Total Maseru', 'Total', 'Pioneer Road', '15 Pioneer Road, Maseru', -29.6100, 27.5580, 4.5, 112, 1, '', '6am – 11pm', 1),
    (6, 'Engen Maseru', 'Engen', 'Moshoeshoe Road', '3 Moshoeshoe Road, Maseru', -29.6130, 27.5540, 3.5, 47, 0, '', '7am – 8pm', 1);

INSERT IGNORE INTO FUEL_AVAILABILITY (availability_id, station_id, fuel_type_id, is_available, price_per_litre, quantity_in_stock) VALUES
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
    (12, 6, 1, 0, 619, 0);INSERT IGNORE INTO `USER` (`full_name`, `email`, `phone_number`, `password_hash`) VALUES ('Thandy', 'thandy@gmail.com', NULL, '$2b$10$40RrIvaX/9gbjXYTjN2pQOeDOozr6FzDAKiaxoEf2NTiL75JLuQYy');
INSERT IGNORE INTO `USER` (`full_name`, `email`, `phone_number`, `password_hash`) VALUES ('Test User', 'test_automation@example.com', '123', '$2b$10$iwZYNZP7i1OSq.whWKTPr.bplLfzb9dsbeKhE1nrZgl9OoVQw3kNO');
INSERT IGNORE INTO `USER` (`full_name`, `email`, `phone_number`, `password_hash`) VALUES ('Thapelo', 'thapelo@gmail.com', NULL, '$2b$10$vMK/tIA78GetPrqZ0iHtqO8nauBo4TnhTtSg1hHfWxnEUYDzNV2Bi');
INSERT IGNORE INTO `USER` (`full_name`, `email`, `phone_number`, `password_hash`) VALUES ('Test User', 'test@example.com', NULL, '$2b$10$hS10F0uEcS64e/JH1dxQwuMKK6WjdGiYibwcRT2UC/pGop7O8mFda');
INSERT IGNORE INTO `USER` (`full_name`, `email`, `phone_number`, `password_hash`) VALUES ('Mirror', 'mirror@gmail.com', NULL, '$2b$10$LCN7oh0gYFJ.xYbeTD2py.YkQdh//jMVWy94SltqVaI7Rsay9jhuy');
INSERT IGNORE INTO `USER` (`full_name`, `email`, `phone_number`, `password_hash`) VALUES ('Test User2', 'test2@example.com', NULL, '$2b$10$lgpfmjHEI9vt3OQp74YLzexUXICHGnickP.kUW1x0FcrpoyyXQmWy');
INSERT IGNORE INTO `USER` (`full_name`, `email`, `phone_number`, `password_hash`) VALUES ('Thapelo Peter', 'thapelopeter@gmail.com', NULL, '$2b$10$5Y.c.FCv28/z.ESAyjRdgu0XkfvVKGCHO.zvG7m7oQY68zxsgmkIa');
INSERT OR IGNORE INTO FILLING_STATION (`station_name`, `brand`, `area`, `address`, `latitude`, `longitude`, `operating_hours`, `is_active`) VALUES ('Unnamed Station', 'Unknown Brand', 'Unknown Area', 'No address', 6.5853878, 3.390152, '24 hrs', 1);
INSERT OR IGNORE INTO FILLING_STATION (`station_name`, `brand`, `area`, `address`, `latitude`, `longitude`, `operating_hours`, `is_active`) VALUES ('Total', 'Unknown Brand', 'Unknown Area', 'No address', 6.4713433, 3.3087395, '24 hrs', 1);
INSERT OR IGNORE INTO FILLING_STATION (`station_name`, `brand`, `area`, `address`, `latitude`, `longitude`, `operating_hours`, `is_active`) VALUES ('Mobil', 'Unknown Brand', 'Unknown Area', 'No address', 6.4706725, 3.3070614, '24 hrs', 1);
INSERT OR IGNORE INTO FILLING_STATION (`station_name`, `brand`, `area`, `address`, `latitude`, `longitude`, `operating_hours`, `is_active`) VALUES ('NNPC', 'Unknown Brand', 'Unknown Area', 'No address', 6.4701325, 3.3221809, '24 hrs', 1);
INSERT OR IGNORE INTO FILLING_STATION (`station_name`, `brand`, `area`, `address`, `latitude`, `longitude`, `operating_hours`, `is_active`) VALUES ('Forte oil', 'Unknown Brand', 'Unknown Area', 'No address', 6.4480234, 3.4705923, '24 hrs', 1);
INSERT OR IGNORE INTO FILLING_STATION (`station_name`, `brand`, `area`, `address`, `latitude`, `longitude`, `operating_hours`, `is_active`) VALUES ('Unnamed Station', 'Unknown Brand', 'Unknown Area', 'No address', 6.5618084, 3.3218642, '24 hrs', 1);
INSERT OR IGNORE INTO FILLING_STATION (`station_name`, `brand`, `area`, `address`, `latitude`, `longitude`, `operating_hours`, `is_active`) VALUES ('Total', 'Total', 'Unknown Area', 'No address', 6.4509366, 3.4011958, '24 hrs', 1);
INSERT OR IGNORE INTO FILLING_STATION (`station_name`, `brand`, `area`, `address`, `latitude`, `longitude`, `operating_hours`, `is_active`) VALUES ('Forte Oil', 'Unknown Brand', 'Unknown Area', 'No address', 6.4345895, 3.4556197, '24 hrs', 1);
INSERT OR IGNORE INTO FILLING_STATION (`station_name`, `brand`, `area`, `address`, `latitude`, `longitude`, `operating_hours`, `is_active`) VALUES ('CONOIL', 'Unknown Brand', 'Unknown Area', 'No address', 6.5543468, 3.3242262, '24 hrs', 1);
INSERT OR IGNORE INTO FILLING_STATION (`station_name`, `brand`, `area`, `address`, `latitude`, `longitude`, `operating_hours`, `is_active`) VALUES ('Forte Oil', 'Unknown Brand', 'Unknown Area', 'No address', 6.4482134, 3.4051122, '24 hrs', 1);
INSERT OR IGNORE INTO FILLING_STATION (`station_name`, `brand`, `area`, `address`, `latitude`, `longitude`, `operating_hours`, `is_active`) VALUES ('Forte Oil', 'Unknown Brand', 'Unknown Area', 'No address', 6.4524343, 3.419849, '24 hrs', 1);
INSERT OR IGNORE INTO FILLING_STATION (`station_name`, `brand`, `area`, `address`, `latitude`, `longitude`, `operating_hours`, `is_active`) VALUES ('Forte Oil', 'Unknown Brand', 'Unknown Area', 'No address', 6.539388, 3.3073124, '24 hrs', 1);
INSERT OR IGNORE INTO FILLING_STATION (`station_name`, `brand`, `area`, `address`, `latitude`, `longitude`, `operating_hours`, `is_active`) VALUES ('Petrocam', 'Unknown Brand', 'Unknown Area', 'No address', 6.5405031, 3.3185333, '24 hrs', 1);
INSERT OR IGNORE INTO FILLING_STATION (`station_name`, `brand`, `area`, `address`, `latitude`, `longitude`, `operating_hours`, `is_active`) VALUES ('Nationwide', 'Unknown Brand', 'Unknown Area', 'No address', 6.5373007, 3.3049653, '24 hrs', 1);
INSERT OR IGNORE INTO FILLING_STATION (`station_name`, `brand`, `area`, `address`, `latitude`, `longitude`, `operating_hours`, `is_active`) VALUES ('Unnamed Station', 'Unknown Brand', 'Unknown Area', 'No address', 6.5392384, 3.3023658, '24 hrs', 1);
INSERT OR IGNORE INTO FILLING_STATION (`station_name`, `brand`, `area`, `address`, `latitude`, `longitude`, `operating_hours`, `is_active`) VALUES ('Mubostic', 'Unknown Brand', 'Unknown Area', 'No address', 6.5415461, 3.3080571, '24 hrs', 1);
INSERT OR IGNORE INTO FILLING_STATION (`station_name`, `brand`, `area`, `address`, `latitude`, `longitude`, `operating_hours`, `is_active`) VALUES ('Destiny', 'Unknown Brand', 'Unknown Area', 'No address', 6.5393566, 3.3114677, '24 hrs', 1);
INSERT OR IGNORE INTO FILLING_STATION (`station_name`, `brand`, `area`, `address`, `latitude`, `longitude`, `operating_hours`, `is_active`) VALUES ('Total', 'Total', 'Unknown Area', 'No address', 6.4541021, 3.4027421, '24 hrs', 1);
INSERT OR IGNORE INTO FILLING_STATION (`station_name`, `brand`, `area`, `address`, `latitude`, `longitude`, `operating_hours`, `is_active`) VALUES ('Unnamed Station', 'Unknown Brand', 'Unknown Area', 'No address', 6.4884539, 3.3001919, '24 hrs', 1);
INSERT OR IGNORE INTO FILLING_STATION (`station_name`, `brand`, `area`, `address`, `latitude`, `longitude`, `operating_hours`, `is_active`) VALUES ('Total Oshodi', 'Total', 'Unknown Area', 'No address', 6.5588514, 3.3640983, '24 hrs', 1);
INSERT OR IGNORE INTO FILLING_STATION (`station_name`, `brand`, `area`, `address`, `latitude`, `longitude`, `operating_hours`, `is_active`) VALUES ('Fatgbems', 'Unknown Brand', 'Unknown Area', 'No address', 6.4647172, 3.3175165, '24 hrs', 1);
INSERT OR IGNORE INTO FILLING_STATION (`station_name`, `brand`, `area`, `address`, `latitude`, `longitude`, `operating_hours`, `is_active`) VALUES ('Forte Oil', 'Forte Oil', 'Unknown Area', 'No address', 6.4719302, 3.324101, '24 hrs', 1);
INSERT OR IGNORE INTO FILLING_STATION (`station_name`, `brand`, `area`, `address`, `latitude`, `longitude`, `operating_hours`, `is_active`) VALUES ('Conoil', 'Conoil', 'Unknown Area', 'No address', 6.5057279, 3.3230026, '24 hrs', 1);
INSERT OR IGNORE INTO FILLING_STATION (`station_name`, `brand`, `area`, `address`, `latitude`, `longitude`, `operating_hours`, `is_active`) VALUES ('MRS', 'MRS', 'Unknown Area', 'No address', 6.4889228, 3.325249, '24 hrs', 1);
INSERT OR IGNORE INTO FILLING_STATION (`station_name`, `brand`, `area`, `address`, `latitude`, `longitude`, `operating_hours`, `is_active`) VALUES ('Mobil', 'Mobil', 'Unknown Area', 'No address', 6.5531341, 3.3673677, '24 hrs', 1);
INSERT OR IGNORE INTO FILLING_STATION (`station_name`, `brand`, `area`, `address`, `latitude`, `longitude`, `operating_hours`, `is_active`) VALUES ('Mobil', 'Mobil', 'Unknown Area', 'No address', 6.5720715, 3.3672259, '24 hrs', 1);
INSERT OR IGNORE INTO FILLING_STATION (`station_name`, `brand`, `area`, `address`, `latitude`, `longitude`, `operating_hours`, `is_active`) VALUES ('Oando', 'Oando', 'Unknown Area', 'No address', 6.5713954, 3.3672174, '24 hrs', 1);
INSERT OR IGNORE INTO FILLING_STATION (`station_name`, `brand`, `area`, `address`, `latitude`, `longitude`, `operating_hours`, `is_active`) VALUES ('Adonai', 'Unknown Brand', 'Unknown Area', 'No address', 6.5519457, 3.3414844, '24 hrs', 1);
INSERT OR IGNORE INTO FILLING_STATION (`station_name`, `brand`, `area`, `address`, `latitude`, `longitude`, `operating_hours`, `is_active`) VALUES ('Unnamed Station', 'Unknown Brand', 'Unknown Area', 'No address', 6.4920986, 3.3757771, '24 hrs', 1);
INSERT OR IGNORE INTO FILLING_STATION (`station_name`, `brand`, `area`, `address`, `latitude`, `longitude`, `operating_hours`, `is_active`) VALUES ('Unnamed Station', 'Unknown Brand', 'Unknown Area', 'No address', 6.5845036, 3.3897769, '24 hrs', 1);
INSERT OR IGNORE INTO FILLING_STATION (`station_name`, `brand`, `area`, `address`, `latitude`, `longitude`, `operating_hours`, `is_active`) VALUES ('Unnamed Station', 'Unknown Brand', 'Unknown Area', 'No address', 6.5815761, 3.3934106, '24 hrs', 1);
INSERT OR IGNORE INTO FILLING_STATION (`station_name`, `brand`, `area`, `address`, `latitude`, `longitude`, `operating_hours`, `is_active`) VALUES ('Unnamed Station', 'Unknown Brand', 'Unknown Area', 'No address', 6.5810502, 3.3928851, '24 hrs', 1);
