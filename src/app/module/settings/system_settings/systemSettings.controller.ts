import { Request, Response } from "express";
import status from "http-status";
import { catchAsync } from "../../../shared/catchAsync";
import { sendResponse } from "../../../shared/sendResponse";
import { systemSettingsService } from "./systemSettings.service";

const getSystemSettings = catchAsync(async (req: Request, res: Response) => {
  const result = await systemSettingsService.getSystemSettings();

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "System settings fetched successfully",
    data: result,
  });
});

const updateSystemSettings = catchAsync(async (req: Request, res: Response) => {
  const result = await systemSettingsService.updateSystemSettings(req.body);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "System settings updated successfully",
    data: result,
  });
});

export const systemSettingsController = {
  getSystemSettings,
  updateSystemSettings,
};
