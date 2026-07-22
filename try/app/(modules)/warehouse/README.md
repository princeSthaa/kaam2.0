# Warehouse Feature Module Architecture

Welcome to the **Warehouse Management** module! This module manages inventory tracking, stock movements, material receipts, rack visualization, and dispatch operations.

---

## 📁 Directory Structure & Responsibilities

```
app/(modules)/warehouse/
├── api/                    # API Endpoints (warehouse.api.ts, stock.api.ts)
├── components/             # Reusable Warehouse UI Components
├── constants/              # Domain Constants (WAREHOUSE_TYPES, STOCK_STATUSES)
├── dto/                    # Server Data Transfer Objects (warehouse.dto.ts, stock.dto.ts)
├── hooks/                  # Custom React Hooks (useWarehouseStock)
├── lib/                    # Helper Utilities (formatStockQty, getStockStatusBadgeClass)
├── schemas/ & validation/  # Form Input Validation Rules (warehouse-form.validation.ts)
├── services/               # Business Calculation Services (warehouse-calculator.service.ts)
├── styles/                 # Module Stylesheets (index.css, warehouse.css)
└── [feature-routes]/       # Next.js App Router Page Views (stock, visualization, receive)
```
