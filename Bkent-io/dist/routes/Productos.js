"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _express = require("express");
var _Productos = require("../controlers/Productos");
var router = (0, _express.Router)();
router.get("/productos", _Productos.getProductos);
router.get("/producto/codigo", _Productos.getProductoByCodigo); // Query: ?codigo=XXX
router.get("/producto/:id", _Productos.getProducto);
router.post("/producto/create", _Productos.createProducto);
router.put("/producto/update/:id", _Productos.updateProducto);
router["delete"]("/producto/delete/:id", _Productos.deleteProducto);
var _default = exports["default"] = router;