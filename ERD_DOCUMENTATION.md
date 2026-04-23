# PetrolPeek - Entity Relationship Diagram (ERD) & Database Design Documentation

## Database Schema Overview

The PetrolPeek database is built on relational principles with proper normalization (3NF) to ensure data integrity, eliminate redundancy, and support efficient queries.

---

## Entity Relationship Diagram (ERD)

### ASCII Representation:

```
┌──────────────────────┐
│        USER          │
├──────────────────────┤
│ user_id (PK)         │ ◄──────┐
│ full_name            │        │
│ email (UNIQUE)       │        │
│ phone_number         │        │ 1:N
│ password_hash        │        │
│ role (customer/admin)│        │
│ created_at           │        │
│ updated_at           │        │
└──────────────────────┘        │
                                │
                                │
                    ┌───────────────────────┐
                    │  STATION_REVIEW       │
                    ├───────────────────────┤
                    │ review_id (PK)        │
                    │ station_id (FK)       │
                    │ user_id (FK)          │ ◄──────┐
                    │ rating (1-5)          │        │
                    │ review_text           │        │
                    │ created_at            │        │
                    └───────────────────────┘        │
                            △                        │
                            │                        │
                            │ 1:N                   │
                            │                      1:N
                            │                        │
        ┌───────────────────────────────┐            │
        │   FILLING_STATION             │            │
        ├───────────────────────────────┤            │
        │ station_id (PK)               │ ◄──────────┘
        │ station_name                  │
        │ brand                         │
        │ area                          │
        │ address                       │
        │ latitude                      │
        │ longitude                     │
        │ rating (calculated from avg) │
        │ reviews (count)               │
        │ available (boolean)           │
        │ operating_hours               │
        │ phone_number                  │
        │ manager_name                  │
        │ is_active (soft delete)      │
        │ created_at                    │
        │ updated_at                    │
        └───────────────────────────────┘
                    △
                    │
                    │ 1:N
                    │
        ┌───────────────────────────────┐
        │   FUEL_AVAILABILITY           │
        ├───────────────────────────────┤
        │ availability_id (PK)          │
        │ station_id (FK)               │ ◄────┐
        │ fuel_type_id (FK)             │      │
        │ is_available (boolean)        │      │
        │ price_per_litre               │      │
        │ quantity_in_stock             │      │
        │ last_updated                  │      │
        └───────────────────────────────┘      │
                    △                          │
                    │                          │
                    │ 1:N                    1:N
                    │                          │
                    │                          │
        ┌──────────────────────────┐          │
        │    FUEL_TYPE             │          │
        ├──────────────────────────┤          │
        │ fuel_type_id (PK)        │ ◄────────┘
        │ fuel_name                │
        │ fuel_code (UNIQUE)       │
        │ fuel_price               │
        │ created_at               │
        └──────────────────────────┘
                    △
                    │
                    │ 1:N (for audit/tracking)
                    │
        ┌───────────────────────────────┐
        │    TRANSACTION_LOG            │
        ├───────────────────────────────┤
        │ transaction_id (PK)           │
        │ user_id (FK - nullable)       │
        │ station_id (FK - nullable)    │
        │ transaction_type              │
        │ transaction_details           │
        │ timestamp                     │
        │ status                        │
        └───────────────────────────────┘
```

---

## Detailed Table Specifications

### 1. USER Table
**Purpose**: Store user account information and authentication data

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| user_id | INTEGER | PRIMARY KEY, AUTO INCREMENT | Unique user identifier |
| full_name | TEXT | NOT NULL | User's full name |
| email | TEXT | UNIQUE, NOT NULL | User's email address |
| phone_number | TEXT | Optional | User's phone number |
| password_hash | TEXT | NOT NULL | Bcrypt hashed password |
| role | TEXT | DEFAULT 'customer' | User role (customer/admin) |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | Account creation timestamp |
| updated_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | Last update timestamp |

**Indices**:
- PRIMARY KEY (user_id)
- UNIQUE KEY (email)

**Relationships**:
- 1:N with STATION_REVIEW
- 1:N with TRANSACTION_LOG

---

