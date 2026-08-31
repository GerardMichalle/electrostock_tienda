import { Router } from "express";
import { asyncHandler } from "../lib/errors";
import { requireAuth, requireRole } from "../middleware/auth";
import { uploadProductImages } from "../middleware/upload";
import {
  listProducts,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
  deleteProductImage,
} from "../controllers/products.controller";

const router = Router();

// Público
router.get("/", asyncHandler(listProducts));
router.get("/:slug", asyncHandler(getProductBySlug));

// Admin
router.post(
  "/",
  requireAuth,
  requireRole("ADMIN", "STAFF"),
  uploadProductImages.array("images", 8),
  asyncHandler(createProduct)
);
router.patch(
  "/:id",
  requireAuth,
  requireRole("ADMIN", "STAFF"),
  uploadProductImages.array("images", 8),
  asyncHandler(updateProduct)
);
router.delete("/:id", requireAuth, requireRole("ADMIN", "STAFF"), asyncHandler(deleteProduct));
router.delete(
  "/images/:imageId",
  requireAuth,
  requireRole("ADMIN", "STAFF"),
  asyncHandler(deleteProductImage)
);

export default router;
