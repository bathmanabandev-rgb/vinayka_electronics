# Quick Start Guide

## 5-Minute Setup

### 1. Create Database (1 min)
```bash
mysql -u root -p < database/schema.sql
```
When prompted, enter your MySQL root password.

### 2. Install Backend Dependencies (2 min)
```bash
cd backend
npm install
```

### 3. Start Backend Server (1 min)
```bash
npm start
```

You should see:

```
✓ Database connected successfully
✓ Server running on http://localhost:5000
curl -o invoice.pdf http://localhost:3000/api/bills/public/1/invoice
```



### 4. Open in Browser (1 min)
Navigate to: **http://localhost:5000**

---

## Login

**Admin:**
- Username: `admin`
- Password: `admin123`

**Staff:**
- Username: `staff1`
- Password: `staff123`

---

## Common Tasks

### Add a Product (Admin)
1. Click "Products" in sidebar
2. Click "+ Add Product" button
3. Fill in details
4. Click "Save Product"

### Create a Bill (Staff)
1. Click "Create Bill"
2. Search for product
3. Click product card to add to cart
4. Adjust quantity
5. Click "Complete Bill"
6. Invoice PDF downloads automatically

### View Reports (Admin)
1. Click "Reports & Analytics"
2. View daily and monthly sales data

### Add Staff Member (Admin)
1. Click "Manage Staff"
2. Click "+ Add Staff" button
3. Fill in credentials
4. Click "Save Staff"

---

## Troubleshooting

**Can't connect to database?**
- Check MySQL is running
- Verify credentials in `.env` file
- Ensure database is created: `mysql -u root -p -e "SELECT * FROM billing_app.users;"`

**Port 5000 already in use?**
- Edit `.env` and change PORT=5001 (or any available port)

**Dependencies not installing?**
- Delete `node_modules` folder
- Run `npm cache clean --force`
- Run `npm install` again

---

## API Testing with Postman

**Base URL:** `http://localhost:5000/api`

Example: `POST http://localhost:5000/api/auth/login`
Body (raw JSON):
```json
{
  "username": "admin",
  "password": "admin123"
}
```

---

**Happy Billing! 🎉**
