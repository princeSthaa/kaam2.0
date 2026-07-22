export interface StockTransferFields {
  sourceWarehouseId?: string;
  targetWarehouseId?: string;
  quantity?: number;
}

export function validateStockTransfer(fields: StockTransferFields): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!fields.sourceWarehouseId) {
    errors.sourceWarehouseId = "Source warehouse is required.";
  }

  if (!fields.targetWarehouseId) {
    errors.targetWarehouseId = "Destination warehouse is required.";
  }

  if (fields.sourceWarehouseId && fields.targetWarehouseId && fields.sourceWarehouseId === fields.targetWarehouseId) {
    errors.targetWarehouseId = "Source and target warehouse cannot be the same.";
  }

  if (!fields.quantity || fields.quantity <= 0) {
    errors.quantity = "Transfer quantity must be greater than zero.";
  }

  return errors;
}
