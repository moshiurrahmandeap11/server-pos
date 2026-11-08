import { Router } from "express";
import { authRoutes } from "../module/auth/auth.route";
import { roleRoutes } from "../module/role/role.route";

const router = Router();

router.use("/auth", authRoutes);
router.use("/roles", roleRoutes);

export const IndexRoutes = router;
