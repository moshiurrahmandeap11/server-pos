import status from "http-status";
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
    roleId?: string;
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

    // Resolve or validate Role
    let assignedRoleId = payload.roleId;

    if (assignedRoleId) {
        const roleExists = await prisma.role.findUnique({
            where: { id: assignedRoleId },
        });
        if (!roleExists) {
            throw new AppError(status.BAD_REQUEST, "Selected role does not exist");
        }
    } else {
        // Fallback to SUPER_ADMIN or first role
        const defaultRole = await prisma.role.findFirst({
            where: { name: "SUPER_ADMIN" },
        }) || await prisma.role.findFirst();

        if (!defaultRole) {
            throw new AppError(status.INTERNAL_SERVER_ERROR, "No system role found to assign. Please seed roles.");
        }
        assignedRoleId = defaultRole.id;
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
            roleId: assignedRoleId,
        },
        select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            roleId: true,
            role: {
                select: {
                    id: true,
                    name: true,
                    displayName: true,
                },
            },
            createdAt: true,
        },
    });

    return newUser;
};

const loginUser = async (payload: { email: string; password: string }): Promise<ILoginResponse> => {
    const user = await prisma.user.findUnique({
        where: { email: payload.email },
        include: {
            role: {
                include: {
                    permissions: {
                        include: {
                            permission: true,
                        },
                    },
                },
            },
        },
    });

    if (!user || !user.isActive) {
        throw new AppError(status.UNAUTHORIZED, "Invalid credentials or inactive user account");
    }

    const isMatch = await comparePassword(payload.password, user.password);
    if (!isMatch) {
        throw new AppError(status.UNAUTHORIZED, "Invalid email or password");
    }

    const permissions = user.role.permissions.map((rp) => rp.permission.code);

    const tokenPayload = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role.name,
        roleId: user.role.id,
        permissions,
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
            roleId: user.role.id,
            role: user.role.name,
            permissions,
        },
    };
};

const verifySupervisorPin = async (pin: string, actionType: string) => {
    // Look up staff members with an override PIN
    const authorizedStaff = await prisma.user.findMany({
        where: {
            isActive: true,
            pin: {
                not: null,
            },
        },
        include: {
            role: {
                include: {
                    permissions: {
                        include: {
                            permission: true,
                        },
                    },
                },
            },
        },
    });

    let matchedStaff = null;

    for (const staff of authorizedStaff) {
        if (staff.pin && (await comparePassword(pin, staff.pin))) {
            // Verify if staff has supervisor/void permission or is SUPER_ADMIN
            const permissions = staff.role.permissions.map((rp) => rp.permission.code);
            const isAuthorized = staff.role.name === "SUPER_ADMIN" || permissions.includes("pos.order.void");

            if (isAuthorized) {
                matchedStaff = staff;
                break;
            }
        }
    }

    if (!matchedStaff) {
        throw new AppError(status.FORBIDDEN, "Invalid supervisor PIN or unauthorized staff. Action denied.");
    }

    // Log the override action into AuditLog
    await prisma.auditLog.create({
        data: {
            userId: matchedStaff.id,
            actionType: `SUPERVISOR_OVERRIDE_${actionType.toUpperCase()}`,
            reasonNote: `Authorized by ${matchedStaff.name} (${matchedStaff.role.displayName})`,
        },
    });

    return {
        authorized: true,
        supervisorId: matchedStaff.id,
        supervisorName: matchedStaff.name,
        role: matchedStaff.role.name,
        roleDisplayName: matchedStaff.role.displayName,
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
            roleId: true,
            role: {
                select: {
                    id: true,
                    name: true,
                    displayName: true,
                    permissions: {
                        select: {
                            permission: {
                                select: {
                                    id: true,
                                    code: true,
                                    displayName: true,
                                    module: true,
                                },
                            },
                        },
                    },
                },
            },
            createdAt: true,
        },
    });

    if (!user) {
        throw new AppError(status.NOT_FOUND, "User profile not found");
    }

    const permissions = user.role.permissions.map((p) => p.permission.code);

    return {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        roleId: user.roleId,
        role: user.role.name,
        roleDisplayName: user.role.displayName,
        permissions,
        createdAt: user.createdAt,
    };
};

export const authService = {
    registerUser,
    loginUser,
    verifySupervisorPin,
    getMyProfile,
};
