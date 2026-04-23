# PetrolPeek - Business Case & Requirements Document

## Executive Summary

PetrolPeek is a comprehensive petrol station finder and management application designed to address the inefficiency in locating fuel stations and managing fuel inventory in urban areas. The application provides real-time fuel availability, pricing information, and station management capabilities to both customers and administrators.

## Problem Definition

### Current Challenges:
1. **Difficulty in Finding Petrol Stations**: Customers spend excessive time searching for nearby petrol stations, especially during peak hours
2. **Lack of Real-time Information**: No centralized platform showing real-time fuel availability and pricing
3. **Inefficient Station Management**: Station managers lack tools to manage fuel inventory and track customer reviews
4. **Poor Customer Feedback**: Limited mechanisms for customers to rate stations and provide feedback
5. **Data Inconsistency**: Information about stations, fuel types, and prices is scattered across different sources

### Proposed Solution:
PetrolPeek provides:
- **Customer Portal**: Easy station discovery with distance calculation, ratings, and real-time availability
- **Admin Dashboard**: Complete station and inventory management
- **Reporting System**: Comprehensive insights into station performance, fuel trends, and user behavior
- **Review System**: Customer feedback mechanism for quality assurance
- **Transaction Logging**: Complete audit trail of all operations

---

## Business Rules

### Entity Relationships

#### 1. FILLING_STATION (Main Entity)
- **Definition**: Represents a petrol filling station
- **Business Rules**:
  - Each station must have a unique name within a geographical area
  - Station must have valid coordinates (latitude: -90 to 90, longitude: -180 to 180)
  - Operating hours must be specified in readable format (e.g., "6am - 10pm")
  - A station can serve multiple fuel types
  - A station is identified by brand and location

#### 2. FUEL_TYPE (Reference Entity)
- **Definition**: Types of fuel available (PMS, AGO, LPG)
- **Business Rules**:
  - Each fuel type has a unique fuel code (PMS, AGO, LPG)
  - Fuel codes are standardized across all stations
  - Price is tracked per unit (liter)
  - Fuel type cannot be deleted if associated with fuel availability records (referential integrity)

#### 3. FUEL_AVAILABILITY (Junction Table)
- **Definition**: Tracks which fuels are available at which stations
- **Business Rules**:
  - One-to-One relationship between station and fuel type pair
  - Tracks real-time availability status (available/unavailable)
  - Price per liter is maintained separately for each station-fuel combination
  - Stock quantity can be null if not tracked
  - Last updated timestamp indicates freshness of data

#### 4. USER (Authentication Entity)
- **Definition**: Registered users of the system
- **Business Rules**:
  - Email must be unique across the system
  - Password must be hashed using bcrypt (never stored in plaintext)
  - Users can be customers or admins (role-based)
  - User records are linked to reviews and transactions
  - Profile information can be updated by the user

#### 5. STATION_REVIEW (Feedback Entity)
- **Definition**: Customer reviews and ratings for stations
- **Business Rules**:
  - Rating must be between 1-5 stars
  - One user can review the same station multiple times (allows for rating changes)
  - Reviews are timestamped for chronological sorting
  - Station average rating is calculated from all reviews
  - Review text is optional but helpful for context

#### 6. TRANSACTION_LOG (Audit Entity)
- **Definition**: Complete log of all system operations
- **Business Rules**:
  - Every significant action is logged (CRUD operations, reviews, user actions)
  - Transaction type indicates the operation (CREATE, UPDATE, DELETE, REVIEW_POSTED, etc.)
  - Status tracks whether operation completed successfully
  - Timestamps are recorded in UTC for consistency
  - Used for auditing, performance analysis, and user activity tracking

---

## System Features & Functional Requirements

### For Customers (Users):
1. **User Registration & Authentication**
   - Secure password-based registration
   - JWT token-based session management
   - Profile viewing and management

2. **Station Discovery**
   - Browse all available petrol stations
   - Filter by fuel type availability
   - Sort by distance, rating, or name
   - Search by station name or area

3. **Station Information**
   - View detailed station information
   - Check real-time fuel availability and pricing
   - See customer reviews and ratings
   - View operating hours and contact information

