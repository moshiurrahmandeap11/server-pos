import { z } from "zod";

const updatePosSettingsSchema = z.object({
  displayProducts: z.number().int().min(1, "Display products must be at least 1").max(1000, "Maximum limit is 1000").optional(),
  posPinCode: z.string().optional().nullable(),
  defaultCategory: z.string().min(1, "Default category is required").optional(),
  defaultBiller: z.string().min(1, "Default biller is required").optional(),
  defaultCustomer: z.string().min(1, "Default customer is required").optional(),
  displayTime: z.string().optional(),
  onScreenKeyboard: z.string().optional(),
  productButtonColor: z.string().optional(),
  tooltips: z.string().optional(),
  rounding: z.string().optional(),
  itemOrder: z.string().optional(),
  afterSalePage: z.string().optional(),
  displayCustomerDetailsOnReceipt: z.string().optional(),
});

export const posSettingsValidation = {
  updatePosSettingsSchema,
};
