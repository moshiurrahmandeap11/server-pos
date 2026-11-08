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
}
