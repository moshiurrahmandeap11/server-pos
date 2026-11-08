import { NextFunction, Request, Response } from "express";
import status from "http-status";
import AppError from "../errorHelpers/AppError";

export const checkPermission = (...requiredPermissions: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            const user = req.user;

            if (!user) {
                throw new AppError(status.UNAUTHORIZED, "User must be authenticated to check permissions.");
            }

            // SUPER_ADMIN has full unrestricted master access
            if (user.role === "SUPER_ADMIN") {
                return next();
            }

            const userPermissions = user.permissions || [];

            // Check if user's role has at least one of the required permissions
            const hasPermission = requiredPermissions.some((perm) =>
                userPermissions.includes(perm)
            );

            if (!hasPermission) {
                throw new AppError(
                    status.FORBIDDEN,
                    `Forbidden: Insufficient privileges. Required: [${requiredPermissions.join(", ")}]`
                );
            }

            next();
        } catch (error) {
            next(error);
        }
    };
};
