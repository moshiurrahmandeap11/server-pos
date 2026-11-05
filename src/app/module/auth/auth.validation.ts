import { z } from "zod";
import { Role } from "@prisma/client";

const loginSchema = z.object({
    email: z.string().email("Please provide a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
});

const registerSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email format"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    phone: z.string().optional(),
    role: z.nativeEnum(Role).optional(),
    pin: z.string().min(4).max(6).optional(), // 4-6 digit supervisor override PIN
});

const verifySupervisorPinSchema = z.object({
    pin: z.string().min(4, "PIN must be at least 4 digits").max(6, "PIN cannot exceed 6 digits"),
    actionType: z.string().min(1, "Action type is required for supervisor override"),
});

export const authValidation = {
    loginSchema,
    registerSchema,
    verifySupervisorPinSchema,
};
