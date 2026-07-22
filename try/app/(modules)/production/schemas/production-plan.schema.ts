export interface ProductionPlanValidationRules {
  planNameMinLength: number;
  quantityMin: number;
  requiredDateMandatory: boolean;
}

export const defaultProductionPlanValidation: ProductionPlanValidationRules = {
  planNameMinLength: 3,
  quantityMin: 1,
  requiredDateMandatory: true,
};

export function validateProductionPlanForm(data: { planName?: string; quantity?: number; requiredDate?: string }): string[] {
  const errors: string[] = [];
  if (!data.planName || data.planName.trim().length < defaultProductionPlanValidation.planNameMinLength) {
    errors.push(`Plan name must be at least ${defaultProductionPlanValidation.planNameMinLength} characters long.`);
  }
  if (!data.quantity || data.quantity < defaultProductionPlanValidation.quantityMin) {
    errors.push(`Plan quantity must be at least ${defaultProductionPlanValidation.quantityMin}.`);
  }
  if (defaultProductionPlanValidation.requiredDateMandatory && !data.requiredDate) {
    errors.push("Target completion / required date is required.");
  }
  return errors;
}
