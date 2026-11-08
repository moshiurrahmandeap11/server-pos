import { Router } from "express";
import { systemSettingsController } from "./systemSettings.controller";
import { systemSettingsValidation } from "./systemSettings.validation";
import { validateRequest } from "../../../middleware/validateRequest";
import { checkAuth } from "../../../middleware/checkAuth";

const router = Router();

router.get(
  "/",
  checkAuth(),
  systemSettingsController.getSystemSettings
);

router.patch(
  "/",
  checkAuth(),
  validateRequest(systemSettingsValidation.updateSystemSettingsSchema),
  systemSettingsController.updateSystemSettings
);

export const systemSettingsRoutes = router;
