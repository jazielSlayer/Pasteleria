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
          return pool.query("\n            SELECT \n                proveedor_id,\n                nombre,\n                nit,\n                telefono,\n                direccion,\n                contacto,\n                plazo_pago_dias,\n                activo,\n                created_at,\n                updated_at\n            FROM Proveedores\n            WHERE activo = 1\n            ORDER BY nombre ASC\n        ");
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
        case "end":
          return _context.stop();
      }
    }, _callee, null, [[3, 12]]);
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
    var pool, _req$body, nombre, nit, telefono, direccion, contacto, _req$body$plazo_pago_, plazo_pago_dias, _req$body$activo, activo, _yield$pool$query5, _yield$pool$query6, result;
    return _regenerator["default"].wrap(function _callee3$(_context3) {
      while (1) switch (_context3.prev = _context3.next) {
        case 0:
          _context3.next = 2;
          return (0, _database.connect)();
        case 2:
          pool = _context3.sent;
          _req$body = req.body, nombre = _req$body.nombre, nit = _req$body.nit, telefono = _req$body.telefono, direccion = _req$body.direccion, contacto = _req$body.contacto, _req$body$plazo_pago_ = _req$body.plazo_pago_dias, plazo_pago_dias = _req$body$plazo_pago_ === void 0 ? 30 : _req$body$plazo_pago_, _req$body$activo = _req$body.activo, activo = _req$body$activo === void 0 ? 1 : _req$body$activo;
          _context3.prev = 4;
          if (!(!nombre || nombre.trim().length < 3)) {
            _context3.next = 7;
            break;
          }
          return _context3.abrupt("return", res.status(400).json({
            message: 'El nombre del proveedor es obligatorio y debe tener al menos 3 caracteres'
          }));
        case 7:
          if (!(nit && !/^\d{4,20}$/.test(nit.replace(/[^0-9]/g, '')))) {
            _context3.next = 9;
            break;
          }
          return _context3.abrupt("return", res.status(400).json({
            message: 'NIT inválido (solo números, mínimo 4 dígitos)'
          }));
        case 9:
          if (!(telefono && !/^[\d\s\-\+\(\)]{8,15}$/.test(telefono))) {
            _context3.next = 11;
            break;
          }
          return _context3.abrupt("return", res.status(400).json({
            message: 'Teléfono inválido'
          }));
        case 11:
          if (!(plazo_pago_dias && (isNaN(plazo_pago_dias) || plazo_pago_dias < 0 || plazo_pago_dias > 365))) {
            _context3.next = 13;
            break;
          }
          return _context3.abrupt("return", res.status(400).json({
            message: 'Plazo de pago debe estar entre 0 y 365 días'
          }));
        case 13:
          _context3.next = 15;
          return pool.query("\n            INSERT INTO Proveedores \n                (nombre, nit, telefono, direccion, contacto, plazo_pago_dias, activo)\n            VALUES (?, ?, ?, ?, ?, ?, ?)\n        ", [nombre.trim(), (nit === null || nit === void 0 ? void 0 : nit.trim()) || null, (telefono === null || telefono === void 0 ? void 0 : telefono.trim()) || null, (direccion === null || direccion === void 0 ? void 0 : direccion.trim()) || null, (contacto === null || contacto === void 0 ? void 0 : contacto.trim()) || null, parseInt(plazo_pago_dias), activo ? 1 : 0]);
        case 15:
          _yield$pool$query5 = _context3.sent;
          _yield$pool$query6 = (0, _slicedToArray2["default"])(_yield$pool$query5, 1);
          result = _yield$pool$query6[0];
          res.status(201).json({
            message: 'Proveedor creado exitosamente',
            proveedor_id: result.insertId,
            nombre: nombre.trim()
          });
          _context3.next = 27;
          break;
        case 21:
          _context3.prev = 21;
          _context3.t0 = _context3["catch"](4);
          console.error('Error creating proveedor:', _context3.t0);
          if (!(_context3.t0.code === 'ER_DUP_ENTRY')) {
            _context3.next = 26;
            break;
          }
          return _context3.abrupt("return", res.status(400).json({
            message: 'Ya existe un proveedor con ese NIT o datos duplicados'
          }));
        case 26:
          res.status(500).json({
            message: 'Error al crear proveedor'
          });
        case 27:
        case "end":
          return _context3.stop();
      }
    }, _callee3, null, [[4, 21]]);
  }));
  return function createProveedor(_x5, _x6) {
    return _ref3.apply(this, arguments);
  };
}();

