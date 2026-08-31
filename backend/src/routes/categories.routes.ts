import { Router } from "express";
import { asyncHandler } from "../lib/errors";
import { requireAuth, requireRole } from "../middleware/auth";
import {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  moveCategory,
  createSubcategory,
  updateSubcategory,
  deleteSubcategory,
  moveSubcategory,
} from "../controllers/categories.controller";

const router = Router();

// Público
router.get("/", asyncHandler(listCategories));

// Admin — categorías
router.post("/", requireAuth, requireRole("ADMIN", "STAFF"), asyncHandler(createCategory));
router.patch("/:id", requireAuth, requireRole("ADMIN", "STAFF"), asyncHandler(updateCategory));
router.delete("/:id", requireAuth, requireRole("ADMIN", "STAFF"), asyncHandler(deleteCategory));
router.patch("/:id/move", requireAuth, requireRole("ADMIN", "STAFF"), asyncHandler(moveCategory));

// Admin — subcategorías
router.post(
  "/:id/subcategories",
  requireAuth,
  requireRole("ADMIN", "STAFF"),
  asyncHandler(createSubcategory)
);
router.patch(
  "/:id/subcategories/:subId",
  requireAuth,
  requireRole("ADMIN", "STAFF"),
  asyncHandler(updateSubcategory)
);
router.delete(
  "/:id/subcategories/:subId",
  requireAuth,
  requireRole("ADMIN", "STAFF"),
  asyncHandler(deleteSubcategory)
);
router.patch(
  "/:id/subcategories/:subId/move",
  requireAuth,
  requireRole("ADMIN", "STAFF"),
  asyncHandler(moveSubcategory)
);

export default router;
