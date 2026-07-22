export interface CustomerFormFields {
  name?: string;
  email?: string;
  phone?: string;
}

export function validateCustomerForm(fields: CustomerFormFields): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!fields.name || fields.name.trim().length < 2) {
    errors.name = "Customer name is required.";
  }

  if (fields.email && !fields.email.includes("@")) {
    errors.email = "Please enter a valid email address.";
  }

  if (fields.phone && fields.phone.trim().length < 7) {
    errors.phone = "Please enter a valid contact phone number.";
  }

  return errors;
}
