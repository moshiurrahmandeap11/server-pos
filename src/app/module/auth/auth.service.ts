import status from "http-status";
import { Role } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import AppError from "../../errorHelpers/AppError";
import { comparePassword, hashPassword } from "../../utils/bcrypt";
import { generateToken } from "../../utils/jwt";
import { env } from "../../config/env";
import { ILoginResponse } from "./auth.interface";

const registerUser = async (payload: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    role?: Role;
    pin?: string;
}) => {
    const existingUser = await prisma.user.findFirst({
        where: {
            OR: [
                { email: payload.email },
                payload.phone ? { phone: payload.phone } : {},
            ],
        },
    });

    if (existingUser) {
        throw new AppError(status.CONFLICT, "User with this email or phone already exists");
    }

    const hashedPassword = await hashPassword(payload.password);
    const hashedPin = payload.pin ? await hashPassword(payload.pin) : null;

    const newUser = await prisma.user.create({
        data: {
            name: payload.name,
            email: payload.email,
            phone: payload.phone,
            password: hashedPassword,
            pin: hashedPin,
            role: payload.role || Role.CASHIER,
        },
        select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            role: true,
            createdAt: true,
        },
    });

    return newUser;
};

const loginUser = async (payload: { email: string; password: string }): Promise<ILoginResponse> => {
    const user = await prisma.user.findUnique({
        where: { email: payload.email },
    });

    if (!user || !user.isActive) {
        throw new AppError(status.UNAUTHORIZED, "Invalid credentials or inactive user account");
    }

    const isMatch = await comparePassword(payload.password, user.password);
    if (!isMatch) {
        throw new AppError(status.UNAUTHORIZED, "Invalid email or password");
    }

    const tokenPayload = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
    };

    const accessToken = generateToken(tokenPayload, env.ACCESS_TOKEN_SECRET, env.ACCESS_TOKEN_EXPIRES_IN);
    const refreshToken = generateToken(tokenPayload, env.REFRESH_TOKEN_SECRET, env.REFRESH_TOKEN_EXPIRES_IN);

    return {
        accessToken,
        refreshToken,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
        },
    };
};

const verifySupervisorPin = async (pin: string, actionType: string) => {
    // Look up supervisors, store managers, or admins
    const authorizedStaff = await prisma.user.findMany({
        where: {
            isActive: true,
            role: {
                in: [Role.SUPERVISOR, Role.STORE_MGR, Role.ADMIN_OWNER],
            },
            pin: {
                not: null,
            },
        },
    });

    let matchedSupervisor = null;

    for (const staff of authorizedStaff) {
        if (staff.pin && (await comparePassword(pin, staff.pin))) {
            matchedSupervisor = staff;
            break;
        }
    }

    if (!matchedSupervisor) {
        throw new AppError(status.FORBIDDEN, "Invalid supervisor PIN. Action denied.");
    }

    // Log the override action into AuditLog
    await prisma.auditLog.create({
        data: {
            userId: matchedSupervisor.id,
            actionType: `SUPERVISOR_OVERRIDE_${actionType.toUpperCase()}`,
            reasonNote: `Authorized by ${matchedSupervisor.name} (${matchedSupervisor.role})`,
        },
    });

    return {
        authorized: true,
        supervisorId: matchedSupervisor.id,
        supervisorName: matchedSupervisor.name,
        role: matchedSupervisor.role,
    };
};

const getMyProfile = async (userId: string) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            role: true,
            createdAt: true,
        },
    });

    if (!user) {
        throw new AppError(status.NOT_FOUND, "User profile not found");
    }

    return user;
};

export const authService = {
    registerUser,
    loginUser,
    verifySupervisorPin,
    getMyProfile,
};
