import status from "http-status";
import { Prisma } from "@prisma/client";
import { TErrorResponse } from "../interfaces/error.interface";

const getStatusCodeFromPrismaError = (errorCode: string): number => {
    if (errorCode === "P2002") {
        return status.CONFLICT;
    }
    if (["P2025", "P2001", "P2015", "P2018"].includes(errorCode)) {
        return status.NOT_FOUND;
    }
    if (["P1000", "P6002"].includes(errorCode)) {
        return status.UNAUTHORIZED;
    }
    if (["P1010", "P6010"].includes(errorCode)) {
        return status.FORBIDDEN;
    }
    if (errorCode.startsWith("P2")) {
        return status.BAD_REQUEST;
    }
    return status.INTERNAL_SERVER_ERROR;
};

export const handlePrismaClientKnownRequestError = (error: Prisma.PrismaClientKnownRequestError): TErrorResponse => {
    const statusCode = getStatusCodeFromPrismaError(error.code);
    const meta = error.meta as Record<string, unknown> | undefined;

    const modelName = meta?.modelName as string | undefined;
    const target = meta?.target as string[] | string | undefined;

    let message: string;
    let errorPath: string = error.code;

    switch (error.code) {
        case "P2002":
            const fields = Array.isArray(target) ? target.join(", ") : target ? String(target) : "field";
            message = `Unique constraint failed on the ${fields}. A record with this value already exists.`;
            errorPath = fields;
            break;
        case "P2025":
            message = modelName ? `${modelName} record not found` : "The requested record was not found";
            break;
        default:
            message = error.message;
            break;
    }

    return {
        statusCode,
        success: false,
        message,
        errorSources: [{ path: errorPath, message }],
    };
};

export const handlePrismaClientValidationError = (error: Prisma.PrismaClientValidationError): TErrorResponse => {
    return {
        statusCode: status.BAD_REQUEST,
        success: false,
        message: "Database Validation Error. Please check input parameters.",
        errorSources: [{ path: "", message: error.message }],
    };
};

export const handlePrismaClientUnknownError = (error: Prisma.PrismaClientUnknownRequestError): TErrorResponse => {
    return {
        statusCode: status.INTERNAL_SERVER_ERROR,
        success: false,
        message: "An unknown database error occurred.",
        errorSources: [{ path: "", message: error.message }],
    };
};

export const handlerPrismaClientInitializationError = (error: Prisma.PrismaClientInitializationError): TErrorResponse => {
    return {
        statusCode: status.SERVICE_UNAVAILABLE,
        success: false,
        message: "Failed to connect to the database. Please verify database availability.",
        errorSources: [{ path: "", message: error.message }],
    };
};
