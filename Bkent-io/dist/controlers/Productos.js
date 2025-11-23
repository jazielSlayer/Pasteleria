"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.updateProducto = exports.getProductos = exports.getProductoByCodigo = exports.getProducto = exports.deleteProducto = exports.createProducto = void 0;
var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));
var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));
var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));
var _database = require("../database");
/* ==================== LISTAR TODOS LOS PRODUCTOS ==================== */
var getProductos = exports.getProductos = /*#__PURE__*/function () {
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
          return pool.query("\n            SELECT \n                p.producto_id,\n                p.codigo,\n                p.nombre,\n                p.categoria,\n                p.precio_venta,\n                p.es_por_peso,\n                p.activo,\n                COALESCE(v.costo_unitario, 0) AS costo_unitario,\n                COALESCE(v.margen_unitario, p.precio_venta) AS margen_unitario,\n                CASE WHEN r.producto_id IS NOT NULL THEN 1 ELSE 0 END AS tiene_receta\n            FROM Productos p\n            LEFT JOIN vw_costo_productos v ON p.producto_id = v.producto_id\n            LEFT JOIN Recetas r ON p.producto_id = r.producto_id\n            WHERE p.activo = 1\n            ORDER BY p.categoria, p.nombre\n        ");
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
          console.error('Error fetching productos:', _context.t0);
          res.status(500).json({
            message: 'Error al obtener productos'
          });
        case 16:
        case "end":
          return _context.stop();
      }
    }, _callee, null, [[3, 12]]);
  }));
  return function getProductos(_x, _x2) {
    return _ref.apply(this, arguments);
  };
}();

/* ==================== OBTENER UN PRODUCTO POR ID ==================== */
var getProducto = exports.getProducto = /*#__PURE__*/function () {
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
          return pool.query("\n            SELECT \n                p.*,\n                COALESCE(v.costo_unitario, 0) AS costo_unitario,\n                COALESCE(v.margen_unitario, p.precio_venta) AS margen_unitario,\n                CASE WHEN r.producto_id IS NOT NULL THEN 1 ELSE 0 END AS tiene_receta\n            FROM Productos p\n            LEFT JOIN vw_costo_productos v ON p.producto_id = v.producto_id\n            LEFT JOIN Recetas r ON p.producto_id = r.producto_id\n            WHERE p.producto_id = ? AND p.activo = 1\n        ", [id]);
        case 9:
          _yield$pool$query3 = _context2.sent;
          _yield$pool$query4 = (0, _slicedToArray2["default"])(_yield$pool$query3, 1);
          rows = _yield$pool$query4[0];
          if (!(rows.length === 0)) {
            _context2.next = 14;
            break;
          }
          return _context2.abrupt("return", res.status(404).json({
            message: 'Producto no encontrado o inactivo'
          }));
        case 14:
          res.json(rows[0]);
          _context2.next = 21;
          break;
        case 17:
          _context2.prev = 17;
          _context2.t0 = _context2["catch"](6);
          console.error('Error fetching producto:', _context2.t0);
          res.status(500).json({
            message: 'Error al obtener producto'
          });
        case 21:
        case "end":
          return _context2.stop();
      }
    }, _callee2, null, [[6, 17]]);
  }));
  return function getProducto(_x3, _x4) {
    return _ref2.apply(this, arguments);
  };
}();

/* ==================== BUSCAR PRODUCTO POR CÓDIGO (ideal para punto de venta) ==================== */
var getProductoByCodigo = exports.getProductoByCodigo = /*#__PURE__*/function () {
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
            message: 'Parámetro "codigo" requerido'
          }));
        case 6:
          _context3.prev = 6;
          _context3.next = 9;
          return pool.query("\n            SELECT \n                producto_id,\n                codigo,\n                nombre,\n                precio_venta,\n                es_por_peso\n            FROM Productos\n            WHERE codigo = ? AND activo = 1\n        ", [codigo.trim().toUpperCase()]);
        case 9:
          _yield$pool$query5 = _context3.sent;
          _yield$pool$query6 = (0, _slicedToArray2["default"])(_yield$pool$query5, 1);
          rows = _yield$pool$query6[0];
          if (!(rows.length === 0)) {
            _context3.next = 14;
            break;
          }
          return _context3.abrupt("return", res.status(404).json({
            message: 'Producto no encontrado con ese código'
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
            message: 'Error al buscar producto'
          });
        case 21:
        case "end":
          return _context3.stop();
      }
    }, _callee3, null, [[6, 17]]);
  }));
  return function getProductoByCodigo(_x5, _x6) {
    return _ref3.apply(this, arguments);
  };
}();

