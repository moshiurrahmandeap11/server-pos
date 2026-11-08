import { NextFunction, Request, Response } from "express";
import status from "http-status";
import { env } from "../config/env";
import AppError from "../errorHelpers/AppError";
import { verifyToken } from "../utils/jwt";

export interface AuthUser {
    id: string;
    email: string;
    role: string;
    roleId: string;
    name: string;
    permissions?: string[];
}

declare global {
    namespace Express {
        interface Request {
            user?: AuthUser;
        }
    }
}

export const checkAuth = (...requiredRoles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            // Read directly from httpOnly cookie or fallback to Authorization header
            const token = req.cookies?.accessToken || (
                req.headers.authorization?.startsWith("Bearer ")
                    ? req.headers.authorization.split(" ")[1]
                    : null
            );

            if (!token) {
                throw new AppError(status.UNAUTHORIZED, "Authentication token missing from cookies. Please login.");
            }

            const decoded = verifyToken(token, env.ACCESS_TOKEN_SECRET) as AuthUser;

            // SUPER_ADMIN has master override
            if (requiredRoles.length > 0 && decoded.role !== "SUPER_ADMIN" && !requiredRoles.includes(decoded.role)) {
                throw new AppError(status.FORBIDDEN, "You do not have permission to perform this action");
            }

            req.user = decoded;
            next();
        } catch (error) {
            next(error);
        }
    };
};
