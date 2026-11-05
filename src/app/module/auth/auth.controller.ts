import { Request, Response } from "express";
import status from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { authService } from "./auth.service";

const register = catchAsync(async (req: Request, res: Response) => {
    const result = await authService.registerUser(req.body);

    sendResponse(res, {
        httpStatusCode: status.CREATED,
        success: true,
        message: "User registered successfully",
        data: result,
    });
});

const login = catchAsync(async (req: Request, res: Response) => {
    const result = await authService.loginUser(req.body);

    // Set secure HTTP-only refresh token cookie
    res.cookie("refreshToken", result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
    });

    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "User logged in successfully",
        data: {
            accessToken: result.accessToken,
            user: result.user,
        },
    });
});

const verifySupervisorPin = catchAsync(async (req: Request, res: Response) => {
    const { pin, actionType } = req.body;
    const result = await authService.verifySupervisorPin(pin, actionType);

    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Supervisor authorization granted",
        data: result,
    });
});

const getMyProfile = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const result = await authService.getMyProfile(userId);

    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "User profile fetched successfully",
        data: result,
    });
});

export const authController = {
    register,
    login,
    verifySupervisorPin,
    getMyProfile,
};
