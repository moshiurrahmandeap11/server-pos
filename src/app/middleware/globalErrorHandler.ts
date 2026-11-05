import { NextFunction, Request, Response } from "express";
import status from "http-status";
import z from "zod";
import { Prisma } from "@prisma/client";
import { env } from "../config/env";
import AppError from "../errorHelpers/AppError";
import {
    handlePrismaClientKnownRequestError,
    handlePrismaClientUnknownError,
    handlePrismaClientValidationError,
    handlerPrismaClientInitializationError
} from "../errorHelpers/handlePrismaErrors";
import { handleZodError } from "../errorHelpers/handleZodError";
import { TErrorResponse, TErrorSources } from "../interfaces/error.interface";

export const globalErrorHandler = (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if (env.NODE_ENV === "development") {
        console.error("Global Error Caught:", err);
    }

    let errorSources: TErrorSources[] = [];
    let statusCode: number = status.INTERNAL_SERVER_ERROR;
    let message: string = "Internal Server Error";
    let stack: string | undefined = undefined;

    if (err instanceof Prisma.PrismaClientKnownRequestError) {
        const simplified = handlePrismaClientKnownRequestError(err);
        statusCode = simplified.statusCode as number;
        message = simplified.message;
        errorSources = [...simplified.errorSources];
        stack = err.stack;
    } else if (err instanceof Prisma.PrismaClientValidationError) {
        const simplified = handlePrismaClientValidationError(err);
        statusCode = simplified.statusCode as number;
        message = simplified.message;
        errorSources = [...simplified.errorSources];
        stack = err.stack;
    } else if (err instanceof Prisma.PrismaClientInitializationError) {
        const simplified = handlerPrismaClientInitializationError(err);
        statusCode = simplified.statusCode as number;
        message = simplified.message;
        errorSources = [...simplified.errorSources];
        stack = err.stack;
    } else if (err instanceof Prisma.PrismaClientUnknownRequestError) {
        const simplified = handlePrismaClientUnknownError(err);
        statusCode = simplified.statusCode as number;
        message = simplified.message;
        errorSources = [...simplified.errorSources];
        stack = err.stack;
    } else if (err instanceof z.ZodError) {
        const simplified = handleZodError(err);
        statusCode = simplified.statusCode as number;
        message = simplified.message;
        errorSources = [...simplified.errorSources];
        stack = err.stack;
    } else if (err instanceof AppError) {
        statusCode = err.statusCode;
        message = err.message;
        stack = err.stack;
        errorSources = [{ path: "", message: err.message }];
    } else if (err instanceof Error) {
        statusCode = status.INTERNAL_SERVER_ERROR;
        message = err.message;
        stack = err.stack;
        errorSources = [{ path: "", message: err.message }];
    }

    const errorResponse: TErrorResponse = {
        success: false,
        message,
        errorSources,
        error: env.NODE_ENV === "development" ? err : undefined,
        stack: env.NODE_ENV === "development" ? stack : undefined,
    };

    res.status(statusCode).json(errorResponse);
};
