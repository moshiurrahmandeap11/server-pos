import { Router } from "express";
import { roleController } from "./role.controller";
import { roleValidation } from "./role.validation";
import { validateRequest } from "../../middleware/validateRequest";
import { checkAuth } from "../../middleware/checkAuth";
import { checkPermission } from "../../middleware/checkPermission";

const router = Router();

// Master permissions catalog
router.get(
    "/permissions/catalog",
    checkAuth(),
    roleController.getAllPermissions
);

// Role CRUD
router.post(
    "/",
    checkAuth(),
    checkPermission("roles.manage"),
    validateRequest(roleValidation.createRoleSchema),
    roleController.createRole
);

router.get(
    "/",
    checkAuth(),
    roleController.getAllRoles
);

router.get(
    "/:id",
    checkAuth(),
    roleController.getRoleById
);

router.patch(
    "/:id",
    checkAuth(),
    checkPermission("roles.manage"),
    validateRequest(roleValidation.updateRoleSchema),
    roleController.updateRole
);

router.delete(
    "/:id",
    checkAuth(),
    checkPermission("roles.manage"),
    roleController.deleteRole
);

export const roleRoutes = router;
