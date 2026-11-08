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

  // Products Configuration Sub-section
  productTax: z.string().optional(),
  racks: z.string().optional(),
  productVariants: z.string().optional(),
  productExpiry: z.string().optional(),
  removeExpired: z.string().optional(),
  imageWidth: z.number().int().positive().optional(),
  imageHeight: z.number().int().positive().optional(),
  thumbnailWidth: z.number().int().positive().optional(),
  thumbnailHeight: z.number().int().positive().optional(),
  watermark: z.string().optional(),
  displayWarehouseProducts: z.string().optional(),
  barcodeSeparator: z.string().optional(),
  barcodeRenderer: z.string().optional(),
  updateCostWithPurchase: z.string().optional(),

  // Sales Configuration Sub-section
  overSelling: z.string().optional(),
  referenceFormat: z.string().optional(),
  orderTax: z.string().optional(),
  productLevelDiscount: z.string().optional(),
  productSerial: z.string().optional(),
  autoDetectBarcode: z.string().optional(),
  productsCountFixBarcode: z.number().int().min(0).optional(),
  cartItemAdditionMethod: z.string().optional(),
  defaultOrderPageFocus: z.string().optional(),
  ksaInvoiceQrCode: z.string().optional(),
  invoiceView: z.string().optional(),

  // Prefix Configuration Sub-section
  salesPrefix: z.string().optional(),
  returnSalePrefix: z.string().optional(),
  paymentPrefix: z.string().optional(),
  purchasePaymentPrefix: z.string().optional(),
  deliveryPrefix: z.string().optional(),
  quotationPrefix: z.string().optional(),
  purchasePrefix: z.string().optional(),
  returnPurchasePrefix: z.string().optional(),
  transferPrefix: z.string().optional(),
  expensePrefix: z.string().optional(),
  qaPrefix: z.string().optional(),

  // Money and Number Format Sub-section
  decimals: z.number().int().min(0).max(10).optional(),
  quantityDecimals: z.number().int().min(0).max(10).optional(),
  southAsianCurrencyFormat: z.string().optional(),
  decimalsSeparator: z.string().optional(),
  thousandsSeparator: z.string().optional(),
  displayCurrencySymbol: z.string().optional(),
  currencySymbol: z.string().optional(),

  // Weighing Scale Barcode Sub-section
  wsBarcodeContains: z.string().optional(),
  wsBarcodeTotalChars: z.number().int().min(0).optional(),
  wsFlagChars: z.number().int().min(0).optional(),
  wsItemCodeStartPos: z.number().int().min(0).optional(),
  wsItemCodeChars: z.number().int().min(0).optional(),
  wsWeightStartPos: z.number().int().min(0).optional(),
  wsWeightChars: z.number().int().min(0).optional(),
  wsWeightDivideBy: z.number().int().min(0).optional(),

  // Email Sub-section
  emailProtocol: z.string().optional(),

  // Award Points Configuration Sub-section
  customerAwardPointsSpent: z.number().min(0).optional(),
  customerAwardPoints: z.number().min(0).optional(),
  staffAwardPointsSale: z.number().min(0).optional(),
  staffAwardPoints: z.number().min(0).optional(),
});

export const systemSettingsValidation = {
  updateSystemSettingsSchema,
};
