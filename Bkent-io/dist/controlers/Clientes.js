"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.updateCliente = exports.getClientes = exports.getCliente = exports.deleteCliente = exports.createCliente = exports.buscarCliente = void 0;
var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));
var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));
var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));
var _database = require("../database");
/* ==================== LISTAR TODOS LOS CLIENTES ==================== */
var getClientes = exports.getClientes = /*#__PURE__*/function () {
  var _ref = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee(req, res) {
    var pool, _req$query, search, _req$query$activo, activo, query, values, likeTerm, _yield$pool$query, _yield$pool$query2, rows;
    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) switch (_context.prev = _context.next) {
        case 0:
          _context.next = 2;
          return (0, _database.connect)();
        case 2:
          pool = _context.sent;
          _req$query = req.query, search = _req$query.search, _req$query$activo = _req$query.activo, activo = _req$query$activo === void 0 ? 1 : _req$query$activo;
          _context.prev = 4;
          query = "\n            SELECT \n                cliente_id,\n                ci,\n                nombres,\n                apellidos,\n                telefono,\n                email,\n                direccion,\n                fecha_nacimiento,\n                es_frecuente,\n                puntos_acumulados,\n                fecha_registro,\n                activo\n            FROM Clientes\n            WHERE activo = ?\n        ";
          values = [activo === '0' ? 0 : 1];
          if (search) {
            query += " AND (\n                nombres LIKE ? OR \n                apellidos LIKE ? OR \n                ci LIKE ? OR \n                telefono LIKE ? OR\n                CONCAT(nombres, ' ', apellidos) LIKE ?\n            )";
            likeTerm = "%".concat(search.trim(), "%");
            values.push(likeTerm, likeTerm, likeTerm, likeTerm, likeTerm);
          }
          query += " ORDER BY apellidos, nombres";
          _context.next = 11;
          return pool.query(query, values);
        case 11:
          _yield$pool$query = _context.sent;
          _yield$pool$query2 = (0, _slicedToArray2["default"])(_yield$pool$query, 1);
          rows = _yield$pool$query2[0];
          res.json(rows);
          _context.next = 21;
          break;
        case 17:
          _context.prev = 17;
          _context.t0 = _context["catch"](4);
          console.error('Error fetching clientes:', _context.t0);
          res.status(500).json({
            message: 'Error al obtener clientes'
          });
        case 21:
        case "end":
          return _context.stop();
      }
    }, _callee, null, [[4, 17]]);
  }));
  return function getClientes(_x, _x2) {
    return _ref.apply(this, arguments);
  };
}();

/* ==================== OBTENER UN CLIENTE POR ID ==================== */
var getCliente = exports.getCliente = /*#__PURE__*/function () {
  var _ref2 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee2(req, res) {
    var pool, id, _yield$pool$query3, _yield$pool$query4, rows;
    return _regenerator["default"].wrap(function _callee2$(_context2) {
      while (1) switch (_context2.prev = _context2.next) {
        case 0:
          _context2.next = 2;
          return (0, _database.connect)();
        case 2:
          pool = _context2.sent;
          id = parseInt(req.params.id);
          if (!(isNaN(id) || id <= 0)) {
            _context2.next = 6;
            break;
          }
          return _context2.abrupt("return", res.status(400).json({
            message: 'ID inválido'
          }));
        case 6:
          _context2.prev = 6;
          _context2.next = 9;
          return pool.query("\n            SELECT \n                cliente_id,\n                ci,\n                nombres,\n                apellidos,\n                telefono,\n                email,\n                direccion,\n                fecha_nacimiento,\n                es_frecuente,\n                puntos_acumulados,\n                fecha_registro,\n                activo\n            FROM Clientes\n            WHERE cliente_id = ?\n        ", [id]);
        case 9:
          _yield$pool$query3 = _context2.sent;
          _yield$pool$query4 = (0, _slicedToArray2["default"])(_yield$pool$query3, 1);
          rows = _yield$pool$query4[0];
          if (!(rows.length === 0)) {
            _context2.next = 14;
            break;
          }
          return _context2.abrupt("return", res.status(404).json({
            message: 'Cliente no encontrado'
          }));
        case 14:
          res.json(rows[0]);
          _context2.next = 21;
          break;
        case 17:
          _context2.prev = 17;
          _context2.t0 = _context2["catch"](6);
          console.error('Error fetching cliente:', _context2.t0);
          res.status(500).json({
            message: 'Error al obtener cliente'
          });
        case 21:
        case "end":
          return _context2.stop();
      }
    }, _callee2, null, [[6, 17]]);
  }));
  return function getCliente(_x3, _x4) {
    return _ref2.apply(this, arguments);
  };
}();

