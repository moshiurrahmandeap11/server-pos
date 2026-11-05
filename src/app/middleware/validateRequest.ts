import { NextFunction, Request, Response } from "express";
import z from "zod";
import status from "http-status";
import AppError from "../errorHelpers/AppError";

export const validateRequest = (zodSchema: z.ZodTypeAny) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (req.body.data && typeof req.body.data === "string") {
            try {
                req.body = JSON.parse(req.body.data);
            } catch (error) {
                return next(new AppError(status.BAD_REQUEST, "Invalid JSON in 'data' field"));
            }
        }

        const parsedResult = zodSchema.safeParse(req.body);

        if (!parsedResult.success) {
            const firstIssue = parsedResult.error.issues[0];
            const errorMessage = firstIssue ? `${firstIssue.path.join('.')}: ${firstIssue.message}` : "Validation Failed";
            return next(new AppError(status.BAD_REQUEST, errorMessage));
        }

        req.body = parsedResult.data;
        next();
    };
};
