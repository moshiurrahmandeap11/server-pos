import { Router } from "express";
import { authController } from "./auth.controller";
import { authValidation } from "./auth.validation";
import { validateRequest } from "../../middleware/validateRequest";
import { checkAuth } from "../../middleware/checkAuth";

const router = Router();

router.post(
    "/register",
    validateRequest(authValidation.registerSchema),
    authController.register
);

router.post(
    "/login",
    validateRequest(authValidation.loginSchema),
    authController.login
);

router.post(
    "/verify-pin",
    validateRequest(authValidation.verifySupervisorPinSchema),
    authController.verifySupervisorPin
);

router.get(
    "/me",
    checkAuth(),
    authController.getMyProfile
);

export const authRoutes = router;
