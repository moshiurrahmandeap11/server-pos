import { Router } from "express";
import { systemSettingsController } from "./systemSettings.controller";
import { systemSettingsValidation } from "./systemSettings.validation";
import { validateRequest } from "../../../middleware/validateRequest";
import { checkAuth } from "../../../middleware/checkAuth";

const router = Router();

// Publicly readable so the login screen and unauthenticated clients can load siteName, theme, etc.
router.get("/", systemSettingsController.getSystemSettings);
router.get("/public", systemSettingsController.getSystemSettings);

// Protected: Only authenticated administrators can modify system settings
router.patch(
  "/",
  checkAuth(),
  validateRequest(systemSettingsValidation.updateSystemSettingsSchema),
  systemSettingsController.updateSystemSettings
);

export const systemSettingsRoutes = router;
