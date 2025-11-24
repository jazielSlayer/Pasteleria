"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _express = require("express");
var _Clientes = require("../controlers/Clientes");
var router = (0, _express.Router)();
router.get("/clientes", _Clientes.getClientes);
router.get("/cliente/:id", _Clientes.getCliente);
router.get("/cliente/buscar", _Clientes.buscarCliente);
router.post("/cliente/create", _Clientes.createCliente);
router.put("/cliente/update/:id", _Clientes.updateCliente);
router["delete"]("/cliente/delete/:id", _Clientes.deleteCliente);
var _default = exports["default"] = router;