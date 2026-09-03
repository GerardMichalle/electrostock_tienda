import { Router } from "express";
import { asyncHandler } from "../lib/errors";
import { requireAuth, requireRole } from "../middleware/auth";
import { uploadSettings } from "../middleware/upload";
import { getSettings, updateSettings } from "../controllers/settings.controller";

const router = Router();

// Público — el checkout muestra el número y el QR de pago
router.get("/", asyncHandler(getSettings));

// Admin — multipart porque los QR son imágenes
router.patch(
  "/",
  requireAuth,
  requireRole("ADMIN", "STAFF"),
  uploadSettings.fields([
    { name: "yapeQrFile", maxCount: 1 },
    { name: "plinQrFile", maxCount: 1 },
  ]),
  asyncHandler(updateSettings),
);

export default router;
