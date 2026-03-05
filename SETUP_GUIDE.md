# Billing & Invoicing Web Application - Complete Setup Guide

## Project Overview
A complete production-ready Billing/Invoicing System with Admin Dashboard and Staff Billing Interface.

**Technology Stack:**
- Frontend: HTML5, CSS3, Vanilla JavaScript
- Backend: Node.js, Express.js
- Database: MySQL
- PDF Generation: pdfkit

---

## Project Structure

```
vickey/
├── backend/
│   ├── config/
│   │   └── database.js          # Database configuration
│   ├── controllers/
│   │   ├── authController.js    # Authentication logic
│   │   ├── productController.js # Product management
│   │   ├── billController.js    # Billing logic
│   │   └── userController.js    # User management
│   ├── middleware/
│   │   └── auth.js              # Authentication middleware
│   ├── models/
│   │   ├── User.js              # User model
│   │   ├── Product.js           # Product model
│   │   └── Bill.js              # Bill model
│   ├── routes/
│   │   ├── authRoutes.js        # Auth endpoints
│   │   ├── productRoutes.js     # Product endpoints
│   │   ├── billRoutes.js        # Bill endpoints
│   │   └── userRoutes.js        # User endpoints
│   ├── .env                     # Environment variables
│   ├── package.json             # Dependencies
│   └── server.js                # Express server
├── frontend/
│   ├── css/
│   │   └── style.css            # Main stylesheet
│   ├── js/
│   │   ├── constants.js         # Constants
│   │   ├── api.js               # API calls
│   │   ├── utils.js             # Utility functions
│   │   ├── auth.js              # Authentication
│   │   ├── billing.js           # Billing module
│   │   ├── products.js          # Products module
│   │   ├── reports.js           # Reports module
│   │   ├── users.js             # Users module
│   │   └── main.js              # Main app
│   └── index.html               # Main page
└── database/
    └── schema.sql               # Database schema

```

---

## Installation Steps

### Step 1: Prerequisites
- Node.js (v14 or higher)
- MySQL Server (v5.7 or higher)
- npm or yarn

### Step 2: Create Database

1. Open MySQL command line or MySQL Workbench
2. Run the SQL schema:
```sql
-- Copy the entire content from database/schema.sql and execute
```

Or execute using command line:
```bash
mysql -u root -p < database/schema.sql
```

### Step 3: Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file (already provided)
# Update environment variables in .env if needed:
# - DB_HOST=localhost
# - DB_USER=root
# - DB_PASSWORD=your_password
# - DB_NAME=billing_app
# - DB_PORT=3306
# - PORT=5000

# Start the server
npm start

# Or use nodemon for development (auto-reload)
npm run dev
```

**Expected Output:**
```
✓ Database connected successfully
✓ Server running on http://localhost:5000
✓ NODE_ENV: development
```

### Step 4: Frontend Setup

1. The frontend is automatically served by Express from the `/frontend` directory
2. Open browser and navigate to: `http://localhost:5000`

---

## Default Login Credentials

```
Admin Account:
- Username: admin
- Password: admin123
- Role: Admin

Staff Account:
- Username: staff1
- Password: staff123
- Role: Staff
```

---

## Features by Role

### Admin Features
1. **Dashboard**
   - View total products
   - View total sales amount
   - View total bills
   - View low stock products
   - View recent bills

2. **Product Management**
   - Add new products
   - Edit products
   - Delete products
   - View product list with all details
   - Search products

3. **Staff Management**
   - Create staff accounts
   - Edit staff details
   - Delete staff accounts
   - View all staff members

4. **Reports & Analytics**
   - Daily sales report
   - Monthly sales report
   - View sales trends

5. **Billing**
   - Create bills (same as staff)
   - Generate invoices
   - Download PDF invoices

### Staff Features
1. **Billing/POS**
   - Search products
   - Add products to cart
   - Manage quantities
   - Calculate totals with tax
   - Select payment method
   - Generate bills
   - Download PDF invoices

2. **Dashboard**
   - View sales stats
   - View recent bills

---

## API Endpoints

### Authentication
```
POST   /api/auth/login              - User login
POST   /api/auth/logout             - User logout
GET    /api/auth/user               - Get current user
GET    /api/auth/check              - Check session
```

### Products
```
GET    /api/products                - Get all products
GET    /api/products/:id            - Get product by ID
GET    /api/products/search/products?searchTerm=... - Search products
GET    /api/products/low-stock/list - Get low stock products
GET    /api/products/total/count    - Get total products count
POST   /api/products                - Create product (admin)
PUT    /api/products/:id            - Update product (admin)
DELETE /api/products/:id            - Delete product (admin)
```

### Bills
```
POST   /api/bills                   - Create bill (staff)
GET    /api/bills/:id               - Get bill by ID
GET    /api/bills                   - Get all bills (admin)
GET    /api/bills/recent/list       - Get recent bills (admin)
GET    /api/bills/stats/total-sales - Get total sales (admin)
GET    /api/bills/stats/total-bills - Get total bills (admin)
GET    /api/bills/reports/daily     - Get daily sales (admin)
GET    /api/bills/reports/monthly   - Get monthly sales (admin)
GET    /api/bills/:id/invoice       - Download PDF invoice
```