/* ==================== BUSCAR CLIENTE POR CI O TELÉFONO (ideal para caja) ==================== */
var buscarCliente = exports.buscarCliente = /*#__PURE__*/function () {
  var _ref3 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee3(req, res) {
    var pool, _req$query2, ci, telefono, query, values, _yield$pool$query5, _yield$pool$query6, rows;
    return _regenerator["default"].wrap(function _callee3$(_context3) {
      while (1) switch (_context3.prev = _context3.next) {
        case 0:
          _context3.next = 2;
          return (0, _database.connect)();
        case 2:
          pool = _context3.sent;
          _req$query2 = req.query, ci = _req$query2.ci, telefono = _req$query2.telefono;
          if (!(!ci && !telefono)) {
            _context3.next = 6;
            break;
          }
          return _context3.abrupt("return", res.status(400).json({
            message: 'Debe proporcionar ci o telefono'
          }));
        case 6:
          _context3.prev = 6;
          query = "SELECT cliente_id, ci, nombres, apellidos, telefono, es_frecuente, puntos_acumulados FROM Clientes WHERE activo = 1";
          values = [];
          if (ci) {
            query += ' AND ci = ?';
            values.push(ci.trim());
          }
          if (telefono) {
            query += ' AND telefono = ?';
            values.push(telefono.trim());
          }
          _context3.next = 13;
          return pool.query(query, values);
        case 13:
          _yield$pool$query5 = _context3.sent;
          _yield$pool$query6 = (0, _slicedToArray2["default"])(_yield$pool$query5, 1);
          rows = _yield$pool$query6[0];
          if (!(rows.length === 0)) {
            _context3.next = 18;
            break;
          }
          return _context3.abrupt("return", res.status(404).json({
            message: 'Cliente no encontrado',
            sugerir_crear: true
          }));
        case 18:
          res.json(rows[0]);
          _context3.next = 25;
          break;
        case 21:
          _context3.prev = 21;
          _context3.t0 = _context3["catch"](6);
          console.error('Error buscando cliente:', _context3.t0);
          res.status(500).json({
            message: 'Error al buscar cliente'
          });
        case 25:
        case "end":
          return _context3.stop();
      }
    }, _callee3, null, [[6, 21]]);
  }));
  return function buscarCliente(_x5, _x6) {
    return _ref3.apply(this, arguments);
  };
}();

