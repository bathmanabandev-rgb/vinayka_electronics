# Billing & Invoicing System

A complete, production-ready web application for managing bills and invoices with role-based authentication, product management, and sales reporting.

## ✨ Features

### 🔐 Authentication & Authorization
- Admin and Staff login
- Session-based authentication
- Role-based access control
- Password hashing with bcryptjs

### 📦 Product Management (Admin)
- Add, edit, delete products
- Category-based organization
- Barcode support
- Stock quantity tracking
- Search functionality

### 🧾 Billing & Invoicing
- Create bills with multiple items
- Add products directly to cart
- Real-time cart calculations
- Tax calculation (percentage-based)
- Multiple payment methods
- PDF invoice generation
- Auto stock reduction

### 📊 Reports & Analytics
- Daily sales reports
- Monthly sales reports
- Total sales tracking
- Bill count tracking
- Low stock alerts

### 👥 Staff Management (Admin)
- Create and manage staff accounts
- Edit user details
- Delete user accounts
- View staff list

### 📱 Dashboard
- Real-time statistics
- Recent bills table
- Low stock products
- Quick access to all features

## 🛠️ Technology Stack

**Frontend:**
- HTML5
- CSS3 (Responsive Design)
- Vanilla JavaScript (No frameworks)

**Backend:**
- Node.js
- Express.js
- Session-based authentication

**Database:**
- MySQL
- Connection pooling

**Libraries:**
- bcryptjs (Password hashing)
- pdfkit (PDF generation)
- express-session (Session management)
- cors (Cross-origin support)

## 📋 Prerequisites

- Node.js v14+
- MySQL v5.7+
- npm or yarn

## 🚀 Quick Start

### 1. Setup Database
```bash
mysql -u root -p < database/schema.sql
```

### 2. Install Dependencies
```bash
cd backend
npm install
```

### 3. Configure Environment
Edit `.env` file with your database credentials:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=billing_app
PORT=5000
```

### 4. Start Server
```bash
npm start
```

### 5. Open Application
Navigate to `http://localhost:5000`

## 📖 Default Credentials

**Admin Account**
- Username: `admin`
- Password: `admin123`

**Staff Account**
- Username: `staff1`
- Password: `staff123`

## 📁 Project Structure

```
vickey/
├── backend/
│   ├── config/          # Configuration files
│   ├── controllers/     # Business logic
│   ├── models/          # Database models
│   ├── routes/          # API endpoints
│   ├── middleware/      # Custom middleware
│   ├── server.js        # Express server
│   ├── .env             # Environment variables
│   └── package.json     # Dependencies
├── frontend/
│   ├── css/             # Stylesheets
│   ├── js/              # JavaScript modules
│   └── index.html       # Main page
├── database/
│   └── schema.sql       # Database schema
├── SETUP_GUIDE.md       # Detailed setup guide
├── QUICKSTART.md        # Quick start guide
└── README.md            # This file
```

## 🔑 Key Features Detail

### Admin Dashboard
- View total products, sales, and bills
- Monitor low stock products
- Access recent bills
- Full product management
- Staff account management

### Staff Billing Interface
- Search products by name/barcode
- Add multiple products to cart
- Adjust quantities easily
- Calculate total with optional tax
- Choose payment method
- Generate PDF invoice
- Download bill

### Reports Section
- Daily sales analysis
- Monthly sales trends
- Comprehensive financial data

## 🛡️ Security Features

✓ Password hashing with bcryptjs
✓ Session-based authentication
✓ Input validation (frontend & backend)
✓ SQL injection prevention with parameterized queries
✓ CORS protection
✓ HttpOnly secure cookies
✓ Role-based access control

## 📊 Database Schema

### Users Table
- User authentication and roles

### Products Table
- Product catalog with pricing and stock

### Bills Table
- Bill header information

### Bill Items Table
- Individual line items in bills

## 🔌 API Endpoints

All endpoints require authentication except login.

**Authentication:**
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/check` - Check session

**Products:**
- `GET /api/products` - Get all products
- `POST /api/products` - Create product (Admin)
- `PUT /api/products/:id` - Update product (Admin)
- `DELETE /api/products/:id` - Delete product (Admin)

**Bills:**
- `POST /api/bills` - Create bill
- `GET /api/bills/:id` - Get bill details
- `GET /api/bills/:id/invoice` - Download PDF

**Users:**
- `GET /api/users` - Get all users (Admin)
- `POST /api/users` - Create user (Admin)
- `PUT /api/users/:id` - Update user (Admin)

## 🎨 UI/UX Features

- Clean, modern interface
- Sidebar navigation
- Responsive design
- Modal dialogs for forms
- Real-time notifications
- Search functionality
- Data tables with pagination
- Cart management
- Tax calculator

## 🔄 Billing Workflow

1. **Search** products by name or scan barcode
2. **Add** products to cart
3. **Adjust** quantities
4. **Calculate** subtotal with optional tax
5. **Select** payment method
6. **Generate** bill
7. **Download** PDF invoice
8. **Auto-reduce** stock

## 📈 Analytics

Track business performance with:
- Daily sales reports
- Monthly sales trends
- Total revenue
- Number of transactions
- Product-wise sales

## 🐛 Troubleshooting

**Database Connection Error**
- Ensure MySQL is running
- Check credentials in .env
- Verify database exists

**Port Already in Use**
- Change PORT in .env
- Or kill existing process

**Module Not Found**
- Run `npm install` in backend folder

**Login Not Working**
- Clear browser cache
- Check database connection
- Verify session settings

## 📝 Logging

Server logs all requests and errors to console. Check terminal for debugging information.

## 🚀 Deployment

For production deployment:
1. Set `NODE_ENV=production`
2. Use strong `SESSION_SECRET`
3. Configure proper database
4. Enable HTTPS
5. Set up monitoring
6. Use process manager (PM2)

## 📄 License

ISC License - Free for commercial use

## 👨‍💻 Developer Notes

- No external UI frameworks used (pure CSS)
- Clean, readable code structure
- Comprehensive error handling
- Input validation on both ends
- RESTful API design
- Modular JavaScript files
- Production-ready code

## 🤝 Contributing

Feel free to fork and improve this project.

## ⚡ Performance

- Connection pooling enabled
- Database indexes optimized
- Static file caching
- Efficient queries
- Minimal dependencies

## 📞 Support

For issues:
1. Check SETUP_GUIDE.md
2. Review server logs
3. Verify database connection
4. Check .env configuration

---

**Version:** 1.0.0  
**Status:** Production Ready  
**Last Updated:** 2025  

**Enjoy using the Billing System! 🎉**