/* ==================== ACTUALIZAR PROVEEDOR ==================== */
var updateProveedor = exports.updateProveedor = /*#__PURE__*/function () {
  var _ref4 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee4(req, res) {
    var pool, id, _req$body2, nombre, nit, telefono, direccion, contacto, plazo_pago_dias, activo, _yield$pool$query7, _yield$pool$query8, exists, fields, values;
    return _regenerator["default"].wrap(function _callee4$(_context4) {
      while (1) switch (_context4.prev = _context4.next) {
        case 0:
          _context4.next = 2;
          return (0, _database.connect)();
        case 2:
          pool = _context4.sent;
          id = parseInt(req.params.id);
          _req$body2 = req.body, nombre = _req$body2.nombre, nit = _req$body2.nit, telefono = _req$body2.telefono, direccion = _req$body2.direccion, contacto = _req$body2.contacto, plazo_pago_dias = _req$body2.plazo_pago_dias, activo = _req$body2.activo;
          _context4.prev = 5;
          if (!(isNaN(id) || id <= 0)) {
            _context4.next = 8;
            break;
          }
          return _context4.abrupt("return", res.status(400).json({
            message: 'ID de proveedor inválido'
          }));
        case 8:
          _context4.next = 10;
          return pool.query('SELECT proveedor_id FROM Proveedores WHERE proveedor_id = ?', [id]);
        case 10:
          _yield$pool$query7 = _context4.sent;
          _yield$pool$query8 = (0, _slicedToArray2["default"])(_yield$pool$query7, 1);
          exists = _yield$pool$query8[0];
          if (!(exists.length === 0)) {
            _context4.next = 15;
            break;
          }
          return _context4.abrupt("return", res.status(404).json({
            message: 'Proveedor no encontrado'
          }));
        case 15:
          if (!(nombre !== undefined && nombre.trim().length < 3)) {
            _context4.next = 17;
            break;
          }
          return _context4.abrupt("return", res.status(400).json({
            message: 'El nombre debe tener al menos 3 caracteres'
          }));
        case 17:
          if (!(nit !== undefined && nit && !/^\d{4,20}$/.test(nit.replace(/[^0-9]/g, '')))) {
            _context4.next = 19;
            break;
          }
          return _context4.abrupt("return", res.status(400).json({
            message: 'NIT inválido'
          }));
        case 19:
          if (!(telefono !== undefined && telefono && !/^[\d\s\-\+\(\)]{8,15}$/.test(telefono))) {
            _context4.next = 21;
            break;
          }
          return _context4.abrupt("return", res.status(400).json({
            message: 'Teléfono inválido'
          }));
        case 21:
          fields = [];
          values = [];
          if (nombre !== undefined) {
            fields.push('nombre = ?');
            values.push(nombre.trim());
          }
          if (nit !== undefined) {
            fields.push('nit = ?');
            values.push((nit === null || nit === void 0 ? void 0 : nit.trim()) || null);
          }
          if (telefono !== undefined) {
            fields.push('telefono = ?');
            values.push((telefono === null || telefono === void 0 ? void 0 : telefono.trim()) || null);
          }
          if (direccion !== undefined) {
            fields.push('direccion = ?');
            values.push((direccion === null || direccion === void 0 ? void 0 : direccion.trim()) || null);
          }
          if (contacto !== undefined) {
            fields.push('contacto = ?');
            values.push((contacto === null || contacto === void 0 ? void 0 : contacto.trim()) || null);
          }
          if (plazo_pago_dias !== undefined) {
            fields.push('plazo_pago_dias = ?');
            values.push(parseInt(plazo_pago_dias));
          }
          if (activo !== undefined) {
            fields.push('activo = ?');
            values.push(activo ? 1 : 0);
          }
          if (!(fields.length === 0)) {
            _context4.next = 32;
            break;
          }
          return _context4.abrupt("return", res.status(400).json({
            message: 'No se enviaron datos para actualizar'
          }));
        case 32:
          _context4.next = 34;
          return pool.query("UPDATE Proveedores SET ".concat(fields.join(', '), " WHERE proveedor_id = ?"), [].concat(values, [id]));
        case 34:
          res.json({
            message: 'Proveedor actualizado correctamente'
          });
          _context4.next = 43;
          break;
        case 37:
          _context4.prev = 37;
          _context4.t0 = _context4["catch"](5);
          console.error('Error updating proveedor:', _context4.t0);
          if (!(_context4.t0.code === 'ER_DUP_ENTRY')) {
            _context4.next = 42;
            break;
          }
          return _context4.abrupt("return", res.status(400).json({
            message: 'Ya existe otro proveedor con ese NIT'
          }));
        case 42:
          res.status(500).json({
            message: 'Error al actualizar proveedor'
          });
        case 43:
        case "end":
          return _context4.stop();
      }
    }, _callee4, null, [[5, 37]]);
  }));
  return function updateProveedor(_x7, _x8) {
    return _ref4.apply(this, arguments);
  };
}();

