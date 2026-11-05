import { NextFunction, Request, Response } from "express";
import status from "http-status";
import { Role } from "@prisma/client";
import { env } from "../config/env";
import AppError from "../errorHelpers/AppError";
import { verifyToken } from "../utils/jwt";

export interface AuthUser {
    id: string;
    email: string;
    role: Role;
    name: string;
}

declare global {
    namespace Express {
        interface Request {
            user?: AuthUser;
        }
    }
}

export const checkAuth = (...requiredRoles: Role[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            const authHeader = req.headers.authorization;
            const token = authHeader && authHeader.startsWith("Bearer ")
                ? authHeader.split(" ")[1]
                : req.cookies?.accessToken;

            if (!token) {
                throw new AppError(status.UNAUTHORIZED, "Authentication required. Please login.");
            }

            const decoded = verifyToken(token, env.ACCESS_TOKEN_SECRET) as AuthUser;

            if (requiredRoles.length > 0 && !requiredRoles.includes(decoded.role)) {
                throw new AppError(status.FORBIDDEN, "You do not have permission to perform this action");
            }

            req.user = decoded;
            next();
        } catch (error) {
            next(error);
        }
    };
};
