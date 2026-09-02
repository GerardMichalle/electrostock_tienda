import { Router } from "express";
import { asyncHandler } from "../lib/errors";
import { login, me, changePassword } from "../controllers/auth.controller";
import { requireAuth } from "../middleware/auth";
import { rateLimit } from "../middleware/rate-limit";

const router = Router();

// Máximo 10 intentos de login por IP cada 15 minutos.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: "Demasiados intentos de inicio de sesión. Espera 15 minutos.",
});

router.post("/login", loginLimiter, asyncHandler(login));
router.get("/me", requireAuth, asyncHandler(me));
router.patch("/password", requireAuth, asyncHandler(changePassword));

export default router;
