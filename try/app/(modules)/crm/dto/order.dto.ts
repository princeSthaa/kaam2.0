export interface OrderItem {
  id?: string;
  productId?: string;
  product?: any;
  productName?: string;
  quantity: number;
  unitPrice: number;
  totalPrice?: number;
  discount?: number;
  orderItemSizes?: Array<{ size: string; quantity: number }>;
  orderItemMaterials?: Array<{ materialId: string; requiredQuantity: number; unit: string }>;
}

export interface Order {
  id?: string;
  customerId: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  dueDate: string;
  orderItems?: OrderItem[];
  items?: OrderItem[];
  createdAt?: string;
  updatedAt?: string;
}
