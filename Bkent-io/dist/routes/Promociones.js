"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _express = require("express");
var _Promociones = require("../controlers/Promociones");
var router = (0, _express.Router)();
router.get("/promociones", _Promociones.getPromociones);
router.get("/promocion/:id", _Promociones.getPromocion);
router.post("/promocion/create", _Promociones.createPromocion);
router.put("/promocion/update/:id", _Promociones.updatePromocion);
router["delete"]("/promocion/delete/:id", _Promociones.deletePromocion);
var _default = exports["default"] = router;