/* ==================== CREAR NUEVO PRODUCTO ==================== */
var createProducto = exports.createProducto = /*#__PURE__*/function () {
  var _ref4 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee4(req, res) {
    var pool, _req$body, codigo, nombre, _req$body$categoria, categoria, precio_venta, _req$body$es_por_peso, es_por_peso, categoriasValidas, _yield$pool$query7, _yield$pool$query8, result;
    return _regenerator["default"].wrap(function _callee4$(_context4) {
      while (1) switch (_context4.prev = _context4.next) {
        case 0:
          _context4.next = 2;
          return (0, _database.connect)();
        case 2:
          pool = _context4.sent;
          _req$body = req.body, codigo = _req$body.codigo, nombre = _req$body.nombre, _req$body$categoria = _req$body.categoria, categoria = _req$body$categoria === void 0 ? 'GENERAL' : _req$body$categoria, precio_venta = _req$body.precio_venta, _req$body$es_por_peso = _req$body.es_por_peso, es_por_peso = _req$body$es_por_peso === void 0 ? 0 : _req$body$es_por_peso;
          _context4.prev = 4;
          if (!(!codigo || !nombre || !precio_venta)) {
            _context4.next = 7;
            break;
          }
          return _context4.abrupt("return", res.status(400).json({
            message: 'Código, nombre y precio de venta son obligatorios'
          }));
        case 7:
          if (/^[A-Z0-9\-_]{3,20}$/.test(codigo.trim())) {
            _context4.next = 9;
            break;
          }
          return _context4.abrupt("return", res.status(400).json({
            message: 'Código inválido (máx 20 caracteres, solo letras mayúsculas, números, - y _)'
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
          if (!(isNaN(precio_venta) || parseFloat(precio_venta) <= 0)) {
            _context4.next = 13;
            break;
          }
          return _context4.abrupt("return", res.status(400).json({
            message: 'Precio de venta debe ser mayor a 0'
          }));
        case 13:
          categoriasValidas = ['TORTAS', 'PASTELES', 'PAN DULCE', 'GALLETAS', 'BEBIDAS', 'POSTRES', 'GENERAL'];
          if (!(categoria && !categoriasValidas.includes(categoria.toUpperCase()))) {
            _context4.next = 16;
            break;
          }
          return _context4.abrupt("return", res.status(400).json({
            message: "Categor\xEDa inv\xE1lida. Use: ".concat(categoriasValidas.join(', '))
          }));
        case 16:
          _context4.next = 18;
          return pool.query("\n            INSERT INTO Productos \n                (codigo, nombre, categoria, precio_venta, es_por_peso, activo)\n            VALUES (?, ?, ?, ?, ?, 1)\n        ", [codigo.trim().toUpperCase(), nombre.trim(), categoria.trim().toUpperCase(), parseFloat(precio_venta).toFixed(2), es_por_peso ? 1 : 0]);
        case 18:
          _yield$pool$query7 = _context4.sent;
          _yield$pool$query8 = (0, _slicedToArray2["default"])(_yield$pool$query7, 1);
          result = _yield$pool$query8[0];
          res.status(201).json({
            message: 'Producto creado exitosamente',
            producto_id: result.insertId,
            codigo: codigo.trim().toUpperCase(),
            nombre: nombre.trim(),
            precio_venta: parseFloat(precio_venta).toFixed(2)
          });
          _context4.next = 30;
          break;
        case 24:
          _context4.prev = 24;
          _context4.t0 = _context4["catch"](4);
          console.error('Error creating producto:', _context4.t0);
          if (!(_context4.t0.code === 'ER_DUP_ENTRY')) {
            _context4.next = 29;
            break;
          }
          return _context4.abrupt("return", res.status(400).json({
            message: 'Ya existe un producto con ese código'
          }));
        case 29:
          res.status(500).json({
            message: 'Error al crear producto'
          });
        case 30:
        case "end":
          return _context4.stop();
      }
    }, _callee4, null, [[4, 24]]);
  }));
  return function createProducto(_x7, _x8) {
    return _ref4.apply(this, arguments);
  };
}();

/* ==================== ACTUALIZAR PRODUCTO ==================== */
var updateProducto = exports.updateProducto = /*#__PURE__*/function () {
  var _ref5 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee5(req, res) {
    var pool, id, _req$body2, codigo, nombre, categoria, precio_venta, es_por_peso, activo, _yield$pool$query9, _yield$pool$query10, exists, fields, values, categoriasValidas;
    return _regenerator["default"].wrap(function _callee5$(_context5) {
      while (1) switch (_context5.prev = _context5.next) {
        case 0:
          _context5.next = 2;
          return (0, _database.connect)();
        case 2:
          pool = _context5.sent;
          id = parseInt(req.params.id);
          _req$body2 = req.body, codigo = _req$body2.codigo, nombre = _req$body2.nombre, categoria = _req$body2.categoria, precio_venta = _req$body2.precio_venta, es_por_peso = _req$body2.es_por_peso, activo = _req$body2.activo;
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
          return pool.query('SELECT producto_id FROM Productos WHERE producto_id = ?', [id]);
        case 10:
          _yield$pool$query9 = _context5.sent;
          _yield$pool$query10 = (0, _slicedToArray2["default"])(_yield$pool$query9, 1);
          exists = _yield$pool$query10[0];
          if (!(exists.length === 0)) {
            _context5.next = 15;
            break;
          }
          return _context5.abrupt("return", res.status(404).json({
            message: 'Producto no encontrado'
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
          if (!(categoria !== undefined)) {
            _context5.next = 33;
            break;
          }
          categoriasValidas = ['TORTAS', 'PASTELES', 'PAN DULCE', 'GALLETAS', 'BEBIDAS', 'POSTRES', 'GENERAL'];
          if (categoriasValidas.includes(categoria.toUpperCase())) {
            _context5.next = 31;
            break;
          }
          return _context5.abrupt("return", res.status(400).json({
            message: 'Categoría inválida'
          }));
        case 31:
          fields.push('categoria = ?');
          values.push(categoria.toUpperCase());
        case 33:
          if (!(precio_venta !== undefined)) {
            _context5.next = 38;
            break;
          }
          if (!(isNaN(precio_venta) || parseFloat(precio_venta) <= 0)) {
            _context5.next = 36;
            break;
          }
          return _context5.abrupt("return", res.status(400).json({
            message: 'Precio inválido'
          }));
        case 36:
          fields.push('precio_venta = ?');
          values.push(parseFloat(precio_venta).toFixed(2));
        case 38:
          if (es_por_peso !== undefined) {
            fields.push('es_por_peso = ?');
            values.push(es_por_peso ? 1 : 0);
          }
          if (activo !== undefined) {
            fields.push('activo = ?');
            values.push(activo ? 1 : 0);
          }
          if (!(fields.length === 0)) {
            _context5.next = 42;
            break;
          }
          return _context5.abrupt("return", res.status(400).json({
            message: 'No se enviaron datos para actualizar'
          }));
        case 42:
          values.push(id);
          _context5.next = 45;
          return pool.query("UPDATE Productos SET ".concat(fields.join(', '), " WHERE producto_id = ?"), values);
        case 45:
          res.json({
            message: 'Producto actualizado correctamente'
          });
          _context5.next = 54;
          break;
        case 48:
          _context5.prev = 48;
          _context5.t0 = _context5["catch"](7);
          console.error('Error updating producto:', _context5.t0);
          if (!(_context5.t0.code === 'ER_DUP_ENTRY')) {
            _context5.next = 53;
            break;
          }
          return _context5.abrupt("return", res.status(400).json({
            message: 'Ya existe otro producto con ese código'
          }));
        case 53:
          res.status(500).json({
            message: 'Error al actualizar producto'
          });
        case 54:
        case "end":
          return _context5.stop();
      }
    }, _callee5, null, [[7, 48]]);
  }));
  return function updateProducto(_x9, _x10) {
    return _ref5.apply(this, arguments);
  };
}();

/* ==================== ELIMINAR / DESACTIVAR PRODUCTO ==================== */
var deleteProducto = exports.deleteProducto = /*#__PURE__*/function () {
  var _ref6 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee6(req, res) {
    var pool, id, _yield$pool$query11, _yield$pool$query12, enUso, uso, _yield$pool$query13, _yield$pool$query14, result;
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
          return pool.query("\n            SELECT \n                (SELECT COUNT(*) FROM VentaDetalle WHERE producto_id = ?) AS en_ventas,\n                (SELECT COUNT(*) FROM ProduccionDiaria WHERE producto_id = ?) AS en_produccion,\n                (SELECT COUNT(*) FROM Recetas WHERE producto_id = ?) AS tiene_receta\n        ", [id, id, id]);
        case 9:
          _yield$pool$query11 = _context6.sent;
          _yield$pool$query12 = (0, _slicedToArray2["default"])(_yield$pool$query11, 1);
          enUso = _yield$pool$query12[0];
          uso = enUso[0];
          if (!(uso.en_ventas > 0 || uso.en_produccion > 0)) {
            _context6.next = 17;
            break;
          }
          _context6.next = 16;
          return pool.query('UPDATE Productos SET activo = 0 WHERE producto_id = ?', [id]);
        case 16:
          return _context6.abrupt("return", res.json({
            message: 'Producto desactivado (tiene ventas o producción)'
          }));
        case 17:
          if (!(uso.tiene_receta > 0)) {
            _context6.next = 19;
            break;
          }
          return _context6.abrupt("return", res.status(400).json({
            message: 'No se puede eliminar: tiene receta asociada. Desactívalo.'
          }));
        case 19:
          _context6.next = 21;
          return pool.query('DELETE FROM Productos WHERE producto_id = ?', [id]);
        case 21:
          _yield$pool$query13 = _context6.sent;
          _yield$pool$query14 = (0, _slicedToArray2["default"])(_yield$pool$query13, 1);
          result = _yield$pool$query14[0];
          if (!(result.affectedRows === 0)) {
            _context6.next = 26;
            break;
          }
          return _context6.abrupt("return", res.status(404).json({
            message: 'Producto no encontrado'
          }));
        case 26:
          res.json({
            message: 'Producto eliminado permanentemente'
          });
          _context6.next = 33;
          break;
        case 29:
          _context6.prev = 29;
          _context6.t0 = _context6["catch"](6);
          console.error('Error deleting producto:', _context6.t0);
          res.status(500).json({
            message: 'Error al procesar producto'
          });
        case 33:
        case "end":
          return _context6.stop();
      }
    }, _callee6, null, [[6, 29]]);
  }));
  return function deleteProducto(_x11, _x12) {
    return _ref6.apply(this, arguments);
  };
}();