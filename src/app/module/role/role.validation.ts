import { z } from "zod";

const createRoleSchema = z.object({
    name: z.string().min(2, "Role identifier must be at least 2 characters").regex(/^[A-Z0-9_]+$/, "Role name must be uppercase alphanumeric with underscores (e.g. CASHIER, STORE_MGR)"),
    displayName: z.string().min(2, "Display name is required"),
    description: z.string().optional(),
    permissionIds: z.array(z.string().uuid("Invalid permission ID")).optional().default([]),
});

const updateRoleSchema = z.object({
    displayName: z.string().min(2).optional(),
    description: z.string().optional(),
    permissionIds: z.array(z.string().uuid("Invalid permission ID")).optional(),
});

export const roleValidation = {
    createRoleSchema,
    updateRoleSchema,
};
