"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.updateProveedor = exports.getProveedores = exports.getProveedor = exports.deleteProveedor = exports.createProveedor = void 0;
var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));
var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));
var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));
var _database = require("../database");
// src/controlers/Provedor.js

/* ==================== OBTENER TODOS LOS PROVEEDORES ==================== */
var getProveedores = exports.getProveedores = /*#__PURE__*/function () {
  var _ref = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee(req, res) {
    var pool, _yield$pool$query, _yield$pool$query2, rows;
    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) switch (_context.prev = _context.next) {
        case 0:
          _context.next = 2;
          return (0, _database.connect)();
        case 2:
          pool = _context.sent;
          _context.prev = 3;
          _context.next = 6;
          return pool.query("\n            SELECT \n                proveedor_id,\n                nombre,\n                nit,\n                telefono,\n                direccion,\n                contacto,\n                plazo_pago_dias,\n                activo\n            FROM Proveedores\n            WHERE activo = 1\n            ORDER BY nombre ASC\n        ");
        case 6:
          _yield$pool$query = _context.sent;
          _yield$pool$query2 = (0, _slicedToArray2["default"])(_yield$pool$query, 1);
          rows = _yield$pool$query2[0];
          res.json(rows);
          _context.next = 16;
          break;
        case 12:
          _context.prev = 12;
          _context.t0 = _context["catch"](3);
          console.error('Error fetching proveedores:', _context.t0);
          res.status(500).json({
            message: 'Error al obtener proveedores'
          });
        case 16:
          _context.prev = 16;
          return _context.finish(16);
        case 18:
        case "end":
          return _context.stop();
      }
    }, _callee, null, [[3, 12, 16, 18]]);
  }));
  return function getProveedores(_x, _x2) {
    return _ref.apply(this, arguments);
  };
}();

/* ==================== OBTENER UN PROVEEDOR POR ID ==================== */
var getProveedor = exports.getProveedor = /*#__PURE__*/function () {
  var _ref2 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee2(req, res) {
    var pool, _yield$pool$query3, _yield$pool$query4, rows;
    return _regenerator["default"].wrap(function _callee2$(_context2) {
      while (1) switch (_context2.prev = _context2.next) {
        case 0:
          _context2.next = 2;
          return (0, _database.connect)();
        case 2:
          pool = _context2.sent;
          _context2.prev = 3;
          _context2.next = 6;
          return pool.query("\n            SELECT \n                proveedor_id,\n                nombre,\n                nit,\n                telefono,\n                direccion,\n                contacto,\n                plazo_pago_dias,\n                activo\n            FROM Proveedores\n            WHERE proveedor_id = ?\n        ", [req.params.id]);
        case 6:
          _yield$pool$query3 = _context2.sent;
          _yield$pool$query4 = (0, _slicedToArray2["default"])(_yield$pool$query3, 1);
          rows = _yield$pool$query4[0];
          if (!(rows.length === 0)) {
            _context2.next = 11;
            break;
          }
          return _context2.abrupt("return", res.status(404).json({
            message: 'Proveedor no encontrado'
          }));
        case 11:
          res.json(rows[0]);
          _context2.next = 18;
          break;
        case 14:
          _context2.prev = 14;
          _context2.t0 = _context2["catch"](3);
          console.error('Error fetching proveedor:', _context2.t0);
          res.status(500).json({
            message: 'Error al obtener proveedor'
          });
        case 18:
        case "end":
          return _context2.stop();
      }
    }, _callee2, null, [[3, 14]]);
  }));
  return function getProveedor(_x3, _x4) {
    return _ref2.apply(this, arguments);
  };
}();

