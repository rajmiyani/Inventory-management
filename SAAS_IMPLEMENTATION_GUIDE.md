# 🚀 Cloud Multi-Tenant SaaS Implementation Guide
**Project:** Smart Inventory & POS Management System  
**Repository:** [rajmiyani/Inventory-management](https://github.com/rajmiyani/Inventory-management)  
**Objective:** Transform the existing single-store application into a production-grade, multi-tenant Cloud SaaS platform that supports thousands of independent businesses, multi-user role hierarchy, branch outlets, and subscription monetization.

---

## 📑 Table of Contents
1. [Target Architecture Overview](#1-target-architecture-overview)
2. [Complete Implementation Checklist](#2-complete-implementation-checklist)
3. [Database Models: New & Modified Schemas](#3-database-models-new--modified-schemas)
4. [Backend Middleware & Tenant Isolation](#4-backend-middleware--tenant-isolation)
5. [API Routes Specification](#5-api-routes-specification)
6. [Frontend Changes & New Pages](#6-frontend-changes--new-pages)
7. [Subscription & SaaS Monetization Engine](#7-subscription--saas-monetization-engine)
8. [Real-World Business Functionalities](#8-real-world-business-functionalities)
9. [Enterprise PDF Generation & Document Export Engine](#9-enterprise-pdf-generation--document-export-engine)
10. [Single-Tenant to Multi-Tenant Data Migration Script](#10-single-tenant-to-multi-tenant-data-migration-script)
11. [Cloud Deployment & Security Checklist](#11-cloud-deployment--security-checklist)

---

## 1. Target Architecture Overview

### Current State vs. SaaS Target State

```text
CURRENT SINGLE-STORE DESIGN:
[ User ] ──────> [ Global Products ] ───> [ Global Invoices ] ───> [ Single Global Settings ]
  (Any user sees all inventory and sales; collision on SKU and Invoice numbers)

TARGET MULTI-TENANT SAAS DESIGN:
                                 ┌───────────────────────────────────┐
                                 │   SUPER ADMIN PLATFORM (You)      │
                                 │  - Manage all businesses/tenants  │
                                 │  - Track monthly subscriptions    │
                                 └─────────────────┬─────────────────┘
                                                   │
                 ┌─────────────────────────────────┴─────────────────────────────────┐
                 ▼                                                                   ▼
  ┌───────────────────────────────┐                                   ┌───────────────────────────────┐
  │      BUSINESS TENANT A        │                                   │      BUSINESS TENANT B        │
  │ Business ID: 64f1a...         │                                   │ Business ID: 64f2b...         │
  │ Plan: Growth ($39/mo)         │                                   │ Plan: Starter ($15/mo)        │
  │ Users: Owner, Manager, Cashier│                                   │ Users: Owner, Cashier         │
  ├───────────────────────────────┤                                   ├───────────────────────────────┤
  │ Isolated Products (SKU unique)│                                   │ Isolated Products (SKU unique)│
  │ Isolated Invoices (INV-001)   │                                   │ Isolated Invoices (INV-001)   │
  │ Custom Tax & Business Logo    │                                   │ Custom Tax & Business Logo    │
  └───────────────────────────────┘                                   └───────────────────────────────┘
```

---

## 2. Complete Implementation Checklist

Follow these phases step-by-step when implementing:

### Phase 1: Database & Model Refactoring
- [ ] Create `Server/src/models/Business.js` (Tenant model with custom branding, logo, bank details, & `invoiceSettings`)
- [ ] Update `Server/src/models/User.js` (Add `businessId`, update roles: `superadmin`, `owner`, `manager`, `cashier`)
- [ ] Update `Server/src/models/Product.js` (Add `businessId`, add compound index `{ businessId: 1, sku: 1 }`, add HSN code)
- [ ] Update `Server/src/models/Invoice.js` (Add `businessId`, add compound index `{ businessId: 1, invoiceNo: 1 }`, tax breakdown)
- [ ] Update `Server/src/models/Customer.js` (Add `businessId`, Khata balance tracking)
- [ ] Update `Server/src/models/Purchase.js` (Add `businessId`)
- [ ] Update `Server/src/models/Settings.js` (Add `businessId`, replace global key with tenant reference)
- [ ] Create `Server/src/models/Subscription.js` (Tracks plan, limits, billing cycles, invoice history)

### Phase 2: Auth & Tenant Middleware
- [ ] Update `Server/src/middleware/auth.middleware.js` to extract `businessId` and user role into `req.user` & `req.businessId`
- [ ] Create `Server/src/middleware/rbac.middleware.js` for role verification (`requireRole(['owner', 'manager'])`)
- [ ] Create `Server/src/middleware/subscriptionCheck.middleware.js` to block actions if subscription is expired or limit exceeded

### Phase 3: Backend Routes Overhaul
- [ ] Update `Server/src/routes/auth.routes.js`: Business owner registration flow (creates both User & Business)
- [ ] Create `Server/src/routes/staff.routes.js`: Invite/manage staff members under a business
- [ ] Create `Server/src/routes/tenant.routes.js`: Update company profile, branding, tax registration (GST/VAT)
- [ ] Refactor `Server/src/routes/inventory.routes.js`: Scope all CRUD queries to `req.businessId`
- [ ] Refactor `Server/src/routes/billing.routes.js`: Scope all invoice operations to `req.businessId`
- [ ] Refactor `Server/src/routes/customer.routes.js`: Scope all customer records to `req.businessId`
- [ ] Refactor `Server/src/routes/accounting.routes.js`: Aggregate financial data strictly for `req.businessId`
- [ ] Create `Server/src/routes/subscription.routes.js`: Razorpay / Stripe subscription webhook integration

### Phase 4: Frontend UI Upgrades
- [ ] Update `Client/src/context/AuthContext.jsx`: Store active business metadata and role permissions
- [ ] Build `Client/src/pages/auth/RegisterBusiness.jsx`: 2-step onboarding wizard (Owner Account + Business Profile)
- [ ] Build `Client/src/pages/settings/StaffManagement.jsx`: Add/remove team members & assign roles
- [ ] Build `Client/src/pages/settings/SubscriptionPlans.jsx`: Pricing table, plan upgrade, invoice billing portal
- [ ] Add Role-Based UI Guards (hide accounting/financial dashboards from Cashiers)

### Phase 5: Enterprise PDF & Document Export Engine
- [ ] Implement `Server/src/services/pdfGenerator.service.js`: Server-side vector PDF generator (`pdfkit`) for A4 GST Invoices
- [ ] Implement `Server/src/services/barcodePdf.service.js`: Generate 24-up / 40-up A4 barcode sticker sheets
- [ ] Implement `Server/src/services/email.service.js`: Automated invoice PDF emailing via Nodemailer
- [ ] Implement `Client/src/utils/pdfGenerator.js`: Instant client-side PDF invoice generation (`jspdf` + `jspdf-autotable`)
- [ ] Add Multi-Format PDF Toolbar in `Client/src/pages/billing/InvoiceView.jsx` (Download A4 PDF, Thermal Print, Email)
- [ ] Build Barcode Sticker Printing Modal in `Client/src/pages/inventory/BarcodeGeneratorModal.jsx`
- [ ] Build Customer Khata Statement PDF Export in `Client/src/pages/Customers.jsx`
- [ ] Add Financial Reports PDF Export in `Client/src/pages/Accounting.jsx`

---

## 3. Database Models: New & Modified Schemas

### 1. New Model: `Server/src/models/Business.js`
```javascript
const mongoose = require('mongoose');

const businessSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    email: { type: String, required: true },
    phone: { type: String, default: '' },
    category: { type: String, enum: ['retail', 'pharmacy', 'supermarket', 'electronics', 'wholesale', 'other'], default: 'retail' },
    currency: { type: String, default: 'USD' },
    taxNumber: { type: String, default: '' }, // GSTIN, VAT, or Tax ID
    taxRate: { type: Number, default: 0 },
    logoUrl: { type: String, default: '' },
    address: {
        street: String,
        city: String,
        state: String,
        zip: String,
        country: String
    },
    subscription: {
        plan: { type: String, enum: ['trial', 'starter', 'growth', 'enterprise'], default: 'trial' },
        status: { type: String, enum: ['active', 'past_due', 'canceled', 'trialing'], default: 'trialing' },
        trialEndsAt: { type: Date, default: () => new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) }, // 14-day trial
        validUntil: { type: Date },
        razorpaySubscriptionId: String,
        razorpayCustomerId: String
    },
    limits: {
        maxProducts: { type: Number, default: 50 },
        maxStaff: { type: Number, default: 2 },
        maxInvoicesPerMonth: { type: Number, default: 200 }
    },
    invoiceSettings: {
        template: { type: String, enum: ['modern', 'classic', 'minimal', 'thermal'], default: 'modern' },
        primaryColor: { type: String, default: '#2563EB' }, // Brand accent color
        accentColor: { type: String, default: '#06B6D4' },
        paperSize: { type: String, enum: ['A4', 'letter', 'thermal_80mm', 'thermal_58mm'], default: 'A4' },
        showGstBreakdown: { type: Boolean, default: true },
        showHsn: { type: Boolean, default: true },
        showBankDetails: { type: Boolean, default: true },
        showUpiQr: { type: Boolean, default: true },
        bankDetails: {
            accountName: { type: String, default: '' },
            accountNumber: { type: String, default: '' },
            bankName: { type: String, default: '' },
            ifsc: { type: String, default: '' },
            upiId: { type: String, default: '' } // e.g. merchant@okhdfcbank
        },
        termsAndConditions: { 
            type: String, 
            default: '1. Goods once sold will not be returned.\n2. Invoices are due within 15 days of issue.\n3. Subject to jurisdiction of local courts.' 
        },
        customFooterNote: { type: String, default: 'Thank you for shopping with us!' }
    },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Business', businessSchema);
```

---

### 2. Updated Model: `Server/src/models/User.js`
```javascript
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', index: true },
    role: { 
        type: String, 
        enum: ['superadmin', 'owner', 'manager', 'cashier'], 
        default: 'owner' 
    },
    phone: { type: String, default: '' },
    status: { type: String, enum: ['active', 'suspended'], default: 'active' },
    createdAt: { type: Date, default: Date.now }
});

userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
```

---

### 3. Updated Model: `Server/src/models/Product.js`
```javascript
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
    name: { type: String, required: true },
    sku: { type: String, required: true }, // Barcode / SKU
    category: { type: String, default: 'General' },
    description: { type: String },
    price: { type: Number, required: true },
    purchasePrice: { type: Number, default: 0 },
    stock: { type: Number, default: 0 },
    lowStockThreshold: { type: Number, default: 10 },
    expiryDate: { type: Date },
    unit: { type: String, default: 'pcs' },
    image: { type: String },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// CRITICAL: Compound Index ensures SKU is unique PER BUSINESS only
productSchema.index({ businessId: 1, sku: 1 }, { unique: true });
productSchema.index({ businessId: 1, name: 'text' });

module.exports = mongoose.model('Product', productSchema);
```

---

### 4. Updated Model: `Server/src/models/Invoice.js`
```javascript
const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
    businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
    invoiceNo: { type: String, required: true },
    date: { type: Date, default: Date.now },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
    customerName: { type: String, default: 'Walk-in Customer' },
    customerPhone: { type: String, default: '' },
    cashierId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    cashierName: { type: String },
    items: [{
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        name: { type: String, required: true },
        sku: String,
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
        taxRate: { type: Number, default: 0 },
        total: { type: Number, required: true }
    }],
    subtotal: { type: Number, required: true },
    tax: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    total: { type: Number, required: true },
    paymentStatus: { type: String, enum: ['paid', 'pending', 'partial'], default: 'paid' },
    paymentMethod: { type: String, enum: ['cash', 'card', 'upi', 'razorpay', 'credit'], default: 'cash' },
    notes: { type: String }
});

// Compound Index ensures Invoice Number is unique PER BUSINESS
invoiceSchema.index({ businessId: 1, invoiceNo: 1 }, { unique: true });
invoiceSchema.index({ businessId: 1, date: -1 });

module.exports = mongoose.model('Invoice', invoiceSchema);
```

---

## 4. Backend Middleware & Tenant Isolation

### 1. Updated `Server/src/middleware/auth.middleware.js`
```javascript
const jwt = require('jsonwebtoken');

const verifyToken = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }

    const token = authHeader.split('Bearer ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // { id, role, businessId }
        req.businessId = decoded.businessId; // Injected for all downstream controllers
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Unauthorized: Session invalid or expired' });
    }
};

module.exports = verifyToken;
```

### 2. New `Server/src/middleware/rbac.middleware.js` (Role Permissions)
```javascript
// Restrict endpoint to specified roles: e.g., requireRole(['owner', 'manager'])
const requireRole = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Forbidden: Insufficient privileges' });
        }
        next();
    };
};

module.exports = { requireRole };
```

### 3. New `Server/src/middleware/subscriptionCheck.middleware.js` (SaaS Limits)
```javascript
const Business = require('../models/Business');
const Product = require('../models/Product');

const checkProductLimit = async (req, res, next) => {
    try {
        const business = await Business.findById(req.businessId);
        if (!business) return res.status(404).json({ error: 'Business not found' });

        // Check subscription active status
        const isTrialActive = business.subscription.plan === 'trial' && new Date() < business.subscription.trialEndsAt;
        const isPaidActive = business.subscription.status === 'active' && new Date() < business.subscription.validUntil;

        if (!isTrialActive && !isPaidActive) {
            return res.status(402).json({ 
                error: 'Subscription expired. Please upgrade your plan to continue adding products.' 
            });
        }

        // Check product count limit
        const productCount = await Product.countDocuments({ businessId: req.businessId });
        if (productCount >= business.limits.maxProducts) {
            return res.status(403).json({ 
                error: `Product limit of ${business.limits.maxProducts} reached. Please upgrade your subscription tier.` 
            });
        }

        next();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { checkProductLimit };
```

---

## 5. API Routes Specification

| Method | Endpoint | Required Role | Tenant Scoped? | Description |
| :--- | :--- | :--- | :---: | :--- |
| **POST** | `/api/auth/register-business` | Public | Yes (creates both) | Registers Business Profile + Owner User account |
| **POST** | `/api/auth/login` | Public | Yes | Returns JWT with `userId`, `businessId`, and `role` |
| **GET** | `/api/tenant/profile` | Any Authenticated | Yes | Returns business details, branding, and currency |
| **PUT** | `/api/tenant/profile` | `owner` | Yes | Updates business name, address, tax rate, and logo |
| **GET** | `/api/staff` | `owner`, `manager` | Yes | Lists all staff users belonging to this business |
| **POST** | `/api/staff` | `owner` | Yes | Invites a new staff member (Cashier / Manager) |
| **DELETE**| `/api/staff/:id` | `owner` | Yes | Deactivates or removes a staff member |
| **GET** | `/api/inventory` | Any | Yes (`businessId`) | Returns products strictly for `req.businessId` |
| **POST** | `/api/inventory` | `owner`, `manager` | Yes + Limit Check | Creates product after verifying tier quota |
| **POST** | `/api/billing/generate` | `owner`, `manager`, `cashier` | Yes | Creates invoice scoped to business, auto-decrements stock |
| **GET** | `/api/accounting/stats` | `owner`, `manager` | Yes | Revenue, expenses, and profit strictly for this business |
| **POST** | `/api/subscription/create-plan` | `owner` | Yes | Generates Razorpay / Stripe subscription checkout |
| **POST** | `/api/subscription/webhook` | Gateway (Public) | Global / Signature | Handles automated recurring renewal or cancellation |
| **GET** | `/api/billing/:id/pdf` | `owner`, `manager`, `cashier` | Yes | Streams branded Tax Invoice PDF (A4 / Letter) |
| **GET** | `/api/billing/:id/pdf/thermal` | `owner`, `manager`, `cashier` | Yes | Streams compact 80mm / 58mm Thermal Receipt PDF |
| **POST** | `/api/billing/:id/send-email` | `owner`, `manager`, `cashier` | Yes | Generates PDF invoice & emails directly to customer |
| **POST** | `/api/products/barcodes/pdf` | `owner`, `manager` | Yes | Generates 24-up / 40-up A4 barcode sticker label PDF |
| **GET** | `/api/customers/:id/statement/pdf` | `owner`, `manager` | Yes | Streams customer Khata statement of account PDF |
| **GET** | `/api/accounting/reports/pdf` | `owner`, `manager` | Yes | Generates financial summary / P&L statement PDF |

---

## 6. Frontend Changes & New Pages

### 1. Updated `Client/src/context/AuthContext.jsx`
```javascript
// Store both user and active business context
const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', res.data.token);
    setUser(res.data.user);
    setBusiness(res.data.business); // { id, name, currency, plan, limits }
    return res.data;
};
```

### 2. New Page: `Client/src/pages/auth/RegisterBusiness.jsx`
* **Step 1: Business Details**: Business Name, Category (Retail, Pharmacy, Grocery), Currency, Phone.
* **Step 2: Owner Details**: Owner Full Name, Work Email, Password.
* **Result**: Automatically creates a 14-day Free Trial with sample seed products for their industry.

### 3. New Page: `Client/src/pages/settings/StaffManagement.jsx`
* Table displaying all staff members: Name, Email, Role badge (`Manager` / `Cashier`), Status (`Active`).
* Modal to create new cashier credentials with restricted permissions.

### 4. New Page: `Client/src/pages/settings/SubscriptionPlans.jsx`
* Shows current plan badge (e.g. `14-Day Free Trial - 9 Days Left`).
* Usage Progress Bars:
  * **Products Used**: `28 / 50`
  * **Staff Members**: `1 / 2`
  * **Monthly Invoices**: `74 / 200`
* Upgrade Cards for **Starter**, **Growth**, and **Enterprise** with instant Razorpay checkout button.

### 5. Thermal Receipt View in `Client/src/pages/billing/InvoiceView.jsx`
Add standard 80mm / 58mm CSS print styles so business owners can print directly to POS receipt printers:
```css
@media print {
    body * { visibility: hidden; }
    #thermal-receipt, #thermal-receipt * { visibility: visible; }
    #thermal-receipt {
        position: absolute;
        left: 0;
        top: 0;
        width: 80mm; /* or 58mm for compact receipt printers */
        font-family: 'Courier New', Courier, monospace;
        font-size: 12px;
    }
}
```

---

## 7. Subscription & SaaS Monetization Engine

### Pricing Plan Matrix

```text
┌───────────────────────┬───────────────────────┬───────────────────────┐
│     STARTER PLAN      │      GROWTH PLAN      │    ENTERPRISE PLAN    │
│    $15 / ₹999 /mo     │    $39 / ₹2,499 /mo   │    $89 / ₹5,999 /mo   │
├───────────────────────┼───────────────────────┼───────────────────────┤
│ • Up to 500 Products  │ • Up to 5,000 Products│ • Unlimited Products  │
│ • 2 Cashiers / Staff  │ • 5 Cashiers / Staff  │ • Unlimited Staff     │
│ • 1 Store Outlet      │ • 2 Store Outlets     │ • Multi-Branch Outlet │
│ • Standard Billing    │ • Thermal Print + Bar │ • Advanced Accounting │
│ • Email Reports       │ • Daily SMS Alerts    │ • Dedicated Support   │
└───────────────────────┴───────────────────────┴───────────────────────┘
```

### Automated Billing Workflow (Razorpay / Stripe)
1. Owner clicks **"Upgrade to Growth"** in `SubscriptionPlans.jsx`.
2. Frontend calls `/api/subscription/create-subscription` $\to$ Backend creates Razorpay Subscription.
3. Razorpay checkout popup opens in browser $\to$ Owner pays using Card, UPI, or NetBanking.
4. Razorpay sends `subscription.charged` webhook to `/api/subscription/webhook`.
5. Backend automatically updates `business.subscription.status = 'active'`, updates `limits.maxProducts = 5000`, and sets `validUntil = Date + 30 days`.

---

## 8. Real-World Business Functionalities

To win commercial retail clients against competitors (Vyapar, Zoho, Shopify POS):

1. **GST / VAT Invoicing**:
   - Provide HSN/SAC code field for each product.
   - Automatic CGST & SGST (within state) or IGST (out of state) calculation on the billing page.
2. **Customer Due / Khata Ledger**:
   - Ability to select "Credit / Due" as payment status on billing.
   - Maintain a running balance on the customer card with a "Settle Payment" button.
3. **Barcode Sticker Generation**:
   - Allow owners to select products, choose label size (e.g., 50mm x 25mm), and print barcode stickers directly from browser.
4. **Hold & Resume Carts**:
   - Cashiers can put Cart #1 on hold while a customer fetches another item, serve Cart #2, and recall Cart #1 with one click.
5. **Excel / CSV Product Import & Export**:
   - Bulk upload existing product catalogs using `.xlsx` or `.csv`.
6. **Multi-Format PDF Generation & Automated Email Dispatch**:
   - Instant client-side download of professional A4 GST Tax Invoices and 80mm POS Thermal Receipts.
   - Dynamic UPI payment QR codes embedded directly into PDFs for contact-free instant settlement.
   - Automated background delivery of PDF invoices to customer emails upon POS checkout.
   - Customer Khata statement and Ledger PDF downloads for credit accounting.
   - Printable Barcode sticker sheets (24-up / 40-up A4 labels) for physical inventory tagging.

---

## 9. Enterprise PDF Generation & Document Export Engine

Document export is a mission-critical pillar for commercial SaaS retail systems. Tenants require professional, brand-tailored, multi-format PDFs for tax compliance, accounting audits, and customer communication.

### 1. Hybrid Rendering Strategy: Client-Side vs. Server-Side

A production SaaS must employ a **hybrid rendering architecture**:

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                          HYBRID DOCUMENT EXPORT ARCHITECTURE                           │
├───────────────────────────────────────────┬────────────────────────────────────────────┤
│         CLIENT-SIDE ENGINE (jsPDF)        │       SERVER-SIDE ENGINE (PDFKit)          │
│        (POS Counter & Instant Print)      │    (Automated Email & Batch Export)        │
├───────────────────────────────────────────┼────────────────────────────────────────────┤
│ • Execution: Directly in browser          │ • Execution: Node.js backend streaming     │
│ • Latency: 0 ms network delay             │ • Latency: ~100–300 ms pipeline            │
│ • Server Load: Zero server CPU usage      │ • Server Load: Handled via streams/workers │
│ • Offline Support: Works without internet │ • Automated Dispatch: Nodemailer attachment│
│ • Use Case: Counter sales, thermal print  │ • Use Case: Emailing receipts, bulk audits │
└───────────────────────────────────────────┴────────────────────────────────────────────┘
```

---

### 2. Required NPM Dependencies

Run these commands in their respective workspaces:

```bash
# In Server directory:
cd Server
npm install pdfkit qrcode bwip-js nodemailer

# In Client directory:
cd ../Client
npm install jspdf jspdf-autotable
```

---

### 3. Server-Side Vector PDF Engine (`Server/src/services/pdfGenerator.service.js`)

This service uses `pdfkit` to generate vector-rendered, pixel-perfect A4 GST/VAT Tax Invoices with dynamic tenant branding, custom primary colors, and scan-to-pay UPI QR codes:

```javascript
/**
 * Server/src/services/pdfGenerator.service.js
 * Production-ready Vector PDF Invoice Generator with Multi-Tenant Branding
 */
const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');

/**
 * Generate A4 GST/VAT Tax Invoice PDF and stream to output
 * @param {Object} invoice - Invoice database document
 * @param {Object} business - Tenant business document
 * @param {WritableStream} outputStream - Express response (res) or file stream
 */
async function generateInvoicePdf(invoice, business, outputStream) {
    const doc = new PDFDocument({ 
        size: 'A4', 
        margin: 36,
        info: {
            Title: `Invoice_${invoice.invoiceNo}`,
            Author: business.name || 'SmartInv SaaS',
            Subject: 'Tax Invoice'
        }
    });

    doc.pipe(outputStream);

    const primaryColor = business.invoiceSettings?.primaryColor || '#2563EB';
    const currency = business.currency === 'INR' ? '₹' : (business.currency || '$');
    const pageWidth = doc.page.width;
    const margin = 36;
    const contentWidth = pageWidth - (margin * 2);

    // 1. Top Decorative Brand Banner
    doc.rect(margin, margin, contentWidth, 6).fill(primaryColor);

    // 2. Business Header & Invoice Title
    let currentY = margin + 18;
    
    // Left: Business Info
    doc.fillColor('#0F172A')
       .fontSize(20)
       .font('Helvetica-Bold')
       .text(business.name, margin, currentY);

    doc.fontSize(9)
       .font('Helvetica')
       .fillColor('#475569');

    const address = business.address || {};
    const addressStr = [address.street, address.city, address.state, address.zip].filter(Boolean).join(', ');
    if (addressStr) doc.text(addressStr, margin, doc.y + 2);
    if (business.phone) doc.text(`Phone: ${business.phone}`, margin, doc.y + 1);
    if (business.email) doc.text(`Email: ${business.email}`, margin, doc.y + 1);
    if (business.taxNumber) doc.font('Helvetica-Bold').fillColor('#0F172A').text(`GSTIN / Tax ID: ${business.taxNumber}`, margin, doc.y + 2);

    // Right: Invoice Meta Box
    const metaX = pageWidth - margin - 180;
    doc.font('Helvetica-Bold')
       .fontSize(18)
       .fillColor(primaryColor)
       .text('TAX INVOICE', metaX, currentY, { width: 180, align: 'right' });

    doc.font('Helvetica-Bold')
       .fontSize(10)
       .fillColor('#0F172A')
       .text(`#${invoice.invoiceNo}`, metaX, doc.y + 3, { width: 180, align: 'right' });

    doc.font('Helvetica')
       .fontSize(9)
       .fillColor('#475569')
       .text(`Date: ${new Date(invoice.date).toLocaleDateString(undefined, { dateStyle: 'medium' })}`, metaX, doc.y + 3, { width: 180, align: 'right' })
       .text(`Payment: ${invoice.paymentMethod?.toUpperCase() || 'CASH'}`, metaX, doc.y + 2, { width: 180, align: 'right' })
       .text(`Status: ${invoice.paymentStatus?.toUpperCase() || 'PAID'}`, metaX, doc.y + 2, { width: 180, align: 'right' });

    currentY = Math.max(doc.y, 135) + 15;

    // 3. Bill To Section
    doc.rect(margin, currentY, contentWidth, 52).fillAndStroke('#F8FAFC', '#E2E8F0');

    doc.fillColor('#64748B')
       .font('Helvetica-Bold')
       .fontSize(8)
       .text('BILLED TO (CUSTOMER):', margin + 12, currentY + 8);

    doc.fillColor('#0F172A')
       .font('Helvetica-Bold')
       .fontSize(11)
       .text(invoice.customerName || 'Walk-in Customer', margin + 12, currentY + 20);

    doc.font('Helvetica')
       .fontSize(9)
       .fillColor('#475569')
       .text(`${invoice.customerPhone || 'No Phone'}  |  ${invoice.customerEmail || 'No Email'}`, margin + 12, currentY + 34);

    currentY += 66;

    // 4. Items Table
    const colX = {
        sl: margin,
        desc: margin + 30,
        qty: margin + 260,
        rate: margin + 330,
        tax: margin + 410,
        total: margin + 460
    };

    // Table Header
    doc.rect(margin, currentY, contentWidth, 22).fill(primaryColor);
    doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(8);
    doc.text('#', colX.sl + 6, currentY + 7);
    doc.text('ITEM DESCRIPTION', colX.desc, currentY + 7);
    doc.text('QTY', colX.qty, currentY + 7, { width: 50, align: 'center' });
    doc.text('RATE', colX.rate, currentY + 7, { width: 60, align: 'right' });
    doc.text('TAX', colX.tax, currentY + 7, { width: 40, align: 'right' });
    doc.text('TOTAL', colX.total, currentY + 7, { width: contentWidth - (colX.total - margin) - 8, align: 'right' });

    currentY += 22;

    // Table Rows
    invoice.items.forEach((item, index) => {
        const rowHeight = 24;
        const bg = index % 2 === 0 ? '#FFFFFF' : '#F8FAFC';
        doc.rect(margin, currentY, contentWidth, rowHeight).fill(bg);

        doc.fillColor('#334155').font('Helvetica').fontSize(9);
        doc.text(String(index + 1), colX.sl + 6, currentY + 7);
        
        doc.font('Helvetica-Bold').fillColor('#0F172A').text(item.name, colX.desc, currentY + 7, { width: 220, ellipsis: true });
        
        doc.font('Helvetica').fillColor('#334155');
        doc.text(String(item.quantity), colX.qty, currentY + 7, { width: 50, align: 'center' });
        doc.text(`${currency}${item.price.toFixed(2)}`, colX.rate, currentY + 7, { width: 60, align: 'right' });
        doc.text(item.taxRate ? `${item.taxRate}%` : '0%', colX.tax, currentY + 7, { width: 40, align: 'right' });
        doc.font('Helvetica-Bold').fillColor('#0F172A');
        doc.text(`${currency}${item.total.toFixed(2)}`, colX.total, currentY + 7, { width: contentWidth - (colX.total - margin) - 8, align: 'right' });

        // Divider
        doc.moveTo(margin, currentY + rowHeight).lineTo(margin + contentWidth, currentY + rowHeight).strokeColor('#E2E8F0').lineWidth(0.5).stroke();
        currentY += rowHeight;
    });

    currentY += 15;

    // 5. Totals & Payment Summary
    const totalsWidth = 200;
    const totalsX = pageWidth - margin - totalsWidth;
    
    // Subtotal
    doc.font('Helvetica').fontSize(9).fillColor('#475569').text('Subtotal:', totalsX, currentY);
    doc.font('Helvetica-Bold').fillColor('#0F172A').text(`${currency}${invoice.subtotal.toFixed(2)}`, totalsX, currentY, { width: totalsWidth, align: 'right' });

    // Tax
    currentY += 16;
    doc.font('Helvetica').fillColor('#475569').text(`Estimated Tax (${business.taxRate || 0}%):`, totalsX, currentY);
    doc.font('Helvetica-Bold').fillColor('#0F172A').text(`${currency}${(invoice.tax || 0).toFixed(2)}`, totalsX, currentY, { width: totalsWidth, align: 'right' });

    // Discount if any
    if (invoice.discount > 0) {
        currentY += 16;
        doc.font('Helvetica').fillColor('#10B981').text('Discount:', totalsX, currentY);
        doc.font('Helvetica-Bold').fillColor('#10B981').text(`-${currency}${invoice.discount.toFixed(2)}`, totalsX, currentY, { width: totalsWidth, align: 'right' });
    }

    // Grand Total Bar
    currentY += 20;
    doc.rect(totalsX - 8, currentY - 6, totalsWidth + 8, 30).fill(primaryColor);
    doc.font('Helvetica-Bold').fontSize(11).fillColor('#FFFFFF').text('GRAND TOTAL:', totalsX, currentY);
    doc.fontSize(13).text(`${currency}${invoice.total.toFixed(2)}`, totalsX, currentY - 2, { width: totalsWidth, align: 'right' });

    // 6. UPI QR Code & Bank Details (Left Column)
    const leftBlockY = currentY - 50;
    const upiId = business.invoiceSettings?.bankDetails?.upiId;

    if (upiId && business.invoiceSettings?.showUpiQr !== false) {
        try {
            const upiUrl = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(business.name)}&am=${invoice.total}&cu=INR&tn=Invoice%20${invoice.invoiceNo}`;
            const qrBuffer = await QRCode.toBuffer(upiUrl, { width: 85, margin: 1 });
            doc.image(qrBuffer, margin, leftBlockY, { width: 75, height: 75 });

            doc.font('Helvetica-Bold').fontSize(8).fillColor('#0F172A').text('Scan with UPI to Pay', margin + 85, leftBlockY + 12);
            doc.font('Helvetica').fontSize(8).fillColor('#64748B').text(`UPI ID: ${upiId}`, margin + 85, leftBlockY + 25);
            doc.text('GooglePay / PhonePe / Paytm', margin + 85, leftBlockY + 38);
        } catch (e) {
            console.error('QR code generation error:', e);
        }
    } else if (business.invoiceSettings?.bankDetails?.accountNumber) {
        const bank = business.invoiceSettings.bankDetails;
        doc.font('Helvetica-Bold').fontSize(8).fillColor('#0F172A').text('Bank Account Details:', margin, leftBlockY);
        doc.font('Helvetica').fontSize(8).fillColor('#475569')
           .text(`A/C Name: ${bank.accountName || business.name}`, margin, leftBlockY + 12)
           .text(`A/C No: ${bank.accountNumber}`, margin, leftBlockY + 23)
           .text(`IFSC: ${bank.ifsc || 'N/A'}  |  Bank: ${bank.bankName || 'N/A'}`, margin, leftBlockY + 34);
    }

    // 7. Footer: Terms & Legal Notes
    const footerY = doc.page.height - margin - 45;
    doc.moveTo(margin, footerY).lineTo(margin + contentWidth, footerY).strokeColor('#E2E8F0').lineWidth(0.5).stroke();

    doc.font('Helvetica-Bold').fontSize(7).fillColor('#64748B').text('TERMS & CONDITIONS:', margin, footerY + 8);
    const terms = business.invoiceSettings?.termsAndConditions || '1. Goods once sold will not be returned.\n2. Subject to local jurisdiction.';
    doc.font('Helvetica').fontSize(7).fillColor('#94A3B8').text(terms.replace(/\n/g, '  |  '), margin, footerY + 18, { width: contentWidth - 120 });

    doc.font('Helvetica-Bold').fontSize(8).fillColor('#475569').text('Authorized Signatory', margin + contentWidth - 110, footerY + 25, { width: 110, align: 'center' });

    doc.end();
}

module.exports = { generateInvoicePdf };
```

---

### 4. Client-Side Instant PDF Generator (`Client/src/utils/pdfGenerator.js`)

For lightning-fast checkout counters, this utility runs directly in the cashier's browser using `jspdf` and `jspdf-autotable`. It requires **zero backend calls** and executes in under 50ms:

```javascript
/**
 * Client/src/utils/pdfGenerator.js
 * Instant Browser-Side PDF Invoice Generation with jsPDF & AutoTable
 */
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const exportInvoiceToPdf = (invoice, business = {}, options = { download: true }) => {
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
    });

    const primaryColor = business?.invoiceSettings?.primaryColor || '#2563EB';
    const currency = business?.currency === 'INR' ? '₹' : (business?.currency || '$');
    
    // Convert Hex to RGB
    const hexToRgb = (hex) => {
        const bigint = parseInt(hex.replace('#', ''), 16);
        return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
    };
    const primaryRgb = hexToRgb(primaryColor);

    // 1. Header Banner
    doc.setFillColor(...primaryRgb);
    doc.rect(14, 12, 182, 3, 'F');

    // 2. Business Info (Left)
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(15, 23, 42);
    doc.text(business?.name || 'SmartInv Store', 14, 24);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139);
    
    let currentY = 29;
    const address = business?.address;
    if (address?.street || address?.city) {
        doc.text(`${address?.street || ''}, ${address?.city || ''} ${address?.state || ''}`, 14, currentY);
        currentY += 4.5;
    }
    if (business?.phone) {
        doc.text(`Phone: ${business.phone}`, 14, currentY);
        currentY += 4.5;
    }
    if (business?.taxNumber) {
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(15, 23, 42);
        doc.text(`GSTIN / Tax ID: ${business.taxNumber}`, 14, currentY);
        currentY += 6;
    }

    // 3. Invoice Meta (Right)
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(...primaryRgb);
    doc.text('TAX INVOICE', 196, 24, { align: 'right' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text(`#${invoice.invoiceNo}`, 196, 30, { align: 'right' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139);
    doc.text(`Date: ${new Date(invoice.date).toLocaleDateString(undefined, { dateStyle: 'medium' })}`, 196, 35, { align: 'right' });
    doc.text(`Payment: ${(invoice.paymentMethod || 'cash').toUpperCase()}`, 196, 40, { align: 'right' });
    doc.text(`Status: ${(invoice.paymentStatus || 'paid').toUpperCase()}`, 196, 45, { align: 'right' });

    // 4. Customer Box
    const boxY = Math.max(currentY + 2, 48);
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(14, boxY, 182, 18, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text('BILLED TO:', 18, boxY + 5.5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text(invoice.customerName || 'Walk-in Customer', 18, boxY + 11);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(`${invoice.customerPhone || 'No Phone'}  |  ${invoice.customerEmail || 'No Email'}`, 18, boxY + 15.5);

    // 5. Line Items Table
    const tableBody = invoice.items.map((item, index) => [
        index + 1,
        item.name,
        item.quantity,
        `${currency}${item.price.toFixed(2)}`,
        item.taxRate ? `${item.taxRate}%` : '0%',
        `${currency}${item.total.toFixed(2)}`
    ]);

    autoTable(doc, {
        startY: boxY + 22,
        head: [['#', 'Item Description', 'Qty', 'Unit Price', 'Tax %', 'Total']],
        body: tableBody,
        theme: 'striped',
        headStyles: {
            fillColor: primaryRgb,
            textColor: [255, 255, 255],
            fontSize: 8.5,
            fontStyle: 'bold',
            halign: 'left'
        },
        columnStyles: {
            0: { cellWidth: 10, halign: 'center' },
            1: { cellWidth: 80, fontStyle: 'bold' },
            2: { cellWidth: 20, halign: 'center' },
            3: { cellWidth: 26, halign: 'right' },
            4: { cellWidth: 20, halign: 'right' },
            5: { cellWidth: 26, halign: 'right', fontStyle: 'bold' }
        },
        styles: {
            fontSize: 8.5,
            cellPadding: 2.8,
            overflow: 'linebreak'
        },
        margin: { left: 14, right: 14 }
    });

    // 6. Totals Block
    const finalY = doc.lastAutoTable.finalY + 6;
    const totalsX = 140;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text('Subtotal:', totalsX, finalY);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(`${currency}${invoice.subtotal.toFixed(2)}`, 196, finalY, { align: 'right' });

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(`Tax (${business?.taxRate || 0}%):`, totalsX, finalY + 5.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(`${currency}${(invoice.tax || 0).toFixed(2)}`, 196, finalY + 5.5, { align: 'right' });

    if (invoice.discount > 0) {
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(16, 185, 129);
        doc.text('Discount:', totalsX, finalY + 11);
        doc.setFont('helvetica', 'bold');
        doc.text(`-${currency}${invoice.discount.toFixed(2)}`, 196, finalY + 11, { align: 'right' });
    }

    // Grand Total Highlight
    const barY = invoice.discount > 0 ? finalY + 15 : finalY + 10;
    doc.setFillColor(...primaryRgb);
    doc.roundedRect(totalsX - 4, barY, 60, 9, 1.5, 1.5, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(255, 255, 255);
    doc.text('TOTAL DUE:', totalsX, barY + 6);
    doc.text(`${currency}${invoice.total.toFixed(2)}`, 194, barY + 6, { align: 'right' });

    // 7. Footer
    const pageHeight = doc.internal.pageSize.getHeight();
    doc.setDrawColor(226, 232, 240);
    doc.line(14, pageHeight - 16, 196, pageHeight - 16);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text(business?.invoiceSettings?.customFooterNote || 'Thank you for your business!', 14, pageHeight - 10);
    doc.text(`Page 1 of 1`, 196, pageHeight - 10, { align: 'right' });

    if (options.download) {
        doc.save(`Invoice_${invoice.invoiceNo}.pdf`);
    } else {
        return doc.output('bloburl');
    }
};
```

---

### 5. Barcode Label Sheet PDF Generator (`Server/src/services/barcodePdf.service.js`)

Tenants print barcode stickers on standard A4 peel-off sticker sheets to label shelves and retail goods. This service builds mathematically precise label grids using `bwip-js`:

```javascript
/**
 * Server/src/services/barcodePdf.service.js
 * Generates Standard A4 Sticker Sheets (24-up / 40-up) & Thermal Rolls
 */
const PDFDocument = require('pdfkit');
const bwipjs = require('bwip-js');

// Standard label sheet dimensions (in points: 1mm = 2.83465pt)
const TEMPLATES = {
    '24-up': { cols: 3, rows: 8, labelW: 180, labelH: 96, padX: 14, padY: 18 },
    '40-up': { cols: 4, rows: 10, labelW: 137, labelH: 72, padX: 10, padY: 12 }
};

async function generateBarcodeSheet({ products, template = '24-up', businessName }, stream) {
    const doc = new PDFDocument({ size: 'A4', margin: 20 });
    doc.pipe(stream);

    const config = TEMPLATES[template] || TEMPLATES['24-up'];
    const maxPerPage = config.cols * config.rows;
    let currentIdx = 0;

    for (const prod of products) {
        const copies = prod.copies || 1;
        
        // Generate Code128 vector barcode image
        const barcodeBuffer = await bwipjs.toBuffer({
            bcid: 'code128',
            text: prod.sku,
            scale: 2,
            height: 8,
            includetext: false
        });

        for (let i = 0; i < copies; i++) {
            if (currentIdx > 0 && currentIdx % maxPerPage === 0) {
                doc.addPage();
            }

            const slot = currentIdx % maxPerPage;
            const col = slot % config.cols;
            const row = Math.floor(slot / config.cols);

            const x = 20 + (col * (config.labelW + config.padX));
            const y = 20 + (row * (config.labelH + config.padY));

            // Sticker Border Box
            doc.rect(x, y, config.labelW, config.labelH).strokeColor('#E2E8F0').lineWidth(0.5).stroke();

            // Label Content
            doc.font('Helvetica-Bold').fontSize(7).fillColor('#64748B').text(businessName || 'STORE', x + 4, y + 4, { width: config.labelW - 8, align: 'center' });
            doc.font('Helvetica-Bold').fontSize(8.5).fillColor('#0F172A').text(prod.name, x + 4, y + 14, { width: config.labelW - 8, align: 'center', ellipsis: true });
            
            // Embed Barcode
            doc.image(barcodeBuffer, x + (config.labelW - 110) / 2, y + 26, { width: 110, height: 26 });
            
            // SKU Text & Price
            doc.font('Helvetica').fontSize(7.5).fillColor('#475569').text(prod.sku, x + 4, y + 54, { width: config.labelW - 8, align: 'center' });
            doc.font('Helvetica-Bold').fontSize(10).fillColor('#0F172A').text(`MRP: ₹${prod.price.toFixed(2)}`, x + 4, y + 64, { width: config.labelW - 8, align: 'center' });

            currentIdx++;
        }
    }

    doc.end();
}

module.exports = { generateBarcodeSheet };
```

---

### 6. Automated Invoice Email Dispatch (`Server/src/services/email.service.js`)

When a cashier completes a sale, the system can automatically generate a vector PDF and email it directly to the customer:

```javascript
/**
 * Server/src/services/email.service.js
 * Delivers generated PDF Invoices directly to Customer Inbox
 */
const nodemailer = require('nodemailer');
const { generateInvoicePdf } = require('./pdfGenerator.service');
const { PassThrough } = require('stream');

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.sendgrid.net',
    port: process.env.SMTP_PORT || 587,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

async function emailInvoiceToCustomer(invoice, business, recipientEmail) {
    // Generate PDF in memory buffer
    const stream = new PassThrough();
    const chunks = [];
    stream.on('data', chunk => chunks.push(chunk));

    await generateInvoicePdf(invoice, business, stream);
    const pdfBuffer = Buffer.concat(chunks);

    const mailOptions = {
        from: `"${business.name}" <${process.env.SMTP_FROM || 'billing@smartinv.pro'}>`,
        to: recipientEmail,
        subject: `Your Receipt from ${business.name} (#${invoice.invoiceNo})`,
        html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
                <h2 style="color: #2563EB; margin-bottom: 8px;">${business.name}</h2>
                <p style="color: #475569; font-size: 15px;">Hello <b>${invoice.customerName || 'Valued Customer'}</b>,</p>
                <p style="color: #475569; font-size: 14px;">Thank you for your purchase! Your invoice <b>#${invoice.invoiceNo}</b> of <b>₹${invoice.total.toFixed(2)}</b> has been generated.</p>
                <p style="color: #475569; font-size: 14px;">A copy of your tax invoice is attached as a PDF to this email.</p>
                <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
                <p style="color: #94a3b8; font-size: 12px;">For any billing questions, reach us at ${business.email || 'support'}.</p>
            </div>
        `,
        attachments: [
            {
                filename: `Invoice_${invoice.invoiceNo}.pdf`,
                content: pdfBuffer,
                contentType: 'application/pdf'
            }
        ]
    };

    return await transporter.sendMail(mailOptions);
}

module.exports = { emailInvoiceToCustomer };
```

---

### 7. Express Route Handlers in `Server/src/routes/billing.routes.js`

Mount the PDF and email streaming endpoints:

```javascript
const { generateInvoicePdf } = require('../services/pdfGenerator.service');
const { emailInvoiceToCustomer } = require('../services/email.service');
const Business = require('../models/Business');

// GET /api/billing/:id/pdf - Stream Tax Invoice PDF
router.get('/:id/pdf', async (req, res) => {
    try {
        const invoice = await Invoice.findOne({ _id: req.params.id, businessId: req.businessId });
        if (!invoice) return res.status(404).json({ error: 'Invoice not found' });

        const business = await Business.findById(req.businessId);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename="Invoice_${invoice.invoiceNo}.pdf"`);

        await generateInvoicePdf(invoice, business, res);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/billing/:id/send-email - Email Invoice PDF to customer
router.post('/:id/send-email', async (req, res) => {
    try {
        const invoice = await Invoice.findOne({ _id: req.params.id, businessId: req.businessId });
        if (!invoice) return res.status(404).json({ error: 'Invoice not found' });

        const recipientEmail = req.body.email || invoice.customerEmail;
        if (!recipientEmail) return res.status(400).json({ error: 'No recipient email provided' });

        const business = await Business.findById(req.businessId);
        await emailInvoiceToCustomer(invoice, business, recipientEmail);

        res.json({ success: true, message: `Invoice sent to ${recipientEmail}` });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
```

---

### 8. Frontend UI Action Toolbar (`Client/src/pages/billing/InvoiceView.jsx`)

Provide 1-click action buttons on the invoice page:

```jsx
import { exportInvoiceToPdf } from '../../utils/pdfGenerator';
import { Download, Printer, Mail, FileText } from 'lucide-react';

// Inside InvoiceView component:
<div className="d-flex gap-2 no-print">
    {/* 1. Fast Client-Side A4 Download */}
    <button 
        onClick={() => exportInvoiceToPdf(invoice, activeBusiness)} 
        className="btn btn-primary d-flex align-items-center gap-2 px-4 py-2 rounded-3 shadow-sm"
    >
        <Download size={18} />
        <span className="fw-bold">Download A4 PDF</span>
    </button>

    {/* 2. Direct Browser Thermal Roll Print */}
    <button 
        onClick={() => window.print()} 
        className="btn btn-light-pro border d-flex align-items-center gap-2 px-4 py-2 rounded-3"
    >
        <Printer size={18} />
        <span className="fw-bold">Thermal Print</span>
    </button>

    {/* 3. Automated Email Dispatch */}
    <button 
        onClick={handleSendEmail} 
        className="btn btn-light-pro border d-flex align-items-center gap-2 px-4 py-2 rounded-3"
    >
        <Mail size={18} />
        <span className="fw-bold">Email PDF</span>
    </button>
</div>
```

---

## 10. Single-Tenant to Multi-Tenant Data Migration Script

Save this script as `Server/scripts/migrate_to_saas.js`. Run it once with `node Server/scripts/migrate_to_saas.js` to migrate any existing single-tenant data safely:

```javascript
/**
 * Migration Script: Single-Tenant to Multi-Tenant
 * Creates a default business entity and links all existing orphan products,
 * invoices, customers, and users to this business.
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Business = require('../src/models/Business');
const User = require('../src/models/User');
const Product = require('../src/models/Product');
const Invoice = require('../src/models/Invoice');
const Customer = require('../src/models/Customer');
const Settings = require('../src/models/Settings');

async function migrate() {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB for SaaS migration...');

    // 1. Find or create default admin user
    let admin = await User.findOne({ role: 'admin' });
    if (!admin) {
        admin = await User.findOne();
    }

    if (!admin) {
        console.error('No users found in database. Create a user first.');
        process.exit(1);
    }

    // 2. Create Default Business Tenant
    let defaultBusiness = await Business.findOne({ slug: 'main-store' });
    if (!defaultBusiness) {
        defaultBusiness = new Business({
            name: 'Main Business Store',
            slug: 'main-store',
            ownerId: admin._id,
            email: admin.email,
            currency: 'USD',
            subscription: {
                plan: 'enterprise',
                status: 'active',
                validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
            },
            limits: { maxProducts: 99999, maxStaff: 50, maxInvoicesPerMonth: 99999 }
        });
        await defaultBusiness.save();
        console.log(`Created default business: ${defaultBusiness.name} (${defaultBusiness._id})`);
    }

    const businessId = defaultBusiness._id;

    // 3. Link all models
    const userRes = await User.updateMany({ businessId: { $exists: false } }, { $set: { businessId, role: 'owner' } });
    console.log(`Updated Users: ${userRes.modifiedCount}`);

    const prodRes = await Product.updateMany({ businessId: { $exists: false } }, { $set: { businessId } });
    console.log(`Updated Products: ${prodRes.modifiedCount}`);

    const invRes = await Invoice.updateMany({ businessId: { $exists: false } }, { $set: { businessId } });
    console.log(`Updated Invoices: ${invRes.modifiedCount}`);

    const custRes = await Customer.updateMany({ businessId: { $exists: false } }, { $set: { businessId } });
    console.log(`Updated Customers: ${custRes.modifiedCount}`);

    console.log('✅ SaaS Migration completed successfully!');
    process.exit(0);
}

migrate().catch(err => {
    console.error('Migration failed:', err);
    process.exit(1);
});
```

---

## 11. Cloud Deployment & Security Checklist

### 1. MongoDB Atlas Setup
* Create a Free M0 or M10 Cluster on [MongoDB Atlas](https://www.mongodb.com/atlas).
* Create a dedicated database user with read/write privileges.
* Configure Network Access (`0.0.0.0/0` with secure credentials).
* Create compound indexes on Atlas for peak query speeds.

### 2. Backend Cloud Deployment (Render / Railway / AWS ECS)
* Set environment variables in Cloud Dashboard:
  ```env
  PORT=5000
  MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.mongodb.net/smart-inventory-saas?retryWrites=true&w=majority
  JWT_SECRET=<generate_a_64_character_random_string>
  RAZORPAY_KEY_ID=rzp_live_xxxxxxxx
  RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxx
  FRONTEND_URL=https://app.yourdomain.com
  ```

### 3. Frontend Cloud Deployment (Vercel / Cloudflare Pages)
* Build Command: `npm run build`
* Output Directory: `dist`
* Environment Variables:
  ```env
  VITE_API_URL=https://api.yourdomain.com/api
  ```
* Set up Single Page App rewrites in `Client/vercel.json`:
  ```json
  {
    "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
  }
  ```

### 4. Custom Domain & Branding
* Primary Marketing Site: `https://yourdomain.com` (Pricing, Features, Signup)
* SaaS Web App: `https://app.yourdomain.com` (POS & Dashboard)
* Cloudflare Free SSL & DDoS protection.

---

*Keep this implementation file as your master roadmap. You can execute each phase whenever you are ready!*
