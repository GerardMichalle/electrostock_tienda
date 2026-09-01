import { Router } from "express";
import { asyncHandler } from "../lib/errors";
import { requireAuth, requireRole } from "../middleware/auth";
import { uploadReceipt } from "../middleware/upload";
import {
  createOrder,
  listOrders,
  getOrder,
  getOrderReceiptPdf,
  updateOrderStatus,
  deleteOrder,
} from "../controllers/orders.controller";

const router = Router();

// Público — cliente final crea su pedido en el checkout
router.post("/", uploadReceipt.single("receipt"), asyncHandler(createOrder));

// Admin
router.get("/", requireAuth, requireRole("ADMIN", "STAFF"), asyncHandler(listOrders));
router.get("/:id", requireAuth, requireRole("ADMIN", "STAFF"), asyncHandler(getOrder));
router.get(
  "/:id/receipt-pdf",
  requireAuth,
  requireRole("ADMIN", "STAFF"),
  asyncHandler(getOrderReceiptPdf)
);
router.patch(
  "/:id/status",
  requireAuth,
  requireRole("ADMIN", "STAFF"),
  asyncHandler(updateOrderStatus)
);
router.delete(
  "/:id",
  requireAuth,
  requireRole("ADMIN", "STAFF"),
  asyncHandler(deleteOrder)
);

export default router;
