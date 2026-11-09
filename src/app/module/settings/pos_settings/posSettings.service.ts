import { prisma } from "../../../lib/prisma";
import { IPosSettingsPayload } from "./posSettings.interface";

const getPosSettings = async () => {
  // 1. Fetch system setting to dynamically inherit the system's default biller
  const systemSetting = await prisma.systemSetting.findFirst();
  const systemDefaultBiller = systemSetting?.defaultBiller?.trim() || "Sunshine IT";

  let settings = await prisma.posSetting.findFirst();

  if (!settings) {
    settings = await prisma.posSetting.create({
      data: {
        displayProducts: 100,
        posPinCode: "",
        defaultCategory: "Grocery",
        defaultBiller: systemDefaultBiller,
        defaultCustomer: "Walking Customer",
        displayTime: "No",
        onScreenKeyboard: "Yes",
        productButtonColor: "Default",
        tooltips: "No",
        rounding: "To nearest number (integer)",
        itemOrder: "Default",
        afterSalePage: "Receipt",
        displayCustomerDetailsOnReceipt: "Yes",
      },
    });
  }

  return {
    ...settings,
    systemDefaultBiller,
  };
};

const updatePosSettings = async (payload: IPosSettingsPayload) => {
  const systemSetting = await prisma.systemSetting.findFirst();
  const systemDefaultBiller = systemSetting?.defaultBiller?.trim() || "Sunshine IT";

  const existing = await prisma.posSetting.findFirst();

  if (existing) {
    const updated = await prisma.posSetting.update({
      where: { id: existing.id },
      data: payload,
    });
    return {
      ...updated,
      systemDefaultBiller,
    };
  }

  const created = await prisma.posSetting.create({
    data: {
      displayProducts: payload.displayProducts ?? 100,
      posPinCode: payload.posPinCode ?? "",
      defaultCategory: payload.defaultCategory || "Grocery",
      defaultBiller: payload.defaultBiller || systemDefaultBiller,
      defaultCustomer: payload.defaultCustomer || "Walking Customer",
      displayTime: payload.displayTime || "No",
      onScreenKeyboard: payload.onScreenKeyboard || "Yes",
      productButtonColor: payload.productButtonColor || "Default",
      tooltips: payload.tooltips || "No",
      rounding: payload.rounding || "To nearest number (integer)",
      itemOrder: payload.itemOrder || "Default",
      afterSalePage: payload.afterSalePage || "Receipt",
      displayCustomerDetailsOnReceipt: payload.displayCustomerDetailsOnReceipt || "Yes",
    },
  });

  return {
    ...created,
    systemDefaultBiller,
  };
};

export const posSettingsService = {
  getPosSettings,
  updatePosSettings,
};
