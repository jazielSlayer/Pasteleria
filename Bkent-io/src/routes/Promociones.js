import { Router } from "express";
import { createPromocion, deletePromocion, getPromocion, getPromociones, updatePromocion } from "../controlers/Promociones";

const router = Router();

router.get("/promociones", getPromociones);
router.get("/promocion/:id", getPromocion);
router.post("/promocion/create", createPromocion);
router.put("/promocion/update/:id", updatePromocion);
router.delete("/promocion/delete/:id", deletePromocion);

export default router;