/* ==================== ELIMINAR (O DESACTIVAR) PROVEEDOR ==================== */
// Recomiendo desactivar en lugar de borrar físicamente (por integridad referencial)
var deleteProveedor = exports.deleteProveedor = /*#__PURE__*/function () {
  var _ref5 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee5(req, res) {
    var pool, id, _yield$pool$query9, _yield$pool$query10, result;
    return _regenerator["default"].wrap(function _callee5$(_context5) {
      while (1) switch (_context5.prev = _context5.next) {
        case 0:
          _context5.next = 2;
          return (0, _database.connect)();
        case 2:
          pool = _context5.sent;
          id = parseInt(req.params.id);
          _context5.prev = 4;
          if (!(isNaN(id) || id <= 0)) {
            _context5.next = 7;
            break;
          }
          return _context5.abrupt("return", res.status(400).json({
            message: 'ID inválido'
          }));
        case 7:
          _context5.next = 9;
          return pool.query('UPDATE Proveedores SET activo = 0 WHERE proveedor_id = ?', [id]);
        case 9:
          _yield$pool$query9 = _context5.sent;
          _yield$pool$query10 = (0, _slicedToArray2["default"])(_yield$pool$query9, 1);
          result = _yield$pool$query10[0];
          if (!(result.affectedRows === 0)) {
            _context5.next = 14;
            break;
          }
          return _context5.abrupt("return", res.status(404).json({
            message: 'Proveedor no encontrado'
          }));
        case 14:
          res.json({
            message: 'Proveedor desactivado correctamente'
          });

          // Si realmente quieres borrado físico (cuidado con FK):
          // const [result] = await pool.query('DELETE FROM Proveedores WHERE proveedor_id = ?', [id]);
          // if (result.affectedRows === 0) return res.status(404).json({ message: 'Proveedor no encontrado' });
          _context5.next = 23;
          break;
        case 17:
          _context5.prev = 17;
          _context5.t0 = _context5["catch"](4);
          console.error('Error deleting proveedor:', _context5.t0);
          if (!(_context5.t0.code === 'ER_ROW_IS_REFERENCED_2')) {
            _context5.next = 22;
            break;
          }
          return _context5.abrupt("return", res.status(400).json({
            message: 'No se puede eliminar: el proveedor tiene compras asociadas. Desactívalo en su lugar.'
          }));
        case 22:
          res.status(500).json({
            message: 'Error al eliminar proveedor'
          });
        case 23:
        case "end":
          return _context5.stop();
      }
    }, _callee5, null, [[4, 17]]);
  }));
  return function deleteProveedor(_x9, _x10) {
    return _ref5.apply(this, arguments);
  };
}();