### Users
```
GET    /api/users                   - Get all users (admin)
GET    /api/users/:id               - Get user by ID (admin)
POST   /api/users                   - Create user (admin)
PUT    /api/users/:id               - Update user (admin)
DELETE /api/users/:id               - Delete user (admin)
POST   /api/users/:id/change-password - Change password
```

---

## Database Schema

### Users Table
```sql
- id (Primary Key)
- username (Unique)
- email (Unique)
- password (Hashed)
- role (admin/staff)
- created_at
- updated_at
```

### Products Table
```sql
- id (Primary Key)
- name
- category
- price
- stock_quantity
- barcode (Optional, Unique)
- created_at
- updated_at
```

### Bills Table
```sql
- id (Primary Key)
- user_id (Foreign Key → users)
- subtotal
- tax
- grand_total
- payment_method
- created_at
- updated_at
```

### Bill Items Table
```sql
- id (Primary Key)
- bill_id (Foreign Key → bills)
- product_id (Foreign Key → products)
- quantity
- price
- created_at
```

---

## Environment Variables (.env)

```env
# Database Configuration
DB_HOST=localhost              # MySQL host
DB_USER=root                   # MySQL user
DB_PASSWORD=root               # MySQL password
DB_NAME=billing_app            # Database name
DB_PORT=3306                   # MySQL port

# Server Configuration
PORT=5000                      # Server port
NODE_ENV=development           # Development/Production

# Session Configuration
SESSION_SECRET=your_session_secret_key_here_change_in_production
```

---

## Sample Products (Pre-loaded)

The database comes with sample products:
1. Laptop - ₹45,000 (Stock: 10)
2. Mouse - ₹500 (Stock: 50)
3. Keyboard - ₹1,500 (Stock: 30)
4. Monitor - ₹15,000 (Stock: 5)
5. USB Cable - ₹200 (Stock: 100)
6. Headphones - ₹2,000 (Stock: 25)
7. Printer - ₹8,000 (Stock: 3)
8. Desk Chair - ₹5,000 (Stock: 8)

---

## Complete Billing Workflow

### For Staff:
1. Login with staff credentials
2. Go to "Create Bill" page
3. Search and select products
4. Add to cart by clicking product card
5. Adjust quantities using +/- buttons
6. Enter tax percentage (optional)
7. Select payment method
8. Click "Complete Bill"
9. PDF invoice automatically downloads
10. Stock automatically decreases

### For Admin:
1. Login with admin credentials
2. Manage products from "Products" page
3. Manage staff from "Manage Staff" page
4. View dashboard statistics
5. Generate reports from "Reports" page
6. Download invoices from "Dashboard"

---

## Features Implemented

✓ Role-based access control (Admin/Staff)
✓ Session-based authentication
✓ Product management (CRUD)
✓ Billing & invoicing system
✓ Stock management
✓ PDF invoice generation
✓ Daily & monthly sales reports
✓ Low stock alerts
✓ User management
✓ Input validation
✓ Error handling
✓ Responsive UI design
✓ Cart functionality with tax calculation
✓ Payment method selection
✓ Real-time bill generation
✓ Session timeout

---

## Troubleshooting

### Database Connection Error
```
Error: Access denied for user 'root'@'localhost'
Solution: Check .env file for correct DB_USER and DB_PASSWORD
```

### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::5000
Solution: Change PORT in .env file or kill process using port 5000
```

### Module Not Found
```
Error: Cannot find module 'express'
Solution: Run: npm install in backend directory
```

### CORS Error
```
Error: Access to XMLHttpRequest blocked by CORS policy
Solution: Make sure Express server is running and API_BASE_URL in constants.js is correct
```

---

## Performance Tips

1. **Database Indexing:** Indexes are already created on frequently queried columns
2. **Connection Pooling:** Using mysql2/promise with connection pooling
3. **Session Storage:** Using in-memory sessions (for production, use session store)
4. **Static File Serving:** Express serves frontend files directly
5. **Error Handling:** Try-catch blocks in all API calls

---

## Security Considerations

1. **Password Hashing:** Using bcryptjs for password hashing
2. **Session Management:** 24-hour session timeout via cookies
3. **Input Validation:** All inputs validated on both frontend and backend
4. **SQL Injection Prevention:** Using parameterized queries
5. **CORS Protection:** CORS enabled for localhost only

---

## Production Deployment Checklist

- [ ] Change SESSION_SECRET in .env
- [ ] Use environment-specific database
- [ ] Enable HTTPS (secure cookies)
- [ ] Use production-grade session store (Redis/MongoDB)
- [ ] Set NODE_ENV=production
- [ ] Enable request logging
- [ ] Implement rate limiting
- [ ] Add request validation middleware
- [ ] Set up database backups
- [ ] Configure error monitoring (Sentry)
- [ ] Use PM2 for process management
- [ ] Configure CDN for static files

---

## Additional Notes

- Stock is automatically reduced when bills are created
- Invoices are generated in PDF format using pdfkit
- All amounts are in Indian Rupees (₹)
- Date format: DD/MM/YYYY HH:MM
- The system supports multiple payment methods: Cash, Card, Check, Other

---

## Support & Maintenance

For issues or questions:
1. Check the database schema
2. Verify all dependencies are installed
3. Check server logs for errors
4. Verify MySQL service is running
5. Clear browser cache if needed

---

## License
ISC License - Feel free to use for commercial purposes.

---

**Created:** 2025
**Version:** 1.0.0
**Status:** Production Ready
