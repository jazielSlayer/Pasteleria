import { Router } from "express";
import { getProductos, getProducto, getProductoByCodigo, createProducto, updateProducto, deleteProducto } from "../controlers/Productos";

const router = Router();

router.get("/productos", getProductos);
router.get("/producto/codigo", getProductoByCodigo); // Query: ?codigo=XXX
router.get("/producto/:id", getProducto);
router.post("/producto/create", createProducto);
router.put("/producto/update/:id", updateProducto);
router.delete("/producto/delete/:id", deleteProducto);

export default router;