export interface OrderItem {
  productName: string;
  quantity: number;
  unitPrice: number;
}

export interface Order {
  id?: string;
  customerId: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  dueDate: string;
  items: OrderItem[];
  createdAt?: string;
  updatedAt?: string;
}