/* ==================== CREAR NUEVO CLIENTE ==================== */
var createCliente = exports.createCliente = /*#__PURE__*/function () {
  var _ref4 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee4(req, res) {
    var pool, _req$body, ci, nombres, apellidos, telefono, email, direccion, fecha_nacimiento, _req$body$es_frecuent, es_frecuente, _yield$pool$query7, _yield$pool$query8, ciExists, _yield$pool$query9, _yield$pool$query10, result;
    return _regenerator["default"].wrap(function _callee4$(_context4) {
      while (1) switch (_context4.prev = _context4.next) {
        case 0:
          _context4.next = 2;
          return (0, _database.connect)();
        case 2:
          pool = _context4.sent;
          _req$body = req.body, ci = _req$body.ci, nombres = _req$body.nombres, apellidos = _req$body.apellidos, telefono = _req$body.telefono, email = _req$body.email, direccion = _req$body.direccion, fecha_nacimiento = _req$body.fecha_nacimiento, _req$body$es_frecuent = _req$body.es_frecuente, es_frecuente = _req$body$es_frecuent === void 0 ? 0 : _req$body$es_frecuent;
          _context4.prev = 4;
          if (!(!nombres || !apellidos)) {
            _context4.next = 7;
            break;
          }
          return _context4.abrupt("return", res.status(400).json({
            message: 'Nombres y apellidos son obligatorios'
          }));
        case 7:
          if (!(nombres.trim().length < 2 || apellidos.trim().length < 2)) {
            _context4.next = 9;
            break;
          }
          return _context4.abrupt("return", res.status(400).json({
            message: 'Nombres y apellidos deben tener al menos 2 caracteres'
          }));
        case 9:
          if (!ci) {
            _context4.next = 19;
            break;
          }
          if (/^\d{5,15}$/.test(ci.replace(/\D/g, ''))) {
            _context4.next = 12;
            break;
          }
          return _context4.abrupt("return", res.status(400).json({
            message: 'CI inválido (solo números, 5-15 dígitos)'
          }));
        case 12:
          _context4.next = 14;
          return pool.query('SELECT cliente_id FROM Clientes WHERE ci = ?', [ci.trim()]);
        case 14:
          _yield$pool$query7 = _context4.sent;
          _yield$pool$query8 = (0, _slicedToArray2["default"])(_yield$pool$query7, 1);
          ciExists = _yield$pool$query8[0];
          if (!(ciExists.length > 0)) {
            _context4.next = 19;
            break;
          }
          return _context4.abrupt("return", res.status(409).json({
            message: 'Ya existe un cliente con este CI'
          }));
        case 19:
          if (!(telefono && !/^[\d\s\-\+\(\)]{7,15}$/.test(telefono))) {
            _context4.next = 21;
            break;
          }
          return _context4.abrupt("return", res.status(400).json({
            message: 'Teléfono inválido'
          }));
        case 21:
          if (!(email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) {
            _context4.next = 23;
            break;
          }
          return _context4.abrupt("return", res.status(400).json({
            message: 'Email inválido'
          }));
        case 23:
          if (!(fecha_nacimiento && !/^\d{4}-\d{2}-\d{2}$/.test(fecha_nacimiento))) {
            _context4.next = 25;
            break;
          }
          return _context4.abrupt("return", res.status(400).json({
            message: 'Formato de fecha inválido (YYYY-MM-DD)'
          }));
        case 25:
          _context4.next = 27;
          return pool.query("\n            INSERT INTO Clientes \n                (ci, nombres, apellidos, telefono, email, direccion, fecha_nacimiento, es_frecuente, puntos_acumulados)\n            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)\n        ", [(ci === null || ci === void 0 ? void 0 : ci.trim()) || null, nombres.trim(), apellidos.trim(), (telefono === null || telefono === void 0 ? void 0 : telefono.trim()) || null, (email === null || email === void 0 ? void 0 : email.trim()) || null, (direccion === null || direccion === void 0 ? void 0 : direccion.trim()) || null, fecha_nacimiento || null, es_frecuente ? 1 : 0]);
        case 27:
          _yield$pool$query9 = _context4.sent;
          _yield$pool$query10 = (0, _slicedToArray2["default"])(_yield$pool$query9, 1);
          result = _yield$pool$query10[0];
          res.status(201).json({
            message: 'Cliente creado exitosamente',
            cliente_id: result.insertId,
            nombres: nombres.trim(),
            apellidos: apellidos.trim(),
            es_frecuente: es_frecuente ? true : false
          });
          _context4.next = 39;
          break;
        case 33:
          _context4.prev = 33;
          _context4.t0 = _context4["catch"](4);
          console.error('Error creating cliente:', _context4.t0);
          if (!(_context4.t0.code === 'ER_DUP_ENTRY' && _context4.t0.message.includes('ci'))) {
            _context4.next = 38;
            break;
          }
          return _context4.abrupt("return", res.status(409).json({
            message: 'Ya existe un cliente con este CI'
          }));
        case 38:
          res.status(500).json({
            message: 'Error al crear cliente'
          });
        case 39:
        case "end":
          return _context4.stop();
      }
    }, _callee4, null, [[4, 33]]);
  }));
  return function createCliente(_x7, _x8) {
    return _ref4.apply(this, arguments);
  };
}();