### 2. FILLING_STATION Table
**Purpose**: Core entity storing petrol station information

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| station_id | INTEGER | PRIMARY KEY, AUTO INCREMENT | Unique station identifier |
| station_name | TEXT | NOT NULL | Official station name |
| brand | TEXT | NOT NULL | Brand/company name |
| area | TEXT | NOT NULL | Geographic area/region |
| address | TEXT | NOT NULL | Street address |
| latitude | REAL | NOT NULL | GPS latitude (-90 to 90) |
| longitude | REAL | NOT NULL | GPS longitude (-180 to 180) |
| rating | REAL | DEFAULT 0 | Average customer rating |
| reviews | INTEGER | DEFAULT 0 | Count of reviews |
| available | BOOLEAN | DEFAULT 1 | Current availability status |
| operating_hours | TEXT | NOT NULL | Operating hours description |
| phone_number | TEXT | Optional | Station contact number |
| manager_name | TEXT | Optional | Station manager name |
| maps_url | TEXT | Optional | Google Maps link |
| is_active | BOOLEAN | DEFAULT 1 | Soft delete flag |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | Creation timestamp |
| updated_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | Last update timestamp |

**Indices**:
- PRIMARY KEY (station_id)
- INDEX (area)
- INDEX (brand)
- INDEX (is_active)

**Relationships**:
- 1:N with FUEL_AVAILABILITY
- 1:N with STATION_REVIEW
- 1:N with TRANSACTION_LOG

---

### 3. FUEL_TYPE Table
**Purpose**: Reference table for standardized fuel types

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| fuel_type_id | INTEGER | PRIMARY KEY, AUTO INCREMENT | Unique fuel type identifier |
| fuel_name | TEXT | NOT NULL | Full fuel name (e.g., "Premium Motor Spirit") |
| fuel_code | TEXT | UNIQUE, NOT NULL | Standard fuel code (ULD95, 50PPM, ULD93) |
| fuel_price | REAL | NOT NULL | Standard/base price per liter |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | Creation timestamp |

**Indices**:
- PRIMARY KEY (fuel_type_id)
- UNIQUE KEY (fuel_code)

**Relationships**:
- 1:N with FUEL_AVAILABILITY

---

### 4. FUEL_AVAILABILITY Table
**Purpose**: Junction table linking stations to fuel types with real-time data

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| availability_id | INTEGER | PRIMARY KEY, AUTO INCREMENT | Unique availability record ID |
| station_id | INTEGER | NOT NULL, FK | References FILLING_STATION |
| fuel_type_id | INTEGER | NOT NULL, FK | References FUEL_TYPE |
| is_available | BOOLEAN | DEFAULT 0 | Current availability flag |
| price_per_litre | REAL | NOT NULL | Current price per liter |
| quantity_in_stock | REAL | Optional | Current stock in liters |
| last_updated | DATETIME | DEFAULT CURRENT_TIMESTAMP | Last update time |
| UNIQUE (station_id, fuel_type_id) | - | - | Prevents duplicate station-fuel pairs |

**Foreign Keys**:
- FOREIGN KEY (station_id) REFERENCES FILLING_STATION(station_id) ON DELETE CASCADE
- FOREIGN KEY (fuel_type_id) REFERENCES FUEL_TYPE(fuel_type_id) ON DELETE CASCADE

**Indices**:
- PRIMARY KEY (availability_id)
- INDEX (station_id)
- INDEX (fuel_type_id)
- UNIQUE KEY (station_id, fuel_type_id)

**Relationships**:
- N:1 with FILLING_STATION
- N:1 with FUEL_TYPE

---

### 5. STATION_REVIEW Table
**Purpose**: Store customer reviews and ratings for stations

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| review_id | INTEGER | PRIMARY KEY, AUTO INCREMENT | Unique review identifier |
| station_id | INTEGER | NOT NULL, FK | References FILLING_STATION |
| user_id | INTEGER | NOT NULL, FK | References USER |
| rating | INTEGER | CHECK (1-5), NOT NULL | Star rating (1-5) |
| review_text | TEXT | Optional | Review content |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | Review creation time |

**Foreign Keys**:
- FOREIGN KEY (station_id) REFERENCES FILLING_STATION(station_id) ON DELETE CASCADE
- FOREIGN KEY (user_id) REFERENCES USER(user_id) ON DELETE CASCADE

**Indices**:
- PRIMARY KEY (review_id)
- INDEX (station_id)
- INDEX (user_id)
- CHECK CONSTRAINT on rating (1-5)

**Relationships**:
- N:1 with FILLING_STATION
- N:1 with USER

---

