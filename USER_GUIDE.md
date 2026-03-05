# 📚 User Guide - Step-by-Step Operations

## Table of Contents
1. [Login](#login)
2. [For Admin Users](#for-admin-users)
3. [For Staff Users](#for-staff-users)
4. [Common Operations](#common-operations)
5. [Screen Descriptions](#screen-descriptions)

---

## 🔐 Login

### Step 1: Access Application
- Open browser
- Navigate to: `http://localhost:5000`
- You'll see the login page

### Step 2: Enter Credentials

**For Admin:**
```
Username: admin
Password: admin123
```

**For Staff:**
```
Username: staff1
Password: staff123
```

### Step 3: Click Login
- Click the "Login" button
- You'll be redirected to the dashboard

### Expected Result
- Dashboard loads with statistics
- Sidebar shows role-appropriate menu
- Session is established for 24 hours

---

## 👨‍💼 For Admin Users

### Task 1: Add a New Product

**Quick Steps:**
1. Click "Products" in sidebar
2. Click "+ Add Product" button
3. Fill in the form:
   - **Product Name:** e.g., "Wireless Mouse"
   - **Category:** e.g., "Accessories"
   - **Price:** e.g., 1299
   - **Stock Quantity:** e.g., 50
   - **Barcode:** e.g., "MOUSE-001" (optional)
4. Click "Save Product"
5. Product appears in the table

**Form Fields:**
| Field | Type | Required | Example |
|-------|------|----------|---------|
| Product Name | Text | Yes | Wireless Mouse |
| Category | Text | Yes | Accessories |
| Price | Number | Yes | 1299.00 |
| Stock Quantity | Number | Yes | 50 |
| Barcode | Text | No | MOUSE-001 |

### Task 2: Edit a Product

**Quick Steps:**
1. Go to "Products" page
2. Find the product in the table
3. Click "Edit" button
4. Modify the fields
5. Click "Save Product"
6. Changes are saved immediately

### Task 3: Delete a Product

**Quick Steps:**
1. Go to "Products" page
2. Find the product in the table
3. Click "Delete" button
4. Confirm the deletion
5. Product is removed

⚠️ **Note:** You can only delete products with no bills attached.

### Task 4: Search for Products

**Quick Steps:**
1. Go to "Products" page
2. Type in the search box
3. Results filter in real-time
4. Clear search to see all products

**Search Works On:**
- Product name
- Category
- Barcode

### Task 5: View Dashboard Stats

**Dashboard Shows:**
| Widget | Shows | Updates |
|--------|-------|---------|
| Total Products | Count of all products | Real-time |
| Total Sales | Sum of all grand totals | Real-time |
| Total Bills | Count of all bills | Real-time |
| Low Stock Products | Products with ≤10 items | Real-time |
| Recent Bills | Last 10 bills created | Real-time |

### Task 6: View Sales Reports

**Quick Steps:**
1. Click "Reports & Analytics" in sidebar
2. View two sections:
   - **Daily Sales:** Last 30 days of sales
   - **Monthly Sales:** Last 12 months of sales

**Each Report Shows:**
| Column | Data |
|--------|------|
| Date/Month | Sales date or month |
| Sales Amount | Total revenue for period |
| Bills Count | Number of bills in period |

### Task 7: Add a New Staff Member

**Quick Steps:**
1. Click "Manage Staff" in sidebar
2. Click "+ Add Staff" button
3. Fill in the form:
   - **Username:** Must be unique
   - **Email:** Valid email address
   - **Password:** Strong password (will be hashed)
   - **Role:** Select "Staff"
4. Click "Save Staff"
5. Staff account is created

**Staff Form Fields:**
| Field | Type | Required |
|-------|------|----------|
| Username | Text | Yes |
| Email | Email | Yes |
| Password | Password | Yes |
| Role | Dropdown | Yes |

### Task 8: Edit Staff Member

**Quick Steps:**
1. Go to "Manage Staff" page
2. Find staff member in table
3. Click "Edit" button
4. Modify email or role
5. Click "Save Staff"

⚠️ **Note:** Password can't be changed by admin. Staff must change their own password.

### Task 9: Delete Staff Member

**Quick Steps:**
1. Go to "Manage Staff" page
2. Find staff member
3. Click "Delete" button
4. Confirm deletion
5. Staff account is removed

### Task 10: View Recent Bills

**Quick Steps:**
1. Go to Dashboard
2. Scroll to "Recent Bills" section
3. View table with last 10 bills

**Bill Information Shown:**
- Bill ID
- Staff name who created it
- Bill amount
- Date & time
- Payment method
- Download invoice button

### Task 11: Download Invoice

**Quick Steps:**
1. Go to Dashboard
2. Find bill in "Recent Bills" table
3. Click "View Invoice" button
4. PDF file downloads automatically
5. File named: `invoice_[BillID].pdf`

---

## 👨‍💻 For Staff Users

### Task 1: Create a Bill (Complete Workflow)

#### Step 1: Go to Billing Page
- Click "Create Bill" in sidebar
- You'll see products on left, cart on right

#### Step 2: Search for Product
- Use search box to find products
- Can search by name or scan barcode
- Products show as cards with name, price, stock

#### Step 3: Add Product to Cart
- Click on any product card
- Product is added with quantity 1
- Cart updates automatically

#### Step 4: Adjust Quantities
- In cart section, use +/- buttons to adjust
- Or directly click product again to add more
- Remove button to delete item

#### Step 5: Add Tax (Optional)
- In cart summary section
- Enter tax percentage (e.g., 18 for 18%)
- Tax amount auto-calculates

#### Step 6: Select Payment Method
- Dropdown in cart summary
- Options: Cash, Card, Check, Other

#### Step 7: Complete Bill
- Click "Complete Bill" button
- Bill is created
- Stock automatically reduced
- Invoice PDF downloads

#### Step 8: Clear Cart (Optional)
- Click "Clear Cart" to start new bill
- All items removed
- Quantities reset

### Example Billing Flow:

```
Step 1: Log in as staff1
    ↓
Step 2: Click "Create Bill"
    ↓
Step 3: Search "Mouse"
    ↓
Step 4: Click Mouse product (₹500)
    ↓
Step 5: Cart shows: Mouse x1 = ₹500
    ↓
Step 6: Click + button, quantity = 2
    ↓
Step 7: Cart shows: Mouse x2 = ₹1000
    ↓
Step 8: Add Keyboard (₹1500), quantity 1
    ↓
Step 9: Subtotal = ₹2500
    ↓
Step 10: Add 18% tax
    ↓
Step 11: Tax = ₹450
    ↓
Step 12: Grand Total = ₹2950
    ↓
Step 13: Select "Cash" payment
    ↓
Step 14: Click "Complete Bill"
    ↓
Step 15: PDF invoice downloads
    ↓
Step 16: Stock reduced automatically
    ↓
SUCCESS! Bill created
```

### Task 2: View Dashboard

**Staff Dashboard Shows:**
- Same statistics as admin
- Recent bills table
- Quick access to billing page

### Task 3: Download Invoice

**Ways to Download:**
1. **After creating bill:** Auto-downloads
2. **From Dashboard:** "View Invoice" button in recent bills
3. **Same-day bills:** Can download anytime

---

## 🔧 Common Operations

### Operation 1: Search Products

**Location:** Products page or Create Bill page

**How it works:**
1. Type in search box
2. Results filter instantly
3. Search by name, category, or barcode
4. Clear search to see all

### Operation 2: Calculate Bill Total

**Automatic Calculation:**
- Subtotal = Sum of (Quantity × Price)
- Tax = (Subtotal × Tax%) / 100
- Grand Total = Subtotal + Tax

**Example:**
```
Product 1: Mouse × 2 = ₹500 × 2 = ₹1000
Product 2: Keyboard × 1 = ₹1500 × 1 = ₹1500
————————————————————————————
Subtotal: ₹2500
Tax (18%): ₹450
————————————————————————————
Grand Total: ₹2950
```

### Operation 3: Update Stock

**When Stock Changes:**
- When product is added: Stock doesn't change
- When bill is created: Stock reduces by quantity sold
- Stock can't go negative (validation prevents it)

### Operation 4: Logout

**Steps:**
1. Click "Logout" in sidebar
2. Session ends
3. Redirected to login page
4. All session data cleared

### Operation 5: Change Session Password

**Not Yet Implemented** - Add this feature:
1. User account menu (future update)
2. Change Password option
3. Enter current & new password
4. Password updated securely

---

## 📺 Screen Descriptions

### Screen 1: Login Page

**Elements:**
- Centered login card
- Title: "Billing System"
- Username input field
- Password input field
- Login button
- Info box with default credentials

**Actions:**
- Enter credentials
- Click Login
- Or use Enter key

### Screen 2: Dashboard

**Layout:**
- Sidebar on left with navigation
- Main content area on right
- Header with page title and time

**Sections:**
1. **Stats Grid** (4 cards)
   - Total Products
   - Total Sales
   - Total Bills
   - Low Stock Products

2. **Recent Bills Table**
   - Bill ID
   - Staff name
   - Amount
   - Date/time
   - Payment method
   - Actions

**Admin-Only View:**
- All features visible

**Staff View:**
- Same dashboard available

### Screen 3: Products Page (Admin Only)

**Layout:**
- Page header with title and "Add Product" button
- Search box
- Product table

**Table Columns:**
- Product ID
- Name
- Category
- Price
- Stock
- Barcode
- Edit/Delete buttons

**Actions:**
- Search to filter
- Add new product
- Edit product (opens modal)
- Delete product

### Screen 4: Create Bill Page (Staff & Admin)

**Left Section:**
- Search box
- Product cards (grid layout)
- Each card shows: Name, Price, Stock

**Right Section:**
- Cart heading
- List of items in cart
- Each cart item shows: Name, Qty +/-, Price, Remove
- Cart summary:
  - Subtotal
  - Tax % input
  - Calculated tax
  - Grand total
  - Payment method dropdown
  - Complete Bill button

**Actions:**
- Search and add products
- Adjust quantities
- Add tax
- Select payment
- Complete bill (generates PDF)
- Clear cart

### Screen 5: Reports Page (Admin Only)

**Two Sections:**
1. **Daily Sales Report**
   - Table with last 30 days
   - Columns: Date, Sales Amount, Bills Count

2. **Monthly Sales Report**
   - Table with last 12 months
   - Columns: Month, Sales Amount, Bills Count

**Data Updates:**
- Daily sales update after each bill
- Monthly sales update based on date

### Screen 6: Manage Staff Page (Admin Only)

**Layout:**
- Page header with "Add Staff" button
- Staff table

**Table Columns:**
- ID
- Username
- Email
- Role
- Created Date
- Edit/Delete buttons

**Actions:**
- Add new staff member
- Edit staff (modal opens)
- Delete staff

### Screen 7: Add Product Modal

**Form Fields:**
- Product Name (text input)
- Category (text input)
- Price (number input)
- Stock Quantity (number input)
- Barcode (text input, optional)

**Buttons:**
- Cancel (closes modal)
- Save Product (submits form)

**Validation:**
- All fields required except barcode
- Price must be positive
- Stock must be positive

### Screen 8: Add Staff Modal

**Form Fields:**
- Username (text input)
- Email (email input)
- Password (password input)
- Role (dropdown: Staff/Admin)

**Buttons:**
- Cancel (closes modal)
- Save Staff (submits form)

**Validation:**
- All fields required
- Username must be unique
- Email must be valid format
- Password required for new staff

### Screen 9: Notifications

**Types:**
1. **Success** (Green)
   - "Product created successfully"
   - "Bill created successfully"

2. **Error** (Red)
   - "Invalid username or password"
   - "Insufficient stock"

3. **Warning** (Orange)
   - "Insufficient stock"
   - "Low stock products"

4. **Info** (Blue)
   - "Cart cleared"
   - "Invoice downloaded"

**Display:**
- Appears top-right
- Auto-disappears after 3 seconds
- Can contain multiple notifications

---

## 🎯 Common Scenarios

### Scenario 1: New Day, New Staff

**Admin does:**
1. Add new staff member in "Manage Staff"
2. Set username, email, password, role
3. Save staff
4. Provide credentials to staff

**Staff does:**
1. Log in with provided credentials
2. Dashboard appears
3. Ready to create bills

### Scenario 2: Stock Running Low

**What happens:**
1. When stock ≤ 10 items shown as "Low Stock"
2. Admin sees count in "Low Stock Products" card
3. Admin views products, sees stock levels
4. Admin can reorder or contact supplier

**To reorder:**
1. Edit product in Products page
2. Increase stock quantity
3. Save changes

### Scenario 3: Daily Sales Report

**Staff creates bills:**
1. Bill 1: ₹2500
2. Bill 2: ₹3000
3. Bill 3: ₹1500
4. Daily total: ₹7000 (3 bills)

**Admin views reports:**
1. Go to Reports
2. See today's date with ₹7000 sales
3. Bill count: 3

### Scenario 4: Month-End Summary

**Admin needs monthly report:**
1. Go to Reports page
2. Look at monthly sales section
3. See current month's total
4. Compare with previous months
5. Analyze trends

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Enter | Submit form |
| Escape | Close modal |
| Tab | Navigate form fields |
| Ctrl+F | Browser search (products) |

---

## 💡 Tips & Tricks

1. **Fast Billing:** Use barcode scanner with barcode search
2. **Multiple Items:** Keep adding same product to increase quantity
3. **Quick Checkout:** Select payment method before completing bill
4. **Backup:** Invoices are PDFs saved in downloads folder
5. **Reporting:** Export reports to Excel for analysis
6. **Bulk Add:** Currently add items one by one, can optimize in future

---

## ❌ Error Messages & Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| Invalid username/password | Wrong credentials | Check caps lock, try again |
| Insufficient stock | Not enough items | Check stock, reduce quantity |
| Username already exists | Duplicate username | Use different username |
| Invalid email | Wrong format | Use valid email |
| Database connection error | MySQL not running | Start MySQL service |

---

## 📞 Need Help?

- **Setup Issues:** See SETUP_GUIDE.md
- **Quick Start:** See QUICKSTART.md
- **File Details:** See FILE_INDEX.md
- **System Overview:** See README.md

---

**Happy Billing! 🎉**

For more information, refer to the comprehensive documentation files included in the project.