/* ==================== ACTUALIZAR CLIENTE ==================== */
var updateCliente = exports.updateCliente = /*#__PURE__*/function () {
  var _ref5 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee5(req, res) {
    var pool, id, _req$body2, ci, nombres, apellidos, telefono, email, direccion, fecha_nacimiento, es_frecuente, activo, _yield$pool$query11, _yield$pool$query12, exists, fields, values, _yield$pool$query13, _yield$pool$query14, ciCheck;
    return _regenerator["default"].wrap(function _callee5$(_context5) {
      while (1) switch (_context5.prev = _context5.next) {
        case 0:
          _context5.next = 2;
          return (0, _database.connect)();
        case 2:
          pool = _context5.sent;
          id = parseInt(req.params.id);
          _req$body2 = req.body, ci = _req$body2.ci, nombres = _req$body2.nombres, apellidos = _req$body2.apellidos, telefono = _req$body2.telefono, email = _req$body2.email, direccion = _req$body2.direccion, fecha_nacimiento = _req$body2.fecha_nacimiento, es_frecuente = _req$body2.es_frecuente, activo = _req$body2.activo;
          if (!(isNaN(id) || id <= 0)) {
            _context5.next = 7;
            break;
          }
          return _context5.abrupt("return", res.status(400).json({
            message: 'ID inválido'
          }));
        case 7:
          _context5.prev = 7;
          _context5.next = 10;
          return pool.query('SELECT cliente_id FROM Clientes WHERE cliente_id = ?', [id]);
        case 10:
          _yield$pool$query11 = _context5.sent;
          _yield$pool$query12 = (0, _slicedToArray2["default"])(_yield$pool$query11, 1);
          exists = _yield$pool$query12[0];
          if (!(exists.length === 0)) {
            _context5.next = 15;
            break;
          }
          return _context5.abrupt("return", res.status(404).json({
            message: 'Cliente no encontrado'
          }));
        case 15:
          fields = [];
          values = [];
          if (nombres !== undefined) {
            fields.push('nombres = ?');
            values.push(nombres.trim());
          }
          if (apellidos !== undefined) {
            fields.push('apellidos = ?');
            values.push(apellidos.trim());
          }
          if (!(ci !== undefined)) {
            _context5.next = 31;
            break;
          }
          if (!(ci && !/^\d{5,15}$/.test(ci.replace(/\D/g, '')))) {
            _context5.next = 22;
            break;
          }
          return _context5.abrupt("return", res.status(400).json({
            message: 'CI inválido'
          }));
        case 22:
          _context5.next = 24;
          return pool.query('SELECT cliente_id FROM Clientes WHERE ci = ? AND cliente_id != ?', [ci, id]);
        case 24:
          _yield$pool$query13 = _context5.sent;
          _yield$pool$query14 = (0, _slicedToArray2["default"])(_yield$pool$query13, 1);
          ciCheck = _yield$pool$query14[0];
          if (!(ciCheck.length > 0)) {
            _context5.next = 29;
            break;
          }
          return _context5.abrupt("return", res.status(409).json({
            message: 'Ya existe otro cliente con este CI'
          }));
        case 29:
          fields.push('ci = ?');
          values.push((ci === null || ci === void 0 ? void 0 : ci.trim()) || null);
        case 31:
          if (telefono !== undefined) {
            fields.push('telefono = ?');
            values.push((telefono === null || telefono === void 0 ? void 0 : telefono.trim()) || null);
          }
          if (email !== undefined) {
            fields.push('email = ?');
            values.push((email === null || email === void 0 ? void 0 : email.trim()) || null);
          }
          if (direccion !== undefined) {
            fields.push('direccion = ?');
            values.push((direccion === null || direccion === void 0 ? void 0 : direccion.trim()) || null);
          }
          if (fecha_nacimiento !== undefined) {
            fields.push('fecha_nacimiento = ?');
            values.push(fecha_nacimiento || null);
          }
          if (es_frecuente !== undefined) {
            fields.push('es_frecuente = ?');
            values.push(es_frecuente ? 1 : 0);
          }
          if (activo !== undefined) {
            fields.push('activo = ?');
            values.push(activo ? 1 : 0);
          }
          if (!(fields.length === 0)) {
            _context5.next = 39;
            break;
          }
          return _context5.abrupt("return", res.status(400).json({
            message: 'No se enviaron datos para actualizar'
          }));
        case 39:
          values.push(id);
          _context5.next = 42;
          return pool.query("UPDATE Clientes SET ".concat(fields.join(', '), " WHERE cliente_id = ?"), values);
        case 42:
          res.json({
            message: 'Cliente actualizado correctamente'
          });
          _context5.next = 49;
          break;
        case 45:
          _context5.prev = 45;
          _context5.t0 = _context5["catch"](7);
          console.error('Error updating cliente:', _context5.t0);
          res.status(500).json({
            message: 'Error al actualizar cliente'
          });
        case 49:
        case "end":
          return _context5.stop();
      }
    }, _callee5, null, [[7, 45]]);
  }));
  return function updateCliente(_x9, _x10) {
    return _ref5.apply(this, arguments);
  };
}();

