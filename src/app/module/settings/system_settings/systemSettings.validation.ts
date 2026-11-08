import { z } from "zod";

const updateSystemSettingsSchema = z.object({
  siteName: z.string().min(1, "Site name is required").optional(),
  language: z.string().min(1, "Language is required").optional(),
  defaultCurrency: z.string().min(1, "Default currency is required").optional(),
  accountingMethod: z.string().min(1, "Accounting method is required").optional(),
  defaultEmail: z.string().email("Invalid email format").optional(),
  defaultCustomerGroup: z.string().min(1, "Default customer group is required").optional(),
  defaultPriceGroup: z.string().min(1, "Default price group is required").optional(),
  maintenanceMode: z.string().optional(),
  theme: z.string().optional(),
  rtlSupport: z.string().optional(),
  loginCaptcha: z.string().optional(),
  numberDaysDisableEditing: z.number().int().min(0).optional(),
  rowsPerPage: z.number().int().min(1).max(500).optional(),
  dateFormat: z.string().optional(),
  timezone: z.string().optional(),
  calender: z.string().optional(),
  defaultWarehouse: z.string().optional(),
  defaultBiller: z.string().optional(),
  pdfLibrary: z.string().optional(),
  useCodeForSlug: z.string().optional(),
});

export const systemSettingsValidation = {
  updateSystemSettingsSchema,
};
