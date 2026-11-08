export interface ISystemSettingsPayload {
  siteName?: string;
  language?: string;
  defaultCurrency?: string;
  accountingMethod?: string;
  defaultEmail?: string;
  defaultCustomerGroup?: string;
  defaultPriceGroup?: string;
  maintenanceMode?: string;
  theme?: string;
  rtlSupport?: string;
  loginCaptcha?: string;
  numberDaysDisableEditing?: number;
  rowsPerPage?: number;
  dateFormat?: string;
  timezone?: string;
  calender?: string;
  defaultWarehouse?: string;
  defaultBiller?: string;
  pdfLibrary?: string;
  useCodeForSlug?: string;

  // Products Configuration Sub-section
  productTax?: string;
  racks?: string;
  productVariants?: string;
  productExpiry?: string;
  removeExpired?: string;
  imageWidth?: number;
  imageHeight?: number;
  thumbnailWidth?: number;
  thumbnailHeight?: number;
  watermark?: string;
  displayWarehouseProducts?: string;
  barcodeSeparator?: string;
  barcodeRenderer?: string;
  updateCostWithPurchase?: string;

  // Sales Configuration Sub-section
  overSelling?: string;
  referenceFormat?: string;
  orderTax?: string;
  productLevelDiscount?: string;
  productSerial?: string;
  autoDetectBarcode?: string;
  productsCountFixBarcode?: number;
  cartItemAdditionMethod?: string;
  defaultOrderPageFocus?: string;
  ksaInvoiceQrCode?: string;
  invoiceView?: string;

  // Prefix Configuration Sub-section
  salesPrefix?: string;
  returnSalePrefix?: string;
  paymentPrefix?: string;
  purchasePaymentPrefix?: string;
  deliveryPrefix?: string;
  quotationPrefix?: string;
  purchasePrefix?: string;
  returnPurchasePrefix?: string;
  transferPrefix?: string;
  expensePrefix?: string;
  qaPrefix?: string;

  // Money and Number Format Sub-section
  decimals?: number;
  quantityDecimals?: number;
  southAsianCurrencyFormat?: string;
  decimalsSeparator?: string;
  thousandsSeparator?: string;
  displayCurrencySymbol?: string;
  currencySymbol?: string;

  // Weighing Scale Barcode Sub-section
  wsBarcodeContains?: string;
  wsBarcodeTotalChars?: number;
  wsFlagChars?: number;
  wsItemCodeStartPos?: number;
  wsItemCodeChars?: number;
  wsWeightStartPos?: number;
  wsWeightChars?: number;
  wsWeightDivideBy?: number;

  // Email Sub-section
  emailProtocol?: string;
}
