"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));
var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));
var _express = _interopRequireDefault(require("express"));
var _ProduccionOptima = require("../controlers/ProduccionOptima.js");
var router = _express["default"].Router();

// Endpoint principal
router.get('/optimizacion/produccion', /*#__PURE__*/function () {
  var _ref = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee(req, res) {
    var resultado;
    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          _context.next = 3;
          return (0, _ProduccionOptima.optimizarProduccion)();
        case 3:
          resultado = _context.sent;
          res.json(resultado);
          _context.next = 10;
          break;
        case 7:
          _context.prev = 7;
          _context.t0 = _context["catch"](0);
          res.status(500).json({
            success: false,
            message: _context.t0.message
          });
        case 10:
        case "end":
          return _context.stop();
      }
    }, _callee, null, [[0, 7]]);
  }));
  return function (_x, _x2) {
    return _ref.apply(this, arguments);
  };
}());

// Análisis de sensibilidad
router.post('/analisis-sensibilidad', /*#__PURE__*/function () {
  var _ref2 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee2(req, res) {
    var _req$body, recurso, incremento, resultado;
    return _regenerator["default"].wrap(function _callee2$(_context2) {
      while (1) switch (_context2.prev = _context2.next) {
        case 0:
          _context2.prev = 0;
          _req$body = req.body, recurso = _req$body.recurso, incremento = _req$body.incremento;
          if (!(!recurso || incremento === undefined)) {
            _context2.next = 4;
            break;
          }
          return _context2.abrupt("return", res.status(400).json({
            success: false,
            message: 'Se requieren los campos: recurso e incremento'
          }));
        case 4:
          _context2.next = 6;
          return (0, _ProduccionOptima.analizarSensibilidad)(recurso, parseFloat(incremento));
        case 6:
          resultado = _context2.sent;
          res.json(resultado);
          _context2.next = 13;
          break;
        case 10:
          _context2.prev = 10;
          _context2.t0 = _context2["catch"](0);
          res.status(500).json({
            success: false,
            message: _context2.t0.message
          });
        case 13:
        case "end":
          return _context2.stop();
      }
    }, _callee2, null, [[0, 10]]);
  }));
  return function (_x3, _x4) {
    return _ref2.apply(this, arguments);
  };
}());

// Planificación por periodo
router.get('/planificar-periodo/:dias', /*#__PURE__*/function () {
  var _ref3 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee3(req, res) {
    var dias, resultado;
    return _regenerator["default"].wrap(function _callee3$(_context3) {
      while (1) switch (_context3.prev = _context3.next) {
        case 0:
          _context3.prev = 0;
          dias = parseInt(req.params.dias);
          if (!(isNaN(dias) || dias < 1 || dias > 365)) {
            _context3.next = 4;
            break;
          }
          return _context3.abrupt("return", res.status(400).json({
            success: false,
            message: 'Los días deben ser un número entre 1 y 365'
          }));
        case 4:
          _context3.next = 6;
          return (0, _ProduccionOptima.planificarProduccionPeriodo)(dias);
        case 6:
          resultado = _context3.sent;
          res.json(resultado);
          _context3.next = 13;
          break;
        case 10:
          _context3.prev = 10;
          _context3.t0 = _context3["catch"](0);
          res.status(500).json({
            success: false,
            message: _context3.t0.message
          });
        case 13:
        case "end":
          return _context3.stop();
      }
    }, _callee3, null, [[0, 10]]);
  }));
  return function (_x5, _x6) {
    return _ref3.apply(this, arguments);
  };
}());
var _default = exports["default"] = router;