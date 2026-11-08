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
    },
  });

  return created;
};

export const systemSettingsService = {
  getSystemSettings,
  updateSystemSettings,
};
