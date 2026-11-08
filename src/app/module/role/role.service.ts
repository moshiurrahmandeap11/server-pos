import status from "http-status";
import { prisma } from "../../lib/prisma";
import AppError from "../../errorHelpers/AppError";

const createRole = async (payload: {
    name: string;
    displayName: string;
    description?: string;
    permissionIds?: string[];
}) => {
    const existing = await prisma.role.findUnique({
        where: { name: payload.name.toUpperCase() },
    });

    if (existing) {
        throw new AppError(status.CONFLICT, `Role '${payload.name}' already exists.`);
    }

    const newRole = await prisma.role.create({
        data: {
            name: payload.name.toUpperCase(),
            displayName: payload.displayName,
            description: payload.description,
            isSystem: false,
            permissions: payload.permissionIds && payload.permissionIds.length > 0
                ? {
                    create: payload.permissionIds.map((pId) => ({
                        permissionId: pId,
                    })),
                }
                : undefined,
        },
        include: {
            permissions: {
                include: {
                    permission: true,
                },
            },
        },
    });

    return newRole;
};

const getAllRoles = async () => {
    const roles = await prisma.role.findMany({
        include: {
            _count: {
                select: {
                    users: true,
                },
            },
            permissions: {
                include: {
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
        orderBy: {
            createdAt: "asc",
        },
    });

    return roles.map((r) => ({
        id: r.id,
        name: r.name,
        displayName: r.displayName,
        description: r.description,
        isSystem: r.isSystem,
        userCount: r._count.users,
        permissions: r.permissions.map((p) => p.permission),
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
    }));
};

const getRoleById = async (id: string) => {
    const role = await prisma.role.findUnique({
        where: { id },
        include: {
            _count: {
                select: {
                    users: true,
                },
            },
            permissions: {
                include: {
                    permission: true,
                },
            },
        },
    });

    if (!role) {
        throw new AppError(status.NOT_FOUND, "Role not found");
    }

    return {
        id: role.id,
        name: role.name,
        displayName: role.displayName,
        description: role.description,
        isSystem: role.isSystem,
        userCount: role._count.users,
        permissions: role.permissions.map((p) => p.permission),
        createdAt: role.createdAt,
        updatedAt: role.updatedAt,
    };
};

const updateRole = async (
    id: string,
    payload: {
        displayName?: string;
        description?: string;
        permissionIds?: string[];
    }
) => {
    const role = await prisma.role.findUnique({
        where: { id },
    });

    if (!role) {
        throw new AppError(status.NOT_FOUND, "Role not found");
    }

    // If permissionIds provided, replace permissions
    if (payload.permissionIds) {
        await prisma.rolePermission.deleteMany({
            where: { roleId: id },
        });

        if (payload.permissionIds.length > 0) {
            await prisma.rolePermission.createMany({
                data: payload.permissionIds.map((pId) => ({
                    roleId: id,
                    permissionId: pId,
                })),
            });
        }
    }

    const updated = await prisma.role.update({
        where: { id },
        data: {
            displayName: payload.displayName,
            description: payload.description,
        },
        include: {
            permissions: {
                include: {
                    permission: true,
                },
            },
        },
    });

    return updated;
};

const deleteRole = async (id: string) => {
    const role = await prisma.role.findUnique({
        where: { id },
        include: {
            _count: {
                select: { users: true },
            },
        },
    });

    if (!role) {
        throw new AppError(status.NOT_FOUND, "Role not found");
    }

    if (role.isSystem) {
        throw new AppError(status.BAD_REQUEST, "System roles (e.g. SUPER_ADMIN) cannot be deleted.");
    }

    if (role._count.users > 0) {
        throw new AppError(
            status.BAD_REQUEST,
            `Cannot delete role '${role.displayName}'. ${role._count.users} user(s) are currently assigned to it. Reassign them first.`
        );
    }

    await prisma.role.delete({
        where: { id },
    });

    return { success: true, message: `Role '${role.displayName}' deleted successfully.` };
};

const getAllPermissions = async () => {
    const permissions = await prisma.permission.findMany({
        orderBy: [{ module: "asc" }, { code: "asc" }],
    });

    // Group by module for easy UI display
    const grouped = permissions.reduce<Record<string, typeof permissions>>((acc, perm) => {
        if (!acc[perm.module]) {
            acc[perm.module] = [];
        }
        acc[perm.module].push(perm);
        return acc;
    }, {});

    return {
        total: permissions.length,
        modules: grouped,
        all: permissions,
    };
};

export const roleService = {
    createRole,
    getAllRoles,
    getRoleById,
    updateRole,
    deleteRole,
    getAllPermissions,
};
