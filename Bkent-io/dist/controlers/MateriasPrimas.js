"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.updateMateriaPrima = exports.getMateriasPrimas = exports.getMateriaPrimaByCodigo = exports.getMateriaPrima = exports.deleteMateriaPrima = exports.createMateriaPrima = void 0;
var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));
var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));
var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));
var _database = require("../database");
/* ==================== OBTENER TODAS LAS MATERIAS PRIMAS ==================== */
var getMateriasPrimas = exports.getMateriasPrimas = /*#__PURE__*/function () {
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
          return pool.query("\n            SELECT \n                mp.materia_id,\n                mp.codigo,\n                mp.nombre,\n                mp.unidad,\n                mp.stock_minimo,\n                mp.stock_actual,\n                mp.costo_promedio,\n                mp.proveedor_preferido_id,\n                p.nombre AS proveedor_preferido_nombre\n            FROM MateriasPrimas mp\n            LEFT JOIN Proveedores p ON mp.proveedor_preferido_id = p.proveedor_id AND p.activo = 1\n            ORDER BY mp.nombre ASC\n        ");
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
          console.error('Error fetching materias primas:', _context.t0);
          res.status(500).json({
            message: 'Error al obtener materias primas'
          });
        case 16:
        case "end":
          return _context.stop();
      }
    }, _callee, null, [[3, 12]]);
  }));
  return function getMateriasPrimas(_x, _x2) {
    return _ref.apply(this, arguments);
  };
}();

