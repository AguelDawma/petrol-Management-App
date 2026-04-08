DROP SCHEMA IF EXISTS fuelnow_db ;
CREATE SCHEMA IF NOT EXISTS fuelnow_db;
USE fuelnow_db;

CREATE TABLE FUEL_TYPE (
    fuel_type_id   INT           PRIMARY KEY AUTO_INCREMENT,
    fuel_name      VARCHAR(50)   NOT NULL,
    fuel_code      VARCHAR(10)   NOT NULL UNIQUE,
    description    VARCHAR(200)  NULL,
    created_at     DATETIME      DEFAULT NOW()
);

CREATE TABLE FILLING_STATION (
    station_id      INT            PRIMARY KEY AUTO_INCREMENT,
    station_name    VARCHAR(100)   NOT NULL,
    brand           VARCHAR(100)   NOT NULL,
    address         VARCHAR(255)   NOT NULL,
    city            VARCHAR(100)   NOT NULL,
    state           VARCHAR(100)   NOT NULL,
    latitude        DECIMAL(9,6)   NOT NULL,
    longitude       DECIMAL(9,6)   NOT NULL,
    google_place_id VARCHAR(255)   NULL,
    maps_url        VARCHAR(500)   NULL,
    phone_number    VARCHAR(20)    NULL,
    operating_hours VARCHAR(100)   NOT NULL,
    is_24hrs        BOOLEAN        DEFAULT FALSE,
    is_active       BOOLEAN        DEFAULT TRUE,
    created_at      DATETIME       DEFAULT NOW(),
    updated_at      DATETIME       DEFAULT NOW() ON UPDATE NOW()
);

CREATE TABLE FUEL_AVAILABILITY (
    availability_id   INT             PRIMARY KEY AUTO_INCREMENT,
    station_id        INT             NOT NULL,
    fuel_type_id      INT             NOT NULL,
    is_available      BOOLEAN         NOT NULL DEFAULT FALSE,
    price_per_litre   DECIMAL(10,2)   NOT NULL,
    quantity_in_stock DECIMAL(10,2)   NULL,
    last_updated      DATETIME        DEFAULT NOW() ON UPDATE NOW(),

    FOREIGN KEY (station_id)   REFERENCES FILLING_STATION(station_id) ON DELETE CASCADE,
    FOREIGN KEY (fuel_type_id) REFERENCES FUEL_TYPE(fuel_type_id)     ON DELETE CASCADE,

    -- Prevent duplicate fuel entries per station
    UNIQUE KEY unique_station_fuel (station_id, fuel_type_id)
);

CREATE TABLE USER (
    user_id       INT           PRIMARY KEY AUTO_INCREMENT,
    full_name     VARCHAR(100)  NOT NULL,
    email         VARCHAR(150)  NOT NULL UNIQUE,
    phone_number  VARCHAR(20)   NULL,
    password_hash VARCHAR(255)  NOT NULL,
    is_active     BOOLEAN       DEFAULT TRUE,
    created_at    DATETIME      DEFAULT NOW(),
    last_login    DATETIME      NULL,
    updated_at    DATETIME      DEFAULT NOW() ON UPDATE NOW()
);

CREATE TABLE USER_LOCATION (
    location_id   INT           PRIMARY KEY AUTO_INCREMENT,
    user_id       INT           NOT NULL,
    latitude      DECIMAL(9,6)  NOT NULL,
    longitude     DECIMAL(9,6)  NOT NULL,
    address_label VARCHAR(255)  NULL,
    recorded_at   DATETIME      DEFAULT NOW(),

    FOREIGN KEY (user_id) REFERENCES USER(user_id) ON DELETE CASCADE
);

CREATE TABLE SEARCH_HISTORY (
    search_id         INT           PRIMARY KEY AUTO_INCREMENT,
    user_id           INT           NOT NULL,
    search_latitude   DECIMAL(9,6)  NOT NULL,
    search_longitude  DECIMAL(9,6)  NOT NULL,
    fuel_type_id      INT           NULL,
    max_radius_km     DECIMAL(5,2)  DEFAULT 5.00,
    results_found     INT           DEFAULT 0,
    searched_at       DATETIME      DEFAULT NOW(),

    FOREIGN KEY (user_id)      REFERENCES USER(user_id)          ON DELETE CASCADE,
    FOREIGN KEY (fuel_type_id) REFERENCES FUEL_TYPE(fuel_type_id) ON DELETE SET NULL
);

CREATE TABLE REVIEW (
    review_id   INT          PRIMARY KEY AUTO_INCREMENT,
    user_id     INT          NOT NULL,
    station_id  INT          NOT NULL,
    rating      TINYINT      NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment     TEXT         NULL,
    reviewed_at DATETIME     DEFAULT NOW(),
    updated_at  DATETIME     DEFAULT NOW() ON UPDATE NOW(),

    FOREIGN KEY (user_id)   REFERENCES USER(user_id)              ON DELETE CASCADE,
    FOREIGN KEY (station_id) REFERENCES FILLING_STATION(station_id) ON DELETE CASCADE,

    -- One review per user per station
    UNIQUE KEY unique_user_station_review (user_id, station_id)
);

CREATE TABLE STATION_OWNER (
    owner_id     INT                  PRIMARY KEY AUTO_INCREMENT,
    station_id   INT                  NOT NULL,
    full_name    VARCHAR(100)         NOT NULL,
    email        VARCHAR(150)         NOT NULL UNIQUE,
    phone_number VARCHAR(20)          NOT NULL,
    role         ENUM('owner','manager') NOT NULL DEFAULT 'manager',
    is_active    BOOLEAN              DEFAULT TRUE,
    created_at   DATETIME             DEFAULT NOW(),
    updated_at   DATETIME             DEFAULT NOW() ON UPDATE NOW(),

    FOREIGN KEY (station_id) REFERENCES FILLING_STATION(station_id) ON DELETE CASCADE
);