/* ==================== ELIMINAR / DESACTIVAR CLIENTE ==================== */
var deleteCliente = exports.deleteCliente = /*#__PURE__*/function () {
  var _ref6 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee6(req, res) {
    var pool, id, _yield$pool$query15, _yield$pool$query16, ventas, _yield$pool$query17, _yield$pool$query18, result;
    return _regenerator["default"].wrap(function _callee6$(_context6) {
      while (1) switch (_context6.prev = _context6.next) {
        case 0:
          _context6.next = 2;
          return (0, _database.connect)();
        case 2:
          pool = _context6.sent;
          id = parseInt(req.params.id);
          if (!(isNaN(id) || id <= 0)) {
            _context6.next = 6;
            break;
          }
          return _context6.abrupt("return", res.status(400).json({
            message: 'ID inválido'
          }));
        case 6:
          _context6.prev = 6;
          _context6.next = 9;
          return pool.query('SELECT COUNT(*) AS total FROM Ventas WHERE cliente_id = ?', [id]);
        case 9:
          _yield$pool$query15 = _context6.sent;
          _yield$pool$query16 = (0, _slicedToArray2["default"])(_yield$pool$query15, 1);
          ventas = _yield$pool$query16[0];
          if (!(ventas[0].total > 0)) {
            _context6.next = 16;
            break;
          }
          _context6.next = 15;
          return pool.query('UPDATE Clientes SET activo = 0 WHERE cliente_id = ?', [id]);
        case 15:
          return _context6.abrupt("return", res.json({
            message: 'Cliente desactivado (tiene ventas asociadas)'
          }));
        case 16:
          _context6.next = 18;
          return pool.query('DELETE FROM Clientes WHERE cliente_id = ?', [id]);
        case 18:
          _yield$pool$query17 = _context6.sent;
          _yield$pool$query18 = (0, _slicedToArray2["default"])(_yield$pool$query17, 1);
          result = _yield$pool$query18[0];
          if (!(result.affectedRows === 0)) {
            _context6.next = 23;
            break;
          }
          return _context6.abrupt("return", res.status(404).json({
            message: 'Cliente no encontrado'
          }));
        case 23:
          res.json({
            message: 'Cliente eliminado permanentemente'
          });
          _context6.next = 30;
          break;
        case 26:
          _context6.prev = 26;
          _context6.t0 = _context6["catch"](6);
          console.error('Error deleting cliente:', _context6.t0);
          res.status(500).json({
            message: 'Error al procesar cliente'
          });
        case 30:
        case "end":
          return _context6.stop();
      }
    }, _callee6, null, [[6, 26]]);
  }));
  return function deleteCliente(_x11, _x12) {
    return _ref6.apply(this, arguments);
  };
}();