/* ==================== CREAR NUEVO PROVEEDOR ==================== */
var createProveedor = exports.createProveedor = /*#__PURE__*/function () {
  var _ref3 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee3(req, res) {
    var pool, _req$body, nombre, _req$body$nit, nit, _req$body$telefono, telefono, _req$body$direccion, direccion, _req$body$contacto, contacto, _req$body$plazo_pago_, plazo_pago_dias, _yield$pool$query5, _yield$pool$query6, result;
    return _regenerator["default"].wrap(function _callee3$(_context3) {
      while (1) switch (_context3.prev = _context3.next) {
        case 0:
          _context3.next = 2;
          return (0, _database.connect)();
        case 2:
          pool = _context3.sent;
          _req$body = req.body, nombre = _req$body.nombre, _req$body$nit = _req$body.nit, nit = _req$body$nit === void 0 ? null : _req$body$nit, _req$body$telefono = _req$body.telefono, telefono = _req$body$telefono === void 0 ? null : _req$body$telefono, _req$body$direccion = _req$body.direccion, direccion = _req$body$direccion === void 0 ? null : _req$body$direccion, _req$body$contacto = _req$body.contacto, contacto = _req$body$contacto === void 0 ? null : _req$body$contacto, _req$body$plazo_pago_ = _req$body.plazo_pago_dias, plazo_pago_dias = _req$body$plazo_pago_ === void 0 ? 30 : _req$body$plazo_pago_;
          _context3.prev = 4;
          if (!(!nombre || nombre.trim().length < 3)) {
            _context3.next = 7;
            break;
          }
          return _context3.abrupt("return", res.status(400).json({
            message: 'El nombre es obligatorio (mín. 3 caracteres)'
          }));
        case 7:
          _context3.next = 9;
          return pool.query("\n            INSERT INTO Proveedores \n                (nombre, nit, telefono, direccion, contacto, plazo_pago_dias, activo)\n            VALUES (?, ?, ?, ?, ?, ?, 1)\n        ", [nombre.trim(), (nit === null || nit === void 0 ? void 0 : nit.trim()) || null, (telefono === null || telefono === void 0 ? void 0 : telefono.trim()) || null, (direccion === null || direccion === void 0 ? void 0 : direccion.trim()) || null, (contacto === null || contacto === void 0 ? void 0 : contacto.trim()) || null, parseInt(plazo_pago_dias)]);
        case 9:
          _yield$pool$query5 = _context3.sent;
          _yield$pool$query6 = (0, _slicedToArray2["default"])(_yield$pool$query5, 1);
          result = _yield$pool$query6[0];
          res.status(201).json({
            message: 'Proveedor creado exitosamente',
            proveedor_id: result.insertId
          });
          _context3.next = 21;
          break;
        case 15:
          _context3.prev = 15;
          _context3.t0 = _context3["catch"](4);
          console.error('Error creating proveedor:', _context3.t0);
          if (!(_context3.t0.code === 'ER_DUP_ENTRY')) {
            _context3.next = 20;
            break;
          }
          return _context3.abrupt("return", res.status(400).json({
            message: 'Ya existe un proveedor con ese NIT'
          }));
        case 20:
          res.status(500).json({
            message: 'Error al crear proveedor'
          });
        case 21:
        case "end":
          return _context3.stop();
      }
    }, _callee3, null, [[4, 15]]);
  }));
  return function createProveedor(_x5, _x6) {
    return _ref3.apply(this, arguments);
  };
}();

