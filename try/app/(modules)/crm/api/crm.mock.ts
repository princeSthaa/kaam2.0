import { Customer } from "../dto/customer.dto";
import { Order } from "../dto/order.dto";
import { Product, Fabric } from "./catalog.api";

export const mockCustomers: Customer[] = [
  {
    id: "cust-mock-1",
    name: "Acme Retailers",
    company: "Acme Corp",
    email: "contact@acme.com",
    phone: "+977-9800000001",
    address: "Kathmandu, Nepal",
    type: "Retail",
    panVat: "123456789",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "cust-mock-2",
    name: "Himalaya Distributors",
    company: "Himalaya Traders",
    email: "info@himalaya.com",
    phone: "+977-9800000002",
    address: "Pokhara, Nepal",
    type: "Wholesale",
    panVat: "987654321",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

export const mockOrders: Order[] = [
  {
    id: "ord-mock-1",
    customerId: "cust-mock-1",
    orderNumber: "ORD-MOCK-1001",
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    totalAmount: 50000,
    status: "Confirmed",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    orderItems: [
      {
        id: "item-mock-1",
        orderId: "ord-mock-1",
        productId: "prod-mock-1",
        quantity: 50,
        unitPrice: 1000,
        product: {
          id: "prod-mock-1",
          name: "Basic Polo Shirt",
          category: "Apparel"
        },
        orderItemSizes: [
          { size: "M", quantity: 20 },
          { size: "L", quantity: 30 }
        ]
      }
    ]
  },
  {
    id: "ord-mock-2",
    customerId: "cust-mock-1",
    orderNumber: "ORD-MOCK-1002",
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    totalAmount: 30000,
    status: "Confirmed",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    orderItems: [
      {
        id: "item-mock-2",
        orderId: "ord-mock-2",
        productId: "prod-mock-2",
        quantity: 100,
        unitPrice: 300,
        product: {
          id: "prod-mock-2",
          name: "Classic Denim Jeans",
          category: "Apparel"
        },
        orderItemSizes: [
          { size: "32", quantity: 50 },
          { size: "34", quantity: 50 }
        ]
      }
    ]
  }
];

export const mockProducts: Product[] = [
  {
    id: "prod-mock-1",
    name: "Basic Polo Shirt",
    sizes: ["S", "M", "L", "XL"],
    imagePath: "polo-shirt.jpg"
  },
  {
    id: "prod-mock-2",
    name: "Classic Denim Jeans",
    sizes: ["30", "32", "34", "36"],
    imagePath: "denim-jeans.jpg"
  }
];

export const mockFabrics: Fabric[] = [
  {
    id: "fab-mock-1",
    name: "Premium Cotton",
    category: "Natural",
    imagePath: "fabric.png"
  },
  {
    id: "fab-mock-2",
    name: "Denim Fabric",
    category: "Cotton Blend",
    imagePath: "fabric.png"
  }
];
