export interface ProductVariantDto {
  id: string;
  fabricId: string;
  fabricName: string;
  swatchColor: string;
  sizes: Record<string, number>;
}

export interface ProductionProductItemDto {
  productId: string;
  productCode: string;
  productName: string;
  category?: string;
  productImage?: string;
  plannedStartDate?: string;
  plannedCompletionDate?: string;
  requiredDate?: string;
  variants: ProductVariantDto[];
  stages?: any[];
  productionNotes?: string;
  isExpanded?: boolean;
}
