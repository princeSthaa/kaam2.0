export interface PlanFormFields {
  planNo?: string;
  planName?: string;
  quantity?: number;
  startDate?: string;
  endDate?: string;
}

export function validatePlanForm(fields: PlanFormFields): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!fields.planName || fields.planName.trim().length < 3) {
    errors.planName = "Plan title must be at least 3 characters.";
  }

  if (!fields.quantity || fields.quantity <= 0) {
    errors.quantity = "Target production quantity must be greater than zero.";
  }

  if (fields.startDate && fields.endDate) {
    const start = new Date(fields.startDate).getTime();
    const end = new Date(fields.endDate).getTime();
    if (end < start) {
      errors.endDate = "Completion date cannot be before planned start date.";
    }
  }

  return errors;
}
