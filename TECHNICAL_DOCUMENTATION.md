# PetrolPeek - Technical Documentation for Developers

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure)
4. [Backend API](#backend-api)
5. [Database Schema](#database-schema)
6. [Frontend Components](#frontend-components)
7. [Authentication & Security](#authentication--security)
8. [Error Handling](#error-handling)
9. [Deployment Guide](#deployment-guide)
10. [Performance Optimization](#performance-optimization)

---

## Architecture Overview

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT TIER (Frontend)                   │
│  React.js + Vite | Components | Context API | Routing      │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP/HTTPS
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                  APPLICATION TIER (Backend)                 │
│        Express.js Server | Route Handlers | Middleware     │
└────────────────────────┬────────────────────────────────────┘
                         │ SQL Queries
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    DATA TIER (Database)                      │
│                    SQLite3 Database                          │
└─────────────────────────────────────────────────────────────┘
```

### Key Design Patterns

1. **RESTful API**: Standard HTTP methods for CRUD operations
2. **Middleware Architecture**: Express middleware for authentication/validation
3. **Component-Based UI**: React functional components with hooks
4. **Context for State**: Global state management with AuthContext
5. **Modular CSS**: CSS Modules for component styling

---

## Technology Stack

### Frontend
- **Framework**: React 19.2.0
- **Build Tool**: Vite 8.0.0-beta.13
- **Routing**: React Router 7.13.1
- **HTTP Client**: Axios 1.15.0
- **Styling**: CSS Modules
- **Node.js**: v16+ recommended

### Backend
- **Runtime**: Node.js v16+
- **Framework**: Express.js 5.2.1
- **Database**: SQLite3 6.0.1
- **Authentication**: JWT (jsonwebtoken 9.0.3)
- **Password Hashing**: bcryptjs 3.0.3
- **CORS**: cors 2.8.6
- **Environment**: dotenv 17.3.1

### Development Tools
- **Linter**: ESLint 9.39.1
- **Version Control**: Git
- **Package Manager**: npm v8+

---

## Project Structure

```
PetrolPeek/
├── backend/
│   ├── Database/
│   │   ├── petrol.db (SQLite database file)
│   │   ├── petrols_sqlite.sql (SQLite schema)
│   │   └── petrols.sql (MySQL schema reference)
│   ├── node_modules/
│   ├── server.js (Main backend server)
│   ├── package.json
│   ├── .env (Environment variables)
│   └── .gitignore
│
├── frontend/
│   ├── node_modules/
│   ├── public/ (Static assets)
│   ├── src/
│   │   ├── components/
│   │   │   ├── Auth.css
│   │   │   ├── Header.jsx
│   │   │   ├── Header.module.css
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── Sidebar.module.css
│   │   │   ├── StationCard.jsx
│   │   │   ├── StationCard.module.css
│   │   │   ├── StationForm.jsx (ADDED)
│   │   │   ├── StationForm.module.css (ADDED)
│   │   │   ├── AdminDashboard.jsx (ADDED)
│   │   │   ├── AdminDashboard.module.css (ADDED)
│   │   │   ├── Reports.jsx (ADDED)
│   │   │   └── Reports.module.css (ADDED)
│   │   │
│   │   ├── contexts/
│   │   │   └── AuthContext.jsx (Global auth state)
│   │   │
│   │   ├── data/
│   │   │   └── stations.js (Utility functions)
│   │   │
│   │   ├── Pages/
│   │   │   ├── home.jsx
│   │   │   ├── home.css
│   │   │   ├── stations.jsx
│   │   │   └── stations.css
│   │   │
│   │   ├── App.jsx (Main app with routes)
│   │   ├── App.css
│   │   ├── main.jsx (Entry point)
│   │   └── index.css (Global styles)
│   │
│   ├── index.html
│   ├── vite.config.js
│   ├── eslint.config.js
│   ├── package.json
│   ├── package-lock.json
│   └── .gitignore
│
├── BUSINESS_CASE.md (Business requirements)
├── ERD_DOCUMENTATION.md (Database design)
├── USER_GUIDE.md (User documentation)
├── README.md (Project overview)
└── package.json (Root workspace config)
```

---

## Backend API

### Server Configuration
```javascript
const PORT = process.env.PORT || 3000
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'
const CORS_ORIGIN = 'http://localhost:5173' // Frontend URL
```

### Authentication Endpoints

#### 1. Register User
```
POST /api/auth/register
Content-Type: application/json

{
  "full_name": "John Doe",
  "email": "john@example.com",
  "phone_number": "+234-XXX-XXXX",
  "password": "secure_password"
}

Response 201:
{
  "message": "User created successfully",
  "token": "eyJhbGci...",
  "user": {
    "user_id": 1,
    "full_name": "John Doe",
    "email": "john@example.com"
  }
}
```

#### 2. Login User
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "secure_password"
}

Response 200:
{
  "message": "Login successful",
  "token": "eyJhbGci...",
  "user": {
    "user_id": 1,
    "full_name": "John Doe",
    "email": "john@example.com"
  }
}
```

#### 3. Get User Profile
```
GET /api/auth/profile
Authorization: Bearer {token}

Response 200:
{
  "user": {
    "user_id": 1,
    "full_name": "John Doe",
    "email": "john@example.com",
    "created_at": "2026-04-10T10:30:00Z"
  }
}
```

### Station Management Endpoints

#### 4. Get All Stations
```
GET /api/stations

Response 200:
[
  {
    "id": 1,
    "name": "NNPC Mega Station",
    "brand": "NNPC",
    "area": "Victoria Island",
    "address": "12 Adeola Odeku St, VI, Lagos",
    "lat": 6.4281,
    "lng": 3.4219,
    "rating": 4.7,
    "reviews": 214,
    "available": true,
    "hours": "24 hrs",
    "fuels": ["PMS", "AGO", "LPG"],
    "price": 617
  },
  ...
]
```

#### 5. Get Station by ID
```
GET /api/stations/{id}

Response 200:
{
  "id": 1,
  "name": "NNPC Mega Station",
  ...
  "fuels": [
    {
      "fuel_code": "PMS",
      "is_available": true,
      "price_per_litre": 617,
      "quantity_in_stock": 1200
    },
    ...
  ]
}
```

#### 6. Create Station (Protected)
```
POST /api/stations
Authorization: Bearer {token}
Content-Type: application/json

{
  "station_name": "New Station",
  "brand": "Shell",
  "area": "Lekki",
  "address": "123 Main Street",
  "latitude": 6.4350,
  "longitude": 3.4750,
  "operating_hours": "6am - 10pm",
  "phone_number": "+234-XXX-XXXX",
  "manager_name": "Manager Name"
}

Response 201:
{
  "message": "Station created successfully",
  "station_id": 11
}
```

#### 7. Update Station (Protected)
```
PUT /api/stations/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "station_name": "Updated Name",
  "operating_hours": "6am - 11pm",
  "available": true
}

Response 200:
{
  "message": "Station updated successfully"
}
```

#### 8. Delete Station (Protected)
```
DELETE /api/stations/{id}
Authorization: Bearer {token}

Response 200:
{
  "message": "Station deleted successfully"
}
```

### Report Endpoints

#### 9. Station Performance Report
```
GET /api/reports/station-performance

Response 200:
{
  "report_name": "Station Performance Report",
  "description": "...",
  "total_stations": 10,
  "data": [
    {
      "station_id": 1,
      "station_name": "NNPC Mega",
      "rating": 4.7,
      "reviews": 214,
      "fuel_types_available": 3,
      "avg_fuel_price": 619.33,
      "total_stock": 2500
    },
    ...
  ]
}
```

#### 10. Fuel Availability Report
```
GET /api/reports/fuel-availability

Response 200:
{
  "report_name": "Fuel Availability and Pricing Report",
  "fuel_types": 3,
  "data": [
    {
      "fuel_code": "PMS",
      "fuel_name": "Premium Motor Spirit",
      "total_stations_offering": 10,
      "stations_with_stock": 8,
      "min_price": 615,
      "max_price": 625,
      "avg_price": 619.33,
      "total_stock_liters": 10500
    },
    ...
  ]
}
```

#### 11. User Activity Report
```
GET /api/reports/user-activity

Response 200:
{
  "report_name": "User Activity and Reviews Report",
  "active_users": 5,
  "data": [
    {
      "user_id": 1,
      "full_name": "John Doe",
      "reviews_posted": 5,
      "avg_rating_given": 4.2,
      "stations_reviewed": 3,
      "last_review_date": "2026-04-18T10:30:00Z"
    },
    ...
  ]
}
```

#### 12. Transaction Summary Report
```
GET /api/reports/transaction-summary

Response 200:
{
  "report_name": "Transaction Summary Report",
  "total_transactions": 50,
  "data": [
    {
      "user_id": 1,
      "full_name": "John Doe",
      "station_name": "NNPC Mega",
      "transaction_type": "STATION_CREATED",
      "transaction_count": 1,
      "status": "completed",
      "first_transaction": "2026-04-10T10:30:00Z",
      "last_transaction": "2026-04-18T15:45:00Z"
    },
    ...
  ]
}
```

### Review Endpoints

#### 13. Get Station Reviews
```
GET /api/stations/{id}/reviews

Response 200:
[
  {
    "review_id": 1,
    "rating": 5,
    "review_text": "Excellent service...",
    "full_name": "John Doe",
    "created_at": "2026-04-18T10:30:00Z"
  },
  ...
]
```

#### 14. Add Review (Protected)
```
POST /api/stations/{id}/reviews
Authorization: Bearer {token}
Content-Type: application/json

{
  "rating": 5,
  "review_text": "Excellent service and clean facilities"
}

Response 201:
{
  "message": "Review created successfully",
  "review_id": 10
}
```

### Error Response Format
```
Response 400/401/403/404/500:
{
  "error": "Descriptive error message"
}
```

---

## Database Schema

### Key Tables
1. **USER**: User accounts and authentication
2. **FILLING_STATION**: Station information
3. **FUEL_TYPE**: Reference data for fuel types
4. **FUEL_AVAILABILITY**: Station-fuel relationships
5. **STATION_REVIEW**: Customer reviews
6. **TRANSACTION_LOG**: Audit trail

See [ERD_DOCUMENTATION.md](ERD_DOCUMENTATION.md) for detailed schema.

---

## Frontend Components

### Authentication Components
- **Login.jsx**: User login form with validation
- **Register.jsx**: User registration form with validation
- **ProtectedRoute.jsx**: HOC for route protection
- **AuthContext.jsx**: Global authentication state

### Station Components
- **StationCard.jsx**: Individual station display card
- **Sidebar.jsx**: Station list with filters and search
- **MapView.jsx**: Map integration (if Google Maps API added)

### Admin Components
- **AdminDashboard.jsx**: Station management interface
- **StationForm.jsx**: Form for creating/editing stations
- **Reports.jsx**: Comprehensive reporting interface

### Layout Components
- **Header.jsx**: Navigation header
- **Pages/**: Page-level components (Home, Stations)

### Key Hooks Used
```javascript
- useState: Local state management
- useEffect: Side effects and API calls
- useContext: Access auth context
- useNavigate: Programmatic navigation
- useLocation: Current route information
```

---

## Authentication & Security

### JWT Implementation
```javascript
// Token generation
const token = jwt.sign(
  { user_id: user.user_id, email: user.email, full_name: user.full_name },
  JWT_SECRET,
  { expiresIn: '24h' }
);

// Token verification
jwt.verify(token, JWT_SECRET, (err, user) => {
  if (err) return res.status(403).json({ error: 'Invalid token' });
  req.user = user;
  next();
});
```

### Password Security
```javascript
// Hashing
const password_hash = await bcrypt.hash(password, 10);

// Verification
const isValid = await bcrypt.compare(password, password_hash);
```

### CORS Configuration
```javascript
const corsOptions = {
  origin: 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));
```

### Best Practices Implemented
1. ✅ Passwords hashed with bcrypt
2. ✅ JWT tokens with expiration
3. ✅ CORS enabled for frontend
4. ✅ Input validation on all endpoints
5. ✅ Authentication middleware on protected routes
6. ✅ SQL parameterized queries (using ? placeholders)
7. ✅ Error messages don't expose sensitive info

---

## Error Handling

### Frontend Error Handling
```javascript
try {
  const response = await fetch(url);
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || 'Failed to fetch');
  }
  return await response.json();
} catch (error) {
  setError(error.message);
}
```

### Backend Error Handling
```javascript
app.post('/api/endpoint', (req, res) => {
  try {
    // Validation
    if (!required_field) {
      return res.status(400).json({ error: 'Field required' });
    }
    
    // Database operation
    db.run(sql, (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ success: true });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
```

### Error Validation
- **Request validation**: Check required fields
- **Type validation**: Ensure correct data types
- **Range validation**: GPS coordinates, ratings, etc.
- **Business logic validation**: Duplicate checks, referential integrity

---

## Deployment Guide

### Deployment Checklist
- [ ] Update .env with production values
- [ ] Set NODE_ENV=production
- [ ] Use HTTPS in production
- [ ] Set secure JWT_SECRET (not default)
- [ ] Configure database backups
- [ ] Set up monitoring/logging
- [ ] Enable CORS for production domain
- [ ] Test all endpoints thoroughly
- [ ] Perform security audit
- [ ] Set up CI/CD pipeline

### Environment Variables (.env)
```
# Server
NODE_ENV=production
PORT=3000

# Security
JWT_SECRET=your-secure-secret-key-min-32-chars

# Database (optional - defaults to SQLite)
DB_PATH=/path/to/database.db

# API Keys
ANTHROPIC_API_KEY=your-api-key-if-needed
```

### Docker Deployment (Optional)
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
```

### Deployment Steps
1. Clone repository
2. Install dependencies: `npm install`
3. Configure environment variables
4. Build frontend: `cd frontend && npm run build`
5. Start backend: `cd backend && npm start`
6. Configure reverse proxy (nginx/Apache)
7. Set up SSL/TLS certificates
8. Configure firewall rules

---

## Performance Optimization

### Database Optimizations
1. **Indexes**: Defined on frequently queried columns
2. **Query Optimization**: Use specific columns in SELECT
3. **Caching**: Redis for frequently accessed data (future)
4. **Pagination**: Implement for large result sets (future)

### Frontend Optimizations
1. **Code Splitting**: Lazy load components
2. **CSS Modules**: Prevent style conflicts
3. **React.memo**: Prevent unnecessary re-renders
4. **useMemo/useCallback**: Optimize expensive operations
5. **Image Optimization**: Compress images

### Backend Optimizations
1. **Connection Pooling**: Multiple database connections (future)
2. **Middleware Order**: Fast middleware first
3. **Error Handling**: Don't crash on errors
4. **Logging**: Structured logging (future)
5. **Rate Limiting**: Prevent abuse (future)

### Performance Monitoring
```javascript
// Response time logging
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} - ${duration}ms`);
  });
  next();
});
```

---

## Testing Strategy

### Unit Tests (Frontend)
```javascript
// Example: Component test
import { render, screen } from '@testing-library/react';
import StationCard from './StationCard';

test('renders station information', () => {
  const station = { id: 1, name: 'Test Station', ... };
  render(<StationCard station={station} />);
  expect(screen.getByText('Test Station')).toBeInTheDocument();
});
```

### API Tests (Backend)
```javascript
// Example: API test
const response = await fetch('http://localhost:3000/api/stations');
expect(response.status).toBe(200);
const data = await response.json();
expect(Array.isArray(data)).toBe(true);
```

### Testing Tools
- **Frontend**: Jest, React Testing Library
- **Backend**: Jest, Supertest
- **Integration**: Postman, Newman

---

## Contributing Guidelines

### Code Style
- Use ES6+ syntax
- Follow naming conventions (camelCase for variables, PascalCase for components)
- Add comments for complex logic
- Use error handling consistently

### Git Workflow
1. Create feature branch: `git checkout -b feature/name`
2. Commit changes: `git commit -m "descriptive message"`
3. Push branch: `git push origin feature/name`
4. Create pull request with description
5. Get code review before merging

### Documentation
- Update READMEs for new features
- Document new API endpoints
- Add JSDoc comments for functions
- Keep TECHNICAL_DOCUMENTATION.md updated

---

## Troubleshooting

### Common Issues

**1. Port Already in Use**
```bash
# Find process using port 3000
lsof -i :3000
# Kill process
kill -9 <PID>
```

**2. Database Locked**
```bash
# Delete lock file if SQLite locks
rm .db-wal
# Restart server
```

**3. CORS Errors**
```javascript
// Ensure CORS is configured correctly
// Check origin in .env matches frontend URL
```

**4. JWT Token Invalid**
```javascript
// Ensure JWT_SECRET is set consistently
// Check token expiration
// Verify Authorization header format: "Bearer {token}"
```

---

## Resources

- [Express.js Documentation](https://expressjs.com/)
- [React Documentation](https://react.dev/)
- [SQLite Documentation](https://www.sqlite.org/docs.html)
- [JWT.io](https://jwt.io/)
- [Bcrypt Documentation](https://github.com/kelektiv/node.bcrypt.js)

---

## Version Information

- **Application Version**: 1.0.0
- **Last Updated**: April 2026
- **Node.js Version**: 16.0.0+
- **npm Version**: 8.0.0+
- **Database**: SQLite3

---

## Support

For technical questions or issues:
1. Check existing documentation
2. Review error logs in browser console and server logs
3. Create detailed bug report with:
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots/logs
   - Environment details

---

End of Technical Documentation
