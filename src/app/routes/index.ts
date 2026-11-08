import { Router } from "express";
import { authRoutes } from "../module/auth/auth.route";
import { roleRoutes } from "../module/role/role.route";
import { systemSettingsRoutes } from "../module/settings/system_settings/systemSettings.route";

const router = Router();

router.use("/auth", authRoutes);
router.use("/roles", roleRoutes);
router.use("/settings/system-settings", systemSettingsRoutes);

export const IndexRoutes = router;
