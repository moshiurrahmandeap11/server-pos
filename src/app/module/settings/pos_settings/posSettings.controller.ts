import { Request, Response } from "express";
import status from "http-status";
import { catchAsync } from "../../../shared/catchAsync";
import { sendResponse } from "../../../shared/sendResponse";
import { posSettingsService } from "./posSettings.service";

const getPosSettings = catchAsync(async (req: Request, res: Response) => {
  const result = await posSettingsService.getPosSettings();

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "POS settings fetched successfully",
    data: result,
  });
});

const updatePosSettings = catchAsync(async (req: Request, res: Response) => {
  const result = await posSettingsService.updatePosSettings(req.body);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "POS settings updated successfully",
    data: result,
  });
});

export const posSettingsController = {
  getPosSettings,
  updatePosSettings,
};
