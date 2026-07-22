# CRM Feature Module Architecture

Welcome to the **Customer Relationship Management (CRM)** module! This module manages customer profiles, catalog management, sales orders, and audit logging.

---

## 📁 Directory Structure & Responsibilities

```
app/(modules)/crm/
├── api/                    # API Endpoints (customer.api.ts, order.api.ts, catalog.api.ts)
├── components/             # Reusable CRM UI Components
├── constants/              # Domain Constants (CUSTOMER_TYPES, ORDER_STATUSES)
├── dto/                    # Server Data Transfer Objects (customer.dto.ts, order.dto.ts)
├── hooks/                  # Custom React Hooks (useCustomers, useOrders)
├── lib/                    # Helper Utilities (formatCurrency, calculateOrderTotal)
├── schemas/ & validation/  # Form Input Validation Rules (crm-form.validation.ts)
├── services/               # Business Logic Services (crm-calculator.service.ts)
├── styles/                 # Module Stylesheets (index.css, audit.css)
└── [feature-routes]/       # Next.js App Router Page Views (customers, orders, audit)
```