/* ==================== OBTENER UNA MATERIA PRIMA POR ID ==================== */
var getMateriaPrima = exports.getMateriaPrima = /*#__PURE__*/function () {
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
          return pool.query("\n            SELECT \n                mp.*,\n                p.nombre AS proveedor_preferido_nombre\n            FROM MateriasPrimas mp\n            LEFT JOIN Proveedores p ON mp.proveedor_preferido_id = p.proveedor_id AND p.activo = 1\n            WHERE mp.materia_id = ?\n        ", [id]);
        case 9:
          _yield$pool$query3 = _context2.sent;
          _yield$pool$query4 = (0, _slicedToArray2["default"])(_yield$pool$query3, 1);
          rows = _yield$pool$query4[0];
          if (!(rows.length === 0)) {
            _context2.next = 14;
            break;
          }
          return _context2.abrupt("return", res.status(404).json({
            message: 'Materia prima no encontrada'
          }));
        case 14:
          res.json(rows[0]);
          _context2.next = 21;
          break;
        case 17:
          _context2.prev = 17;
          _context2.t0 = _context2["catch"](6);
          console.error('Error fetching materia prima:', _context2.t0);
          res.status(500).json({
            message: 'Error al obtener materia prima'
          });
        case 21:
        case "end":
          return _context2.stop();
      }
    }, _callee2, null, [[6, 17]]);
  }));
  return function getMateriaPrima(_x3, _x4) {
    return _ref2.apply(this, arguments);
  };
}();
var getMateriaPrimaByCodigo = exports.getMateriaPrimaByCodigo = /*#__PURE__*/function () {
  var _ref3 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee3(req, res) {
    var pool, codigo, _yield$pool$query5, _yield$pool$query6, rows;
    return _regenerator["default"].wrap(function _callee3$(_context3) {
      while (1) switch (_context3.prev = _context3.next) {
        case 0:
          _context3.next = 2;
          return (0, _database.connect)();
        case 2:
          pool = _context3.sent;
          codigo = req.query.codigo;
          if (!(!codigo || codigo.trim() === '')) {
            _context3.next = 6;
            break;
          }
          return _context3.abrupt("return", res.status(400).json({
            message: 'El parámetro "codigo" es requerido'
          }));
        case 6:
          _context3.prev = 6;
          _context3.next = 9;
          return pool.query("\n            SELECT \n                mp.*,\n                p.nombre AS proveedor_preferido_nombre\n            FROM MateriasPrimas mp\n            LEFT JOIN Proveedores p ON mp.proveedor_preferido_id = p.proveedor_id\n            WHERE mp.codigo = ?\n        ", [codigo.trim().toUpperCase()]);
        case 9:
          _yield$pool$query5 = _context3.sent;
          _yield$pool$query6 = (0, _slicedToArray2["default"])(_yield$pool$query5, 1);
          rows = _yield$pool$query6[0];
          if (!(rows.length === 0)) {
            _context3.next = 14;
            break;
          }
          return _context3.abrupt("return", res.status(404).json({
            message: 'Materia prima no encontrada con ese código'
          }));
        case 14:
          res.json(rows[0]);
          _context3.next = 21;
          break;
        case 17:
          _context3.prev = 17;
          _context3.t0 = _context3["catch"](6);
          console.error('Error buscando por código:', _context3.t0);
          res.status(500).json({
            message: 'Error al buscar materia prima'
          });
        case 21:
        case "end":
          return _context3.stop();
      }
    }, _callee3, null, [[6, 17]]);
  }));
  return function getMateriaPrimaByCodigo(_x5, _x6) {
    return _ref3.apply(this, arguments);
  };
}();
var createMateriaPrima = exports.createMateriaPrima = /*#__PURE__*/function () {
  var _ref4 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee4(req, res) {
    var pool, _req$body, codigo, nombre, unidad, _req$body$stock_minim, stock_minimo, _req$body$stock_actua, stock_actual, _req$body$costo_prome, costo_promedio, _req$body$proveedor_p, proveedor_preferido_id, unidadesValidas, _yield$pool$query7, _yield$pool$query8, prov, _yield$pool$query9, _yield$pool$query10, result;
    return _regenerator["default"].wrap(function _callee4$(_context4) {
      while (1) switch (_context4.prev = _context4.next) {
        case 0:
          _context4.next = 2;
          return (0, _database.connect)();
        case 2:
          pool = _context4.sent;
          _req$body = req.body, codigo = _req$body.codigo, nombre = _req$body.nombre, unidad = _req$body.unidad, _req$body$stock_minim = _req$body.stock_minimo, stock_minimo = _req$body$stock_minim === void 0 ? 0 : _req$body$stock_minim, _req$body$stock_actua = _req$body.stock_actual, stock_actual = _req$body$stock_actua === void 0 ? 0 : _req$body$stock_actua, _req$body$costo_prome = _req$body.costo_promedio, costo_promedio = _req$body$costo_prome === void 0 ? 0 : _req$body$costo_prome, _req$body$proveedor_p = _req$body.proveedor_preferido_id, proveedor_preferido_id = _req$body$proveedor_p === void 0 ? null : _req$body$proveedor_p;
          _context4.prev = 4;
          if (!(!codigo || !nombre || !unidad)) {
            _context4.next = 7;
            break;
          }
          return _context4.abrupt("return", res.status(400).json({
            message: 'Código, nombre y unidad son obligatorios'
          }));
        case 7:
          if (/^[A-Z0-9\-_]{3,20}$/.test(codigo.trim())) {
            _context4.next = 9;
            break;
          }
          return _context4.abrupt("return", res.status(400).json({
            message: 'Código inválido (solo mayúsculas, números, guiones y _ , 3-20 caracteres)'
          }));
        case 9:
          if (!(nombre.trim().length < 3)) {
            _context4.next = 11;
            break;
          }
          return _context4.abrupt("return", res.status(400).json({
            message: 'El nombre debe tener al menos 3 caracteres'
          }));
        case 11:
          unidadesValidas = ['kg', 'g', 'litro', 'ml', 'unidad', 'docena', 'paquete', 'caja'];
          if (unidadesValidas.includes(unidad.toLowerCase())) {
            _context4.next = 14;
            break;
          }
          return _context4.abrupt("return", res.status(400).json({
            message: "Unidad no v\xE1lida. Use: ".concat(unidadesValidas.join(', '))
          }));
        case 14:
          if (!proveedor_preferido_id) {
            _context4.next = 22;
            break;
          }
          _context4.next = 17;
          return pool.query('SELECT proveedor_id FROM Proveedores WHERE proveedor_id = ? AND activo = 1', [proveedor_preferido_id]);
        case 17:
          _yield$pool$query7 = _context4.sent;
          _yield$pool$query8 = (0, _slicedToArray2["default"])(_yield$pool$query7, 1);
          prov = _yield$pool$query8[0];
          if (!(prov.length === 0)) {
            _context4.next = 22;
            break;
          }
          return _context4.abrupt("return", res.status(400).json({
            message: 'Proveedor preferido no existe o está inactivo'
          }));
        case 22:
          _context4.next = 24;
          return pool.query("\n            INSERT INTO MateriasPrimas \n                (codigo, nombre, unidad, stock_minimo, stock_actual, costo_promedio, proveedor_preferido_id)\n            VALUES (?, ?, ?, ?, ?, ?, ?)\n        ", [codigo.trim().toUpperCase(), nombre.trim(), unidad.toLowerCase(), parseFloat(stock_minimo) || 0, parseFloat(stock_actual) || 0, parseFloat(costo_promedio) || 0, proveedor_preferido_id ? parseInt(proveedor_preferido_id) : null]);
        case 24:
          _yield$pool$query9 = _context4.sent;
          _yield$pool$query10 = (0, _slicedToArray2["default"])(_yield$pool$query9, 1);
          result = _yield$pool$query10[0];
          res.status(201).json({
            message: 'Materia prima creada exitosamente',
            materia_id: result.insertId,
            codigo: codigo.trim().toUpperCase(),
            nombre: nombre.trim()
          });
          _context4.next = 38;
          break;
        case 30:
          _context4.prev = 30;
          _context4.t0 = _context4["catch"](4);
          console.error('Error creating materia prima:', _context4.t0);
          if (!(_context4.t0.code === 'ER_DUP_ENTRY')) {
            _context4.next = 35;
            break;
          }
          return _context4.abrupt("return", res.status(400).json({
            message: 'Ya existe una materia prima con ese código'
          }));
        case 35:
          if (!(_context4.t0.code === 'ER_NO_REFERENCED_ROW_2')) {
            _context4.next = 37;
            break;
          }
          return _context4.abrupt("return", res.status(400).json({
            message: 'Proveedor preferido inválido'
          }));
        case 37:
          res.status(500).json({
            message: 'Error al crear materia prima'
          });
        case 38:
        case "end":
          return _context4.stop();
      }
    }, _callee4, null, [[4, 30]]);
  }));
  return function createMateriaPrima(_x7, _x8) {
    return _ref4.apply(this, arguments);
  };
}();
var updateMateriaPrima = exports.updateMateriaPrima = /*#__PURE__*/function () {
  var _ref5 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee5(req, res) {
    var pool, id, _req$body2, codigo, nombre, unidad, stock_minimo, stock_actual, costo_promedio, proveedor_preferido_id, _yield$pool$query11, _yield$pool$query12, exists, fields, values, unidadesValidas, _yield$pool$query13, _yield$pool$query14, prov;
    return _regenerator["default"].wrap(function _callee5$(_context5) {
      while (1) switch (_context5.prev = _context5.next) {
        case 0:
          _context5.next = 2;
          return (0, _database.connect)();
        case 2:
          pool = _context5.sent;
          id = parseInt(req.params.id);
          _req$body2 = req.body, codigo = _req$body2.codigo, nombre = _req$body2.nombre, unidad = _req$body2.unidad, stock_minimo = _req$body2.stock_minimo, stock_actual = _req$body2.stock_actual, costo_promedio = _req$body2.costo_promedio, proveedor_preferido_id = _req$body2.proveedor_preferido_id;
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
          return pool.query('SELECT materia_id FROM MateriasPrimas WHERE materia_id = ?', [id]);
        case 10:
          _yield$pool$query11 = _context5.sent;
          _yield$pool$query12 = (0, _slicedToArray2["default"])(_yield$pool$query11, 1);
          exists = _yield$pool$query12[0];
          if (!(exists.length === 0)) {
            _context5.next = 15;
            break;
          }
          return _context5.abrupt("return", res.status(404).json({
            message: 'Materia prima no encontrada'
          }));
        case 15:
          fields = [];
          values = [];
          if (!(codigo !== undefined)) {
            _context5.next = 22;
            break;
          }
          if (/^[A-Z0-9\-_]{3,20}$/.test(codigo.trim())) {
            _context5.next = 20;
            break;
          }
          return _context5.abrupt("return", res.status(400).json({
            message: 'Código inválido'
          }));
        case 20:
          fields.push('codigo = ?');
          values.push(codigo.trim().toUpperCase());
        case 22:
          if (!(nombre !== undefined)) {
            _context5.next = 27;
            break;
          }
          if (!(nombre.trim().length < 3)) {
            _context5.next = 25;
            break;
          }
          return _context5.abrupt("return", res.status(400).json({
            message: 'Nombre muy corto'
          }));
        case 25:
          fields.push('nombre = ?');
          values.push(nombre.trim());
        case 27:
          if (!(unidad !== undefined)) {
            _context5.next = 33;
            break;
          }
          unidadesValidas = ['kg', 'g', 'litro', 'ml', 'unidad', 'docena', 'paquete', 'caja'];
          if (unidadesValidas.includes(unidad.toLowerCase())) {
            _context5.next = 31;
            break;
          }
          return _context5.abrupt("return", res.status(400).json({
            message: "Unidad no v\xE1lida"
          }));
        case 31:
          fields.push('unidad = ?');
          values.push(unidad.toLowerCase());
        case 33:
          if (stock_minimo !== undefined) {
            fields.push('stock_minimo = ?');
            values.push(parseFloat(stock_minimo) || 0);
          }
          if (stock_actual !== undefined) {
            fields.push('stock_actual = ?');
            values.push(parseFloat(stock_actual) || 0);
          }
          if (costo_promedio !== undefined) {
            fields.push('costo_promedio = ?');
            values.push(parseFloat(costo_promedio) || 0);
          }
          if (!(proveedor_preferido_id !== undefined)) {
            _context5.next = 50;
            break;
          }
          if (!(proveedor_preferido_id === null)) {
            _context5.next = 41;
            break;
          }
          fields.push('proveedor_preferido_id = NULL');
          _context5.next = 50;
          break;
        case 41:
          _context5.next = 43;
          return pool.query('SELECT proveedor_id FROM Proveedores WHERE proveedor_id = ? AND activo = 1', [proveedor_preferido_id]);
        case 43:
          _yield$pool$query13 = _context5.sent;
          _yield$pool$query14 = (0, _slicedToArray2["default"])(_yield$pool$query13, 1);
          prov = _yield$pool$query14[0];
          if (!(prov.length === 0)) {
            _context5.next = 48;
            break;
          }
          return _context5.abrupt("return", res.status(400).json({
            message: 'Proveedor preferido inválido'
          }));
        case 48:
          fields.push('proveedor_preferido_id = ?');
          values.push(parseInt(proveedor_preferido_id));
        case 50:
          if (!(fields.length === 0)) {
            _context5.next = 52;
            break;
          }
          return _context5.abrupt("return", res.status(400).json({
            message: 'No se enviaron datos para actualizar'
          }));
        case 52:
          values.push(id);
          _context5.next = 55;
          return pool.query("UPDATE MateriasPrimas SET ".concat(fields.join(', '), " WHERE materia_id = ?"), values);
        case 55:
          res.json({
            message: 'Materia prima actualizada correctamente'
          });
          _context5.next = 64;
          break;
        case 58:
          _context5.prev = 58;
          _context5.t0 = _context5["catch"](7);
          console.error('Error updating materia prima:', _context5.t0);
          if (!(_context5.t0.code === 'ER_DUP_ENTRY')) {
            _context5.next = 63;
            break;
          }
          return _context5.abrupt("return", res.status(400).json({
            message: 'Ya existe otra materia prima con ese código'
          }));
        case 63:
          res.status(500).json({
            message: 'Error al actualizar materia prima'
          });
        case 64:
        case "end":
          return _context5.stop();
      }
    }, _callee5, null, [[7, 58]]);
  }));
  return function updateMateriaPrima(_x9, _x10) {
    return _ref5.apply(this, arguments);
  };
}();
var deleteMateriaPrima = exports.deleteMateriaPrima = /*#__PURE__*/function () {
  var _ref6 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee6(req, res) {
    var pool, id, _yield$pool$query15, _yield$pool$query16, enUso, uso, _yield$pool$query17, _yield$pool$query18, result;
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
          return pool.query("\n            SELECT \n                (SELECT COUNT(*) FROM CompraDetalle WHERE materia_id = ?) AS en_compras,\n                (SELECT COUNT(*) FROM RecetaDetalle WHERE materia_id = ?) AS en_recetas,\n                (SELECT COUNT(*) FROM MovimientosInventario WHERE materia_id = ?) AS en_movimientos\n        ", [id, id, id]);
        case 9:
          _yield$pool$query15 = _context6.sent;
          _yield$pool$query16 = (0, _slicedToArray2["default"])(_yield$pool$query15, 1);
          enUso = _yield$pool$query16[0];
          uso = enUso[0];
          if (!(uso.en_compras > 0 || uso.en_recetas > 0 || uso.en_movimientos > 0)) {
            _context6.next = 15;
            break;
          }
          return _context6.abrupt("return", res.status(400).json({
            message: 'No se puede eliminar: la materia prima tiene compras, recetas o movimientos asociados'
          }));
        case 15:
          _context6.next = 17;
          return pool.query('DELETE FROM MateriasPrimas WHERE materia_id = ?', [id]);
        case 17:
          _yield$pool$query17 = _context6.sent;
          _yield$pool$query18 = (0, _slicedToArray2["default"])(_yield$pool$query17, 1);
          result = _yield$pool$query18[0];
          if (!(result.affectedRows === 0)) {
            _context6.next = 22;
            break;
          }
          return _context6.abrupt("return", res.status(404).json({
            message: 'Materia prima no encontrada'
          }));
        case 22:
          res.json({
            message: 'Materia prima eliminada correctamente'
          });
          _context6.next = 29;
          break;
        case 25:
          _context6.prev = 25;
          _context6.t0 = _context6["catch"](6);
          console.error('Error deleting materia prima:', _context6.t0);
          res.status(500).json({
            message: 'Error al eliminar materia prima'
          });
        case 29:
        case "end":
          return _context6.stop();
      }
    }, _callee6, null, [[6, 25]]);
  }));
  return function deleteMateriaPrima(_x11, _x12) {
    return _ref6.apply(this, arguments);
  };
}();