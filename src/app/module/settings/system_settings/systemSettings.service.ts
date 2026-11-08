import { prisma } from "../../../lib/prisma";
import { ISystemSettingsPayload } from "./systemSettings.interface";

const getSystemSettings = async () => {
  let settings = await prisma.systemSetting.findFirst();

  if (!settings) {
    settings = await prisma.systemSetting.create({
      data: {
        siteName: "Sunshine IT",
        language: "English",
        defaultCurrency: "BDT",
        accountingMethod: "AVCO (Average Cost Method)",
        defaultEmail: "sunshine.com.bd@gmail.com",
        defaultCustomerGroup: "General",
        defaultPriceGroup: "Default",
        maintenanceMode: "No",
        theme: "Default",
        rtlSupport: "Disable",
        loginCaptcha: "Disable",
        numberDaysDisableEditing: 0,
        rowsPerPage: 10,
        dateFormat: "dd-mm-yyyy",
        timezone: "Asia/Dhaka",
        calender: "Shared",
        defaultWarehouse: "Uth (1)",
        defaultBiller: "Sunshine IT",
        pdfLibrary: "mPDF",
        useCodeForSlug: "Enable",
        productTax: "Enable",
        racks: "Disable",
        productVariants: "Enable",
        productExpiry: "Disable",
        removeExpired: "No, I will remove manually",
        imageWidth: 800,
        imageHeight: 800,
        thumbnailWidth: 150,
        thumbnailHeight: 150,
        watermark: "Yes",
        displayWarehouseProducts: "Hide with 0 quantity",
        barcodeSeparator: "Dot (.)",
        barcodeRenderer: "Image",
        updateCostWithPurchase: "No",
      },
    });
  }

  return settings;
};

const updateSystemSettings = async (payload: ISystemSettingsPayload) => {
  const existing = await prisma.systemSetting.findFirst();

  if (existing) {
    const updated = await prisma.systemSetting.update({
      where: { id: existing.id },
      data: payload,
    });
    return updated;
  }

  // Create if none exists
  const created = await prisma.systemSetting.create({
    data: {
      siteName: payload.siteName || "Sunshine IT",
      language: payload.language || "English",
      defaultCurrency: payload.defaultCurrency || "BDT",
      accountingMethod: payload.accountingMethod || "AVCO (Average Cost Method)",
      defaultEmail: payload.defaultEmail || "sunshine.com.bd@gmail.com",
      defaultCustomerGroup: payload.defaultCustomerGroup || "General",
      defaultPriceGroup: payload.defaultPriceGroup || "Default",
      maintenanceMode: payload.maintenanceMode || "No",
      theme: payload.theme || "Default",
      rtlSupport: payload.rtlSupport || "Disable",
      loginCaptcha: payload.loginCaptcha || "Disable",
      numberDaysDisableEditing: payload.numberDaysDisableEditing ?? 0,
      rowsPerPage: payload.rowsPerPage ?? 10,
      dateFormat: payload.dateFormat || "dd-mm-yyyy",
      timezone: payload.timezone || "Asia/Dhaka",
      calender: payload.calender || "Shared",
      defaultWarehouse: payload.defaultWarehouse || "Uth (1)",
      defaultBiller: payload.defaultBiller || "Sunshine IT",
      pdfLibrary: payload.pdfLibrary || "mPDF",
      useCodeForSlug: payload.useCodeForSlug || "Enable",
      productTax: payload.productTax || "Enable",
      racks: payload.racks || "Disable",
      productVariants: payload.productVariants || "Enable",
      productExpiry: payload.productExpiry || "Disable",
      removeExpired: payload.removeExpired || "No, I will remove manually",
      imageWidth: payload.imageWidth ?? 800,
      imageHeight: payload.imageHeight ?? 800,
      thumbnailWidth: payload.thumbnailWidth ?? 150,
      thumbnailHeight: payload.thumbnailHeight ?? 150,
      watermark: payload.watermark || "Yes",
      displayWarehouseProducts: payload.displayWarehouseProducts || "Hide with 0 quantity",
      barcodeSeparator: payload.barcodeSeparator || "Dot (.)",
      barcodeRenderer: payload.barcodeRenderer || "Image",
      updateCostWithPurchase: payload.updateCostWithPurchase || "No",
    },
  });

  return created;
};

export const systemSettingsService = {
  getSystemSettings,
  updateSystemSettings,
};