### 6. TRANSACTION_LOG Table
**Purpose**: Audit trail for all significant system operations

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| transaction_id | INTEGER | PRIMARY KEY, AUTO INCREMENT | Unique transaction ID |
| user_id | INTEGER | Optional, FK | References USER (nullable for system operations) |
| station_id | INTEGER | Optional, FK | References FILLING_STATION (nullable if not applicable) |
| transaction_type | TEXT | NOT NULL | Operation type (STATION_CREATED, UPDATED, DELETED, REVIEW_POSTED, etc.) |
| transaction_details | TEXT | Optional | Detailed description of operation |
| timestamp | DATETIME | DEFAULT CURRENT_TIMESTAMP | When operation occurred |
| status | TEXT | DEFAULT 'completed' | Status (completed, failed, pending) |

**Foreign Keys**:
- FOREIGN KEY (user_id) REFERENCES USER(user_id) ON DELETE SET NULL
- FOREIGN KEY (station_id) REFERENCES FILLING_STATION(station_id) ON DELETE SET NULL

**Indices**:
- PRIMARY KEY (transaction_id)
- INDEX (user_id)
- INDEX (transaction_type)
- INDEX (timestamp)

---

## Normalization Analysis

### First Normal Form (1NF):
✓ All attributes contain atomic values (no repeating groups)
✓ No multivalued attributes

### Second Normal Form (2NF):
✓ All non-key attributes depend on the entire primary key
✓ No partial dependencies

### Third Normal Form (3NF):
✓ No transitive dependencies
✓ All non-key attributes depend only on the primary key
✓ Example: Station rating is computed, not stored (though stored for performance)

---

## Query Performance Considerations

### Frequently Used Queries:
1. **Get all active stations**: Uses is_active index
2. **Search stations by area**: Uses area index
3. **Filter by brand**: Uses brand index
4. **Get station details with fuel availability**: Join with indexed foreign keys
5. **Get user reviews**: Uses user_id and station_id indexes

### Join Paths:
- FILLING_STATION → FUEL_AVAILABILITY → FUEL_TYPE (fuel information)
- FILLING_STATION → STATION_REVIEW → USER (review information)
- USER → TRANSACTION_LOG (user activity audit)

---

## Data Integrity Constraints

### Referential Integrity:
- FUEL_AVAILABILITY requires valid station_id and fuel_type_id
- STATION_REVIEW requires valid station_id and user_id
- TRANSACTION_LOG allows null foreign keys (system operations)

### Domain Constraints:
- Rating: 1-5 integer only
- Coordinates: Valid GPS ranges (-90 to 90 for latitude, -180 to 180 for longitude)
- Boolean fields: 0 or 1
- Timestamps: Server-provided for consistency

### Uniqueness Constraints:
- User email must be unique (prevents duplicate accounts)
- Fuel code must be unique (standardized across system)
- Station-fuel combination must be unique (prevents duplicate records)

---

## Data Volume Estimates

### Target Scale:
| Entity | Records | Growth |
|--------|---------|--------|
| USER | 10,000+ | 100-500/month |
| FILLING_STATION | 1,000+ | 10-50/month |
| FUEL_AVAILABILITY | 3,000+ | Synchronizes with stations |
| STATION_REVIEW | 50,000+ | 500-2000/month |
| TRANSACTION_LOG | 1,000,000+ | 10,000+/day |
| FUEL_TYPE | 3-5 | Static |

---

## Backup and Recovery Strategy

### Backup Frequency:
- Daily full backups
- Hourly incremental backups for transaction log
- Real-time replication for critical data

### Recovery Time Objective (RTO):
- Maximum 2 hours for full recovery
- Maximum 15 minutes for transaction log

### Recovery Point Objective (RPO):
- Maximum 1 hour data loss
- Transactions logged immediately for audit trail

---

## Future Enhancements

1. **Partitioning**: Partition transaction log by date for better performance
2. **Caching**: Redis cache for frequently accessed station data
3. **Archiving**: Move old transaction logs to separate archive database
4. **Replication**: Master-slave replication for high availability
5. **Sharding**: Horizontal sharding by geographic region if needed

---

## Conclusion

The PetrolPeek database schema is designed with data integrity, performance, and scalability in mind. The proper use of relationships, constraints, and indexing ensures efficient operations while maintaining data quality and supporting comprehensive audit trails for security and compliance.
