# PetrolPeek - User Guide & Getting Started

## Table of Contents
1. [Installation & Setup](#installation--setup)
2. [Getting Started](#getting-started)
3. [User Features](#user-features)
4. [Admin Features](#admin-features)
5. [Troubleshooting](#troubleshooting)
6. [FAQs](#faqs)

---

## Installation & Setup

### System Requirements
- **Node.js**: v16.0 or higher
- **npm**: v8.0 or higher
- **Database**: SQLite3 (included with backend)
- **Browser**: Chrome, Firefox, Safari, or Edge (latest versions)

### Quick Start (Recommended)

1. **Clone and navigate to project**:
   ```bash
   git clone <repository-url>
   cd PetrolPeek
   ```

2. **Install all dependencies**:
   ```bash
   npm install
   ```

3. **Start both servers**:
   ```bash
   npm start
   ```
   
   This starts both backend (http://localhost:3000) and frontend (http://localhost:5173) simultaneously.

### Manual Setup (Alternative)

#### Backend Setup

1. **Navigate to backend directory**:
   ```bash
   cd PetrolPeek/backend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Create environment file** (.env):
   ```
   PORT=3000
   JWT_SECRET=your-secret-key-change-in-production
   ANTHROPIC_API_KEY=your-api-key-if-using-claude
   ```

4. **Start the server**:
   ```bash
   npm start
   ```
   
   The server will start on `http://localhost:3000`

#### Frontend Setup

1. **Navigate to frontend directory**:
   ```bash
   cd PetrolPeek/frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```
   
   The application will open on `http://localhost:5173` (or similar)

### Database Initialization

The database automatically initializes when the backend starts. It:
- Creates all necessary tables
- Inserts default fuel types (PMS, AGO, LPG)
- Populates initial test data
- Creates necessary indexes for performance

---

## Getting Started

### Creating Your Account

1. **Open the application** in your browser
2. **Click "Register"** link on the login page
3. **Fill in your details**:
   - Full Name (required)
   - Email Address (required - must be unique)
   - Phone Number (optional)
   - Password (required - must be secure)
4. **Click "Create Account"**
5. **You're now logged in!**

### First Login

1. **Click "Login"** on the home page
2. **Enter your email and password**
3. **Click "Login"**
4. **You'll be redirected to the Home page**

### Managing Your Profile

1. **Click your name** in the top navigation
2. **Select "View Profile"**
3. **Update your information**:
   - Full name
   - Phone number
   - Password (optional)
4. **Click "Save Changes"**

---

## User Features

### 1. Finding Petrol Stations

#### Browsing All Stations
1. **Navigate to "Stations"** from the main menu
2. **View all available petrol stations** in your grid/list
3. **Each station card shows**:
   - Station name and brand
   - Location and address
   - Customer rating (out of 5 stars)
   - Number of reviews
   - Available fuel types (PMS, AGO, LPG)
   - Current fuel prices
   - Operating hours
   - Distance from your location (calculated from default Maseru center or your location)

#### Searching Stations
1. **Enter station name or area** in the search box
2. **Results update in real-time** as you type
3. **Clear search** to see all stations again

#### Filtering Stations
Click on filter buttons to narrow your search:
- **All**: Shows all stations
- **Petrol In**: Shows only stations with PMS (Petrol) in stock
- **Top Rated**: Shows stations with rating ≥ 4.2 stars
- **Nearest**: Sorts stations by distance from you

### 2. Using Device Location

1. **Click "Use Device Location"** button
2. **Allow location access** when prompted by your browser
3. **Distances will update** based on your actual location
4. **If location is denied**, the system uses Maseru city center as default

### 3. Viewing Station Details

1. **Click on a station card** to select it
2. **View detailed information**:
   - Complete address
   - Phone number (if available)
   - Manager name (if available)
   - Current fuel prices and availability
   - Operating hours
   - Complete customer reviews

### 4. Getting Directions

1. **Click the "🗺 Go" button** on any station card
2. **Google Maps opens** with directions from your location to the station
3. **Follow the navigation** to reach the station

### 5. Reading & Writing Reviews

#### Reading Reviews
1. **Select a station** from the list
2. **Scroll down** to see customer reviews
3. **Read other users' experiences** and ratings
4. **Consider reviews** when choosing a station

#### Writing a Review
1. **Select a station** from the list
2. **Scroll to "Add Review" section**
3. **Choose your rating** (1-5 stars)
   - 5 stars: Excellent service and facilities
   - 4 stars: Good service with minor issues
   - 3 stars: Average service
   - 2 stars: Poor service with issues
   - 1 star: Very poor service
4. **Write your review** (optional but helpful):
   - Share your experience
   - Mention queue times
   - Comment on fuel quality
   - Note any issues
5. **Click "Submit Review"**
6. **Your review appears immediately** on the station page
7. **Station rating updates** automatically

---

## Admin Features

### Accessing Admin Dashboard

1. **Navigate to "⚙ Admin"** from the main menu
2. **Only admin users** can access this section
3. **Admin dashboard loads** with all station management tools

### 1. Adding New Stations

1. **Click "Add New Station"** button
2. **Fill in all required fields** (marked with *):
   - **Station Name**: Official name of the station
   - **Brand**: Company/brand name (NNPC, Shell, Total, etc.)
   - **Area**: Geographic area/region
   - **Address**: Full street address
   - **Latitude**: GPS latitude (-90 to 90)
   - **Longitude**: GPS longitude (-180 to 180)
3. **Fill optional fields**:
   - **Operating Hours**: e.g., "6am - 10pm"
   - **Phone Number**: Station contact
   - **Manager Name**: Responsible person
4. **Click "Create Station"**
5. **Station appears in the list** immediately
6. **Station is now visible** to all customers

#### Tips for Adding Stations
- Use Google Maps to get accurate latitude/longitude
- Operating hours should be clear (e.g., "24 hrs", "6am - 11pm")
- Phone numbers help customers contact stations directly
- Ensure brand name is consistent with existing entries

### 2. Editing Stations

1. **Find the station** you want to edit in the list
2. **Click the "✎ Edit" button**
3. **Update any information**:
   - Can change any field except station ID
   - Station details
   - Contact information
   - Manager assignment
   - Availability status
4. **Click "Update Station"**
5. **Changes save immediately**
6. **Updated information** is visible to all customers

### 3. Deleting Stations

1. **Find the station** you want to delete
2. **Click the "🗑 Delete" button**
3. **Confirm deletion** when prompted
4. **Station is deleted** (soft delete - marked inactive)
5. **Station no longer appears** in customer listings

### 4. Searching & Filtering Stations

1. **Use the search box** to find stations by name
2. **Filter by brand** using the dropdown
3. **View only matching stations**
4. **Clear filters** to see all stations again

### 5. Station Management Dashboard

#### Statistics Section
- **Total Stations**: All stations in system
- **Showing**: Filtered results based on search/filter
- **Unique Brands**: Number of different brands

#### Station List Columns
- **Name**: Station identifier
- **Brand**: Company brand
- **Area**: Geographic location
- **Rating**: Average customer rating
- **Actions**: Edit/Delete buttons

---

## Reports Dashboard

### Accessing Reports

1. **Navigate to "📊 Reports"** from the main menu
2. **View available reports**
3. **Switch between reports** using tabs

### Available Reports

#### 1. Station Performance Report 📊
**What it shows:**
- Complete list of all stations
- Customer ratings and review counts
- Number of fuel types available
- Average fuel prices
- Total stock quantities
- Operating hours
- Current availability status

**How to use:**
- Identify top-rated stations
- Find underperforming stations
- Monitor stock levels
- Track customer engagement

#### 2. Fuel Availability & Pricing Report ⛽
**What it shows:**
- All fuel types (PMS, AGO, LPG)
- How many stations offer each fuel
- Price comparison (minimum, maximum, average)
- Total stock across all stations

**How to use:**
- Compare fuel prices across network
- Identify price anomalies
- Monitor fuel availability by type
- Plan inventory distribution

#### 3. User Activity & Reviews Report 👥
**What it shows:**
- User engagement metrics
- Number of reviews posted per user
- Average ratings given
- Stations reviewed by each user
- Last review date

**How to use:**
- Identify active users
- Track community engagement
- Find stations needing reviews
- Improve user retention

#### 4. Transaction Summary Report 💳
**What it shows:**
- All system operations/transactions
- User and station involved
- Type of transaction (Create, Update, Delete, Review)
- Transaction timestamp
- Operation status

**How to use:**
- Audit system changes
- Track data modifications
- Troubleshoot issues
- Maintain compliance records

### Downloading Reports

1. **Open any report**
2. **Click "⬇ Download CSV"** button
3. **CSV file downloads** to your computer
4. **File name includes**: Report name and date
5. **Open in Excel** or any spreadsheet application

---

## Troubleshooting

### Can't Log In
**Problem**: Invalid credentials error
- **Solution**: Check spelling of email and password
- **Password is case-sensitive**: Ensure Caps Lock is off
- **Forgotten password?**: Account recovery coming in next release

### Can't Find Stations
**Problem**: No stations appear in the list
- **Solution**: Stations load from database - refresh the page
- **Check internet connection**: Ensure you're connected
- **Try clearing filters**: Use "All" filter to see all stations

### Location Not Working
**Problem**: Device location not updating
- **Solution**: Check browser permissions for location access
- **Solution**: Ensure location services enabled on device
- **Solution**: Try refreshing the page
- **Default**: System uses Maseru city center if location unavailable

### Can't Submit Review
**Problem**: Review submission fails
- **Solution**: Ensure you're logged in
- **Solution**: Fill in all required fields
- **Solution**: Rating must be 1-5 stars
- **Solution**: Check internet connection

### Admin Dashboard Not Accessible
**Problem**: Getting access denied on admin page
- **Solution**: Contact system administrator for admin role
- **Solution**: Ensure you're logged in with admin account
- **Solution**: Try logging out and logging back in

### Database Seems Outdated
**Problem**: Station information doesn't match reality
- **Solution**: Admins can update station details from Admin Dashboard
- **Solution**: Fuel prices may not update in real-time
- **Solution**: Reviews help keep community informed

---

## FAQs

### General Questions

**Q: Is PetrolPeek available on mobile?**
A: Currently available as responsive web app. Native mobile apps planned for future releases.

**Q: How often is station information updated?**
A: Station details can be updated by admins anytime. Reviews update immediately. Fuel prices may vary.

**Q: Can I search for stations offline?**
A: No, internet connection required to fetch station data from server.

**Q: Is my location data stored?**
A: No, location is used only for distance calculation. It's not sent to server.

### Account Questions

**Q: Can I change my email address?**
A: Future feature. Currently must create new account with new email.

**Q: How long are accounts active?**
A: Accounts remain active. You can delete them by contacting support.

**Q: Can I merge two accounts?**
A: Not automatically. Contact support for assistance.

**Q: Is my password secure?**
A: Yes, passwords are hashed with bcrypt and never stored in plaintext.

### Stations & Reviews

**Q: Can I edit my review after posting?**
A: Future feature. Currently must delete and repost.

**Q: Can I upload photos with my review?**
A: Not in current version. Text reviews only.

**Q: Why can't I rate a station multiple times?**
A: You can update your rating by posting a new review.

**Q: What if I report incorrect station information?**
A: Contact admin through support. They can update details immediately.

### Technical Questions

**Q: What browsers are supported?**
A: Chrome, Firefox, Safari, Edge (latest versions). Internet Explorer not supported.

**Q: Why is the app slow sometimes?**
A: Check internet speed. Clear browser cache. Refresh page.

**Q: Can I use the API directly?**
A: API documentation available for developers. See TECHNICAL_DOCUMENTATION.md

**Q: How do I report bugs?**
A: Contact development team with:
- Description of issue
- Steps to reproduce
- Screenshot if possible
- Browser and OS information

---

## Support & Contact

For technical support or questions:
- **Email**: support@petrolpeek.com
- **Documentation**: See TECHNICAL_DOCUMENTATION.md for developers
- **Bug Reports**: Please include detailed reproduction steps

---

## Version History

- **v1.0.0** (Current):
  - Basic station browsing and search
  - Review system
  - Admin dashboard with CRUD operations
  - Comprehensive reports
  - User authentication
  - Transaction logging

---

## Tips for Best Experience

1. **Keep Information Updated**: If you're an admin, update station details regularly
2. **Post Helpful Reviews**: Your feedback helps other users
3. **Check Operating Hours**: Call ahead during unusual hours
4. **Use Device Location**: More accurate for distance calculation
5. **Verify Fuel Availability**: Prices and stock may change

---

Enjoy using PetrolPeek!
