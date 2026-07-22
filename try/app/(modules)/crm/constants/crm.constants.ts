export const CUSTOMER_TYPES = ["Wholesale", "Retail", "Institutional", "Distributor"] as const;

export const ORDER_STATUSES = ["Draft", "Pending", "Confirmed", "In Production", "Dispatched", "Delivered", "Cancelled"] as const;

export const PAYMENT_TERMS = ["Immediate Cash", "Net 15", "Net 30", "Net 60", "Credit Line"] as const;

export const ORDER_PRIORITIES = ["Normal", "High", "Urgent", "Seasonal"] as const;
