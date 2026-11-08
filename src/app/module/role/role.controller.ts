import { Request, Response } from "express";
import status from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { roleService } from "./role.service";

const createRole = catchAsync(async (req: Request, res: Response) => {
    const result = await roleService.createRole(req.body);

    sendResponse(res, {
        httpStatusCode: status.CREATED,
        success: true,
        message: "Role created successfully",
        data: result,
    });
});

const getAllRoles = catchAsync(async (req: Request, res: Response) => {
    const result = await roleService.getAllRoles();

    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Roles fetched successfully",
        data: result,
    });
});

const getRoleById = catchAsync(async (req: Request, res: Response) => {
    const roleId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const result = await roleService.getRoleById(roleId);

    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Role details fetched successfully",
        data: result,
    });
});

const updateRole = catchAsync(async (req: Request, res: Response) => {
    const roleId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const result = await roleService.updateRole(roleId, req.body);

    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Role updated successfully",
        data: result,
    });
});

const deleteRole = catchAsync(async (req: Request, res: Response) => {
    const roleId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const result = await roleService.deleteRole(roleId);

    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: result.message,
        data: null,
    });
});

const getAllPermissions = catchAsync(async (req: Request, res: Response) => {
    const result = await roleService.getAllPermissions();

    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Permissions catalog fetched successfully",
        data: result,
    });
});

export const roleController = {
    createRole,
    getAllRoles,
    getRoleById,
    updateRole,
    deleteRole,
    getAllPermissions,
};
