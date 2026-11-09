import { Router } from "express";
import { posSettingsController } from "./posSettings.controller";
import { posSettingsValidation } from "./posSettings.validation";
import { validateRequest } from "../../../middleware/validateRequest";
import { checkAuth } from "../../../middleware/checkAuth";

const router = Router();

// Publicly readable so POS terminals can initialize configuration
router.get("/", posSettingsController.getPosSettings);
router.get("/public", posSettingsController.getPosSettings);

// Protected: Only authenticated administrators can modify POS settings
router.patch(
  "/",
  checkAuth(),
  validateRequest(posSettingsValidation.updatePosSettingsSchema),
  posSettingsController.updatePosSettings
);

export const posSettingsRoutes = router;