4. **Location Services**
   - Device geolocation support
   - Distance calculation to stations
   - Navigation links to Google Maps

5. **Review Management**
   - Post reviews and ratings for stations
   - View reviews from other customers
   - Help improve station quality through feedback

### For Administrators:
1. **Station Management (CRUD)**
   - Create new filling stations
   - Edit existing station details
   - Delete/deactivate stations
   - Manage station contact information and managers

2. **Fuel Inventory Management**
   - Track fuel availability per station
   - Update fuel prices in real-time
   - Monitor stock levels
   - Update fuel type information

3. **Dashboard & Analytics**
   - View comprehensive station performance metrics
   - Generate reports on fuel availability
   - Track user activity and engagement
   - View transaction history

4. **Reporting**
   - Station Performance Report (ratings, fuel types, stock)
   - Fuel Availability & Pricing Report (price comparisons)
   - User Activity Report (engagement, reviews)
   - Transaction Summary Report (audit trail)

---

## Data Quality Requirements

### Validation Rules:
1. **Geographic Data**:
   - Latitude: Must be between -90 and 90
   - Longitude: Must be between -180 and 180
   - Coordinates must be within Lesotho bounds for this implementation

2. **Contact Information**:
   - Phone numbers must be in valid format (if provided)
   - Email must be valid format with @ and domain
   - URLs must be properly formatted

3. **Fuel Pricing**:
   - Prices must be positive numbers
   - Decimal places should not exceed 2
   - Prices should be reasonable within market range

4. **Stock Levels**:
   - Quantity must be non-negative
   - If null, indicates tracking not enabled for that fuel type

5. **Reviews & Ratings**:
   - Rating must be integer between 1-5
   - Review text should not exceed 1000 characters
   - One review per user per station per day (prevents spam)

---

## Performance Requirements

### Database Optimization:
- Indexes on frequently queried columns:
  - station_id, fuel_type_id (Foreign keys)
  - area, brand (Search filters)
  - rating (Sorting)
  - transaction_type, user_id (Audit trail)

### Response Time:
- Station list retrieval: < 500ms
- Individual station details: < 200ms
- Report generation: < 2 seconds
- Search operations: < 300ms

### Scalability:
- Support minimum 1000+ stations
- Support 10,000+ users
- Handle 1M+ transactions in transaction log
- Support concurrent users (minimum 100)

---

## Security Requirements

### Authentication & Authorization:
1. **User Authentication**:
   - Passwords hashed with bcrypt
   - JWT tokens with 24-hour expiration
   - Token refresh mechanism (implied for production)

2. **Access Control**:
   - Protected routes require valid JWT token
   - Admin endpoints require authentication
   - Role-based access (customer vs admin)

3. **Data Protection**:
   - HTTPS/TLS for all network communication (in production)
   - Database passwords not exposed in code
   - Sensitive fields encrypted in database (future enhancement)

### Audit Trail:
- All modifications logged to TRANSACTION_LOG
- Includes user information, timestamp, and action details
- Supports compliance and dispute resolution

---

## Non-Functional Requirements

### Availability:
- System uptime target: 99% SLA
- Planned maintenance window: 2-4 hours weekly

### Maintainability:
- Clean code architecture with separation of concerns
- Comprehensive API documentation
- User guides and technical documentation

### Usability:
- Intuitive UI for both customers and admins
- Responsive design for mobile and desktop
- Clear error messages and validation feedback

---

## Success Metrics

1. **User Adoption**:
   - 1000+ registered users within 3 months
   - 80%+ daily active user rate

2. **Station Coverage**:
   - 100+ stations in database
   - 90%+ data accuracy for fuel availability

3. **System Performance**:
   - 99%+ uptime
   - Average response time < 300ms

4. **User Satisfaction**:
   - 4+ average station rating
   - Positive user feedback
   - Low error/complaint rate

---

## Conclusion

PetrolPeek addresses a significant market need by providing a centralized, user-friendly platform for petrol station discovery and management. The comprehensive database design with proper relationships, transaction logging, and reporting capabilities ensures data integrity and provides valuable insights for business decision-making.

The system is built with scalability and maintainability in mind, supporting future enhancements such as mobile app integration, payment processing, and predictive analytics for fuel price trends.