/* ==================== ACTUALIZAR PROVEEDOR ==================== */
var updateProveedor = exports.updateProveedor = /*#__PURE__*/function () {
  var _ref4 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee4(req, res) {
    var pool, id, updates, fields, values, _updates$nit, _updates$telefono, _updates$direccion, _updates$contacto;
    return _regenerator["default"].wrap(function _callee4$(_context4) {
      while (1) switch (_context4.prev = _context4.next) {
        case 0:
          _context4.next = 2;
          return (0, _database.connect)();
        case 2:
          pool = _context4.sent;
          id = req.params.id;
          updates = req.body;
          _context4.prev = 5;
          fields = [];
          values = [];
          if (updates.nombre !== undefined) {
            fields.push('nombre = ?');
            values.push(updates.nombre.trim());
          }
          if (updates.nit !== undefined) {
            fields.push('nit = ?');
            values.push(((_updates$nit = updates.nit) === null || _updates$nit === void 0 ? void 0 : _updates$nit.trim()) || null);
          }
          if (updates.telefono !== undefined) {
            fields.push('telefono = ?');
            values.push(((_updates$telefono = updates.telefono) === null || _updates$telefono === void 0 ? void 0 : _updates$telefono.trim()) || null);
          }
          if (updates.direccion !== undefined) {
            fields.push('direccion = ?');
            values.push(((_updates$direccion = updates.direccion) === null || _updates$direccion === void 0 ? void 0 : _updates$direccion.trim()) || null);
          }
          if (updates.contacto !== undefined) {
            fields.push('contacto = ?');
            values.push(((_updates$contacto = updates.contacto) === null || _updates$contacto === void 0 ? void 0 : _updates$contacto.trim()) || null);
          }
          if (updates.plazo_pago_dias !== undefined) {
            fields.push('plazo_pago_dias = ?');
            values.push(parseInt(updates.plazo_pago_dias));
          }
          if (!(fields.length === 0)) {
            _context4.next = 16;
            break;
          }
          return _context4.abrupt("return", res.status(400).json({
            message: 'No se enviaron datos para actualizar'
          }));
        case 16:
          values.push(id);
          _context4.next = 19;
          return pool.query("UPDATE Proveedores SET ".concat(fields.join(', '), " WHERE proveedor_id = ?"), values);
        case 19:
          res.json({
            message: 'Proveedor actualizado correctamente'
          });
          _context4.next = 28;
          break;
        case 22:
          _context4.prev = 22;
          _context4.t0 = _context4["catch"](5);
          console.error('Error updating proveedor:', _context4.t0);
          if (!(_context4.t0.code === 'ER_DUP_ENTRY')) {
            _context4.next = 27;
            break;
          }
          return _context4.abrupt("return", res.status(400).json({
            message: 'Ya existe otro proveedor con ese NIT'
          }));
        case 27:
          res.status(500).json({
            message: 'Error al actualizar proveedor'
          });
        case 28:
        case "end":
          return _context4.stop();
      }
    }, _callee4, null, [[5, 22]]);
  }));
  return function updateProveedor(_x7, _x8) {
    return _ref4.apply(this, arguments);
  };
}();

/* ==================== DESACTIVAR PROVEEDOR ==================== */
var deleteProveedor = exports.deleteProveedor = /*#__PURE__*/function () {
  var _ref5 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee5(req, res) {
    var pool, id, _yield$pool$query7, _yield$pool$query8, result;
    return _regenerator["default"].wrap(function _callee5$(_context5) {
      while (1) switch (_context5.prev = _context5.next) {
        case 0:
          _context5.next = 2;
          return (0, _database.connect)();
        case 2:
          pool = _context5.sent;
          id = req.params.id;
          _context5.prev = 4;
          _context5.next = 7;
          return pool.query('UPDATE Proveedores SET activo = 0 WHERE proveedor_id = ?', [id]);
        case 7:
          _yield$pool$query7 = _context5.sent;
          _yield$pool$query8 = (0, _slicedToArray2["default"])(_yield$pool$query7, 1);
          result = _yield$pool$query8[0];
          if (!(result.affectedRows === 0)) {
            _context5.next = 12;
            break;
          }
          return _context5.abrupt("return", res.status(404).json({
            message: 'Proveedor no encontrado'
          }));
        case 12:
          res.json({
            message: 'Proveedor desactivado correctamente'
          });
          _context5.next = 19;
          break;
        case 15:
          _context5.prev = 15;
          _context5.t0 = _context5["catch"](4);
          console.error('Error desactivando proveedor:', _context5.t0);
          res.status(500).json({
            message: 'Error al desactivar proveedor'
          });
        case 19:
        case "end":
          return _context5.stop();
      }
    }, _callee5, null, [[4, 15]]);
  }));
  return function deleteProveedor(_x9, _x10) {
    return _ref5.apply(this, arguments);
  };
}();