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
// src/controlers/Clientes.js  → Versión 100% funcional con tu BD real

var getClientes = exports.getClientes = /*#__PURE__*/function () {
  var _ref = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee(req, res) {
    var pool, _req$query, search, tipo, query, values, term, _yield$pool$query, _yield$pool$query2, rows;
    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) switch (_context.prev = _context.next) {
        case 0:
          _context.next = 2;
          return (0, _database.connect)();
        case 2:
          pool = _context.sent;
          _req$query = req.query, search = _req$query.search, tipo = _req$query.tipo;
          _context.prev = 4;
          query = "SELECT cliente_id, nombre, nit_ci, telefono, tipo, descuento_porcentaje FROM clientes WHERE 1=1";
          values = [];
          if (search) {
            query += " AND (nombre LIKE ? OR nit_ci LIKE ? OR telefono LIKE ?)";
            term = "%".concat(search.trim(), "%");
            values.push(term, term, term);
          }
          if (tipo && ['MOSTRADOR', 'MAYORISTA', 'EVENTO'].includes(tipo)) {
            query += " AND tipo = ?";
            values.push(tipo);
          }
          query += " ORDER BY nombre";
          _context.next = 12;
          return pool.query(query, values);
        case 12:
          _yield$pool$query = _context.sent;
          _yield$pool$query2 = (0, _slicedToArray2["default"])(_yield$pool$query, 1);
          rows = _yield$pool$query2[0];
          res.json(rows);
          _context.next = 22;
          break;
        case 18:
          _context.prev = 18;
          _context.t0 = _context["catch"](4);
          console.error('Error fetching clientes:', _context.t0);
          res.status(500).json({
            message: 'Error al obtener clientes'
          });
        case 22:
        case "end":
          return _context.stop();
      }
    }, _callee, null, [[4, 18]]);
  }));
  return function getClientes(_x, _x2) {
    return _ref.apply(this, arguments);
  };
}();
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
          if (!isNaN(id)) {
            _context2.next = 6;
            break;
          }
          return _context2.abrupt("return", res.status(400).json({
            message: 'ID inválido'
          }));
        case 6:
          _context2.prev = 6;
          _context2.next = 9;
          return pool.query("SELECT * FROM clientes WHERE cliente_id = ?", [id]);
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
          _context2.next = 20;
          break;
        case 17:
          _context2.prev = 17;
          _context2.t0 = _context2["catch"](6);
          res.status(500).json({
            message: 'Error al obtener cliente'
          });
        case 20:
        case "end":
          return _context2.stop();
      }
    }, _callee2, null, [[6, 17]]);
  }));
  return function getCliente(_x3, _x4) {
    return _ref2.apply(this, arguments);
  };
}();
var buscarCliente = exports.buscarCliente = /*#__PURE__*/function () {
  var _ref3 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee3(req, res) {
    var pool, _req$query2, nit_ci, telefono, query, values, _yield$pool$query5, _yield$pool$query6, rows;
    return _regenerator["default"].wrap(function _callee3$(_context3) {
      while (1) switch (_context3.prev = _context3.next) {
        case 0:
          _context3.next = 2;
          return (0, _database.connect)();
        case 2:
          pool = _context3.sent;
          _req$query2 = req.query, nit_ci = _req$query2.nit_ci, telefono = _req$query2.telefono;
          if (!(!nit_ci && !telefono)) {
            _context3.next = 6;
            break;
          }
          return _context3.abrupt("return", res.status(400).json({
            message: 'Debe enviar nit_ci o telefono'
          }));
        case 6:
          _context3.prev = 6;
          query = "SELECT cliente_id, nombre, nit_ci, telefono, tipo, descuento_porcentaje FROM clientes WHERE 1=1";
          values = [];
          if (nit_ci) {
            query += " AND nit_ci = ?";
            values.push(nit_ci.trim());
          }
          if (telefono) {
            query += " AND telefono = ?";
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
          _context3.next = 24;
          break;
        case 21:
          _context3.prev = 21;
          _context3.t0 = _context3["catch"](6);
          res.status(500).json({
            message: 'Error buscando cliente'
          });
        case 24:
        case "end":
          return _context3.stop();
      }
    }, _callee3, null, [[6, 21]]);
  }));
  return function buscarCliente(_x5, _x6) {
    return _ref3.apply(this, arguments);
  };
}();
var createCliente = exports.createCliente = /*#__PURE__*/function () {
  var _ref4 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee4(req, res) {
    var pool, _req$body, nombre, nit_ci, telefono, _req$body$tipo, tipo, _req$body$descuento_p, descuento_porcentaje, _yield$pool$query7, _yield$pool$query8, result;
    return _regenerator["default"].wrap(function _callee4$(_context4) {
      while (1) switch (_context4.prev = _context4.next) {
        case 0:
          _context4.next = 2;
          return (0, _database.connect)();
        case 2:
          pool = _context4.sent;
          _req$body = req.body, nombre = _req$body.nombre, nit_ci = _req$body.nit_ci, telefono = _req$body.telefono, _req$body$tipo = _req$body.tipo, tipo = _req$body$tipo === void 0 ? 'MOSTRADOR' : _req$body$tipo, _req$body$descuento_p = _req$body.descuento_porcentaje, descuento_porcentaje = _req$body$descuento_p === void 0 ? 0 : _req$body$descuento_p;
          if (!(!nombre || nombre.trim().length < 3)) {
            _context4.next = 6;
            break;
          }
          return _context4.abrupt("return", res.status(400).json({
            message: 'Nombre es obligatorio y debe tener al menos 3 caracteres'
          }));
        case 6:
          _context4.prev = 6;
          _context4.next = 9;
          return pool.query("INSERT INTO clientes (nombre, nit_ci, telefono, tipo, descuento_porcentaje) VALUES (?, ?, ?, ?, ?)", [nombre.trim(), (nit_ci === null || nit_ci === void 0 ? void 0 : nit_ci.trim()) || null, (telefono === null || telefono === void 0 ? void 0 : telefono.trim()) || null, tipo, descuento_porcentaje]);
        case 9:
          _yield$pool$query7 = _context4.sent;
          _yield$pool$query8 = (0, _slicedToArray2["default"])(_yield$pool$query7, 1);
          result = _yield$pool$query8[0];
          res.status(201).json({
            message: 'Cliente creado',
            cliente_id: result.insertId,
            nombre: nombre.trim(),
            tipo: tipo,
            descuento_porcentaje: descuento_porcentaje
          });
          _context4.next = 19;
          break;
        case 15:
          _context4.prev = 15;
          _context4.t0 = _context4["catch"](6);
          console.error(_context4.t0);
          res.status(500).json({
            message: 'Error al crear cliente'
          });
        case 19:
        case "end":
          return _context4.stop();
      }
    }, _callee4, null, [[6, 15]]);
  }));
  return function createCliente(_x7, _x8) {
    return _ref4.apply(this, arguments);
  };
}();
var updateCliente = exports.updateCliente = /*#__PURE__*/function () {
  var _ref5 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee5(req, res) {
    var pool, id, _req$body2, nombre, nit_ci, telefono, tipo, descuento_porcentaje, fields, values;
    return _regenerator["default"].wrap(function _callee5$(_context5) {
      while (1) switch (_context5.prev = _context5.next) {
        case 0:
          _context5.next = 2;
          return (0, _database.connect)();
        case 2:
          pool = _context5.sent;
          id = parseInt(req.params.id);
          _req$body2 = req.body, nombre = _req$body2.nombre, nit_ci = _req$body2.nit_ci, telefono = _req$body2.telefono, tipo = _req$body2.tipo, descuento_porcentaje = _req$body2.descuento_porcentaje;
          if (!isNaN(id)) {
            _context5.next = 7;
            break;
          }
          return _context5.abrupt("return", res.status(400).json({
            message: 'ID inválido'
          }));
        case 7:
          _context5.prev = 7;
          fields = [];
          values = [];
          if (nombre !== undefined) {
            fields.push('nombre = ?');
            values.push(nombre.trim());
          }
          if (nit_ci !== undefined) {
            fields.push('nit_ci = ?');
            values.push((nit_ci === null || nit_ci === void 0 ? void 0 : nit_ci.trim()) || null);
          }
          if (telefono !== undefined) {
            fields.push('telefono = ?');
            values.push((telefono === null || telefono === void 0 ? void 0 : telefono.trim()) || null);
          }
          if (tipo !== undefined) {
            fields.push('tipo = ?');
            values.push(tipo);
          }
          if (descuento_porcentaje !== undefined) {
            fields.push('descuento_porcentaje = ?');
            values.push(descuento_porcentaje);
          }
          if (!(fields.length === 0)) {
            _context5.next = 17;
            break;
          }
          return _context5.abrupt("return", res.status(400).json({
            message: 'No hay datos para actualizar'
          }));
        case 17:
          values.push(id);
          _context5.next = 20;
          return pool.query("UPDATE clientes SET ".concat(fields.join(', '), " WHERE cliente_id = ?"), values);
        case 20:
          res.json({
            message: 'Cliente actualizado correctamente'
          });
          _context5.next = 26;
          break;
        case 23:
          _context5.prev = 23;
          _context5.t0 = _context5["catch"](7);
          res.status(500).json({
            message: 'Error al actualizar'
          });
        case 26:
        case "end":
          return _context5.stop();
      }
    }, _callee5, null, [[7, 23]]);
  }));
  return function updateCliente(_x9, _x10) {
    return _ref5.apply(this, arguments);
  };
}();
var deleteCliente = exports.deleteCliente = /*#__PURE__*/function () {
  var _ref6 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee6(req, res) {
    var pool, id, _yield$pool$query9, _yield$pool$query10, ventas;
    return _regenerator["default"].wrap(function _callee6$(_context6) {
      while (1) switch (_context6.prev = _context6.next) {
        case 0:
          _context6.next = 2;
          return (0, _database.connect)();
        case 2:
          pool = _context6.sent;
          id = parseInt(req.params.id);
          if (!isNaN(id)) {
            _context6.next = 6;
            break;
          }
          return _context6.abrupt("return", res.status(400).json({
            message: 'ID inválido'
          }));
        case 6:
          _context6.prev = 6;
          _context6.next = 9;
          return pool.query('SELECT COUNT(*) as total FROM ventas WHERE cliente_id = ?', [id]);
        case 9:
          _yield$pool$query9 = _context6.sent;
          _yield$pool$query10 = (0, _slicedToArray2["default"])(_yield$pool$query9, 1);
          ventas = _yield$pool$query10[0];
          if (!(ventas[0].total > 0)) {
            _context6.next = 14;
            break;
          }
          return _context6.abrupt("return", res.json({
            message: 'No se puede eliminar: el cliente tiene ventas asociadas'
          }));
        case 14:
          _context6.next = 16;
          return pool.query('DELETE FROM clientes WHERE cliente_id = ?', [id]);
        case 16:
          res.json({
            message: 'Cliente eliminado'
          });
          _context6.next = 22;
          break;
        case 19:
          _context6.prev = 19;
          _context6.t0 = _context6["catch"](6);
          res.status(500).json({
            message: 'Error al eliminar'
          });
        case 22:
        case "end":
          return _context6.stop();
      }
    }, _callee6, null, [[6, 19]]);
  }));
  return function deleteCliente(_x11, _x12) {
    return _ref6.apply(this, arguments);
  };
}();