"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.updateReceta = exports.getRecetas = exports.getReceta = exports.deleteReceta = exports.createReceta = void 0;
var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));
var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));
var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));
var _database = require("../database");
function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
var getRecetas = exports.getRecetas = /*#__PURE__*/function () {
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
          return pool.query("\n            SELECT \n                r.receta_id,\n                r.producto_id,\n                p.codigo,\n                p.nombre AS producto_nombre,\n                p.categoria,\n                r.porciones_salida,\n                r.costo_mano_obra,\n                r.costo_energia,\n                COALESCE(v.costo_unitario, 0) AS costo_total_unitario,\n                COALESCE(v.margen_unitario, p.precio_venta) AS margen_unitario\n            FROM Recetas r\n            JOIN Productos p ON r.producto_id = p.producto_id\n            LEFT JOIN vw_costo_productos v ON p.producto_id = v.producto_id\n            WHERE p.activo = 1\n            ORDER BY p.nombre\n        ");
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
          console.error('Error fetching recetas:', _context.t0);
          res.status(500).json({
            message: 'Error al obtener recetas'
          });
        case 16:
        case "end":
          return _context.stop();
      }
    }, _callee, null, [[3, 12]]);
  }));
  return function getRecetas(_x, _x2) {
    return _ref.apply(this, arguments);
  };
}();
var getReceta = exports.getReceta = /*#__PURE__*/function () {
  var _ref2 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee2(req, res) {
    var pool, id, _yield$pool$query3, _yield$pool$query4, recetaRows, receta, _yield$pool$query5, _yield$pool$query6, ingredientes, costo_materias, costo_total, costo_por_porcion;
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
          return pool.query("\n            SELECT \n                r.*,\n                p.codigo,\n                p.nombre AS producto_nombre,\n                p.precio_venta,\n                p.es_por_peso,\n                COALESCE(v.costo_unitario, 0) AS costo_total_unitario,\n                COALESCE(v.margen_unitario, p.precio_venta) AS margen_unitario\n            FROM Recetas r\n            JOIN Productos p ON r.producto_id = p.producto_id\n            LEFT JOIN vw_costo_productos v ON p.producto_id = v.producto_id\n            WHERE r.receta_id = ? OR r.producto_id = ?\n        ", [id, id]);
        case 9:
          _yield$pool$query3 = _context2.sent;
          _yield$pool$query4 = (0, _slicedToArray2["default"])(_yield$pool$query3, 1);
          recetaRows = _yield$pool$query4[0];
          if (!(recetaRows.length === 0)) {
            _context2.next = 14;
            break;
          }
          return _context2.abrupt("return", res.status(404).json({
            message: 'Receta no encontrada'
          }));
        case 14:
          receta = recetaRows[0]; // Obtener ingredientes
          _context2.next = 17;
          return pool.query("\n            SELECT \n                rd.id,\n                rd.materia_id,\n                mp.codigo,\n                mp.nombre AS materia_nombre,\n                mp.unidad,\n                rd.cantidad,\n                mp.costo_promedio,\n                ROUND(rd.cantidad * mp.costo_promedio, 4) AS costo_ingrediente\n            FROM RecetaDetalle rd\n            JOIN MateriasPrimas mp ON rd.materia_id = mp.materia_id\n            WHERE rd.receta_id = ?\n            ORDER BY mp.nombre\n        ", [receta.receta_id]);
        case 17:
          _yield$pool$query5 = _context2.sent;
          _yield$pool$query6 = (0, _slicedToArray2["default"])(_yield$pool$query5, 1);
          ingredientes = _yield$pool$query6[0];
          costo_materias = ingredientes.reduce(function (sum, i) {
            return sum + (i.costo_ingrediente || 0);
          }, 0);
          costo_total = costo_materias + parseFloat(receta.costo_mano_obra || 0) + parseFloat(receta.costo_energia || 0);
          costo_por_porcion = receta.porciones_salida > 0 ? costo_total / receta.porciones_salida : 0;
          res.json({
            receta_id: receta.receta_id,
            producto_id: receta.producto_id,
            producto: {
              codigo: receta.codigo,
              nombre: receta.producto_nombre,
              precio_venta: parseFloat(receta.precio_venta),
              es_por_peso: receta.es_por_peso
            },
            porciones_salida: receta.porciones_salida,
            costo_mano_obra: parseFloat(receta.costo_mano_obra || 0),
            costo_energia: parseFloat(receta.costo_energia || 0),
            costo_materias_prima: parseFloat(costo_materias.toFixed(4)),
            costo_total_produccion: parseFloat(costo_total.toFixed(4)),
            costo_por_porcion: parseFloat(costo_por_porcion.toFixed(4)),
            margen_por_porcion: parseFloat((receta.precio_venta - costo_por_porcion).toFixed(4)),
            ingredientes: ingredientes
          });
          _context2.next = 30;
          break;
        case 26:
          _context2.prev = 26;
          _context2.t0 = _context2["catch"](6);
          console.error('Error fetching receta:', _context2.t0);
          res.status(500).json({
            message: 'Error al obtener receta'
          });
        case 30:
        case "end":
          return _context2.stop();
      }
    }, _callee2, null, [[6, 26]]);
  }));
  return function getReceta(_x3, _x4) {
    return _ref2.apply(this, arguments);
  };
}();
var createReceta = exports.createReceta = /*#__PURE__*/function () {
  var _ref3 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee3(req, res) {
    var pool, connection, _req$body, producto_id, _req$body$porciones_s, porciones_salida, _req$body$costo_mano_, costo_mano_obra, _req$body$costo_energ, costo_energia, ingredientes, _yield$connection$que, _yield$connection$que2, producto, _yield$connection$que3, _yield$connection$que4, existe, _iterator, _step, ing, materia_id, cantidad, _yield$connection$que7, _yield$connection$que8, materia, _yield$connection$que5, _yield$connection$que6, result, receta_id, _iterator2, _step2, _ing;
    return _regenerator["default"].wrap(function _callee3$(_context3) {
      while (1) switch (_context3.prev = _context3.next) {
        case 0:
          _context3.next = 2;
          return (0, _database.connect)();
        case 2:
          pool = _context3.sent;
          _context3.next = 5;
          return pool.getConnection();
        case 5:
          connection = _context3.sent;
          _context3.prev = 6;
          _context3.next = 9;
          return connection.beginTransaction();
        case 9:
          _req$body = req.body, producto_id = _req$body.producto_id, _req$body$porciones_s = _req$body.porciones_salida, porciones_salida = _req$body$porciones_s === void 0 ? 1 : _req$body$porciones_s, _req$body$costo_mano_ = _req$body.costo_mano_obra, costo_mano_obra = _req$body$costo_mano_ === void 0 ? 0 : _req$body$costo_mano_, _req$body$costo_energ = _req$body.costo_energia, costo_energia = _req$body$costo_energ === void 0 ? 0 : _req$body$costo_energ, ingredientes = _req$body.ingredientes; // Validaciones
          if (!(!producto_id || !ingredientes || !Array.isArray(ingredientes) || ingredientes.length === 0)) {
            _context3.next = 12;
            break;
          }
          return _context3.abrupt("return", res.status(400).json({
            message: 'Faltan datos: producto_id e ingredientes[] obligatorios'
          }));
        case 12:
          _context3.next = 14;
          return connection.query('SELECT producto_id FROM Productos WHERE producto_id = ? AND activo = 1', [producto_id]);
        case 14:
          _yield$connection$que = _context3.sent;
          _yield$connection$que2 = (0, _slicedToArray2["default"])(_yield$connection$que, 1);
          producto = _yield$connection$que2[0];
          if (!(producto.length === 0)) {
            _context3.next = 19;
            break;
          }
          return _context3.abrupt("return", res.status(400).json({
            message: 'Producto no encontrado o inactivo'
          }));
        case 19:
          _context3.next = 21;
          return connection.query('SELECT receta_id FROM Recetas WHERE producto_id = ?', [producto_id]);
        case 21:
          _yield$connection$que3 = _context3.sent;
          _yield$connection$que4 = (0, _slicedToArray2["default"])(_yield$connection$que3, 1);
          existe = _yield$connection$que4[0];
          if (!(existe.length > 0)) {
            _context3.next = 26;
            break;
          }
          return _context3.abrupt("return", res.status(400).json({
            message: 'Ya existe una receta para este producto'
          }));
        case 26:
          if (!(porciones_salida <= 0)) {
            _context3.next = 28;
            break;
          }
          return _context3.abrupt("return", res.status(400).json({
            message: 'Porciones de salida debe ser mayor a 0'
          }));
        case 28:
          // Validar cada ingrediente
          _iterator = _createForOfIteratorHelper(ingredientes);
          _context3.prev = 29;
          _iterator.s();
        case 31:
          if ((_step = _iterator.n()).done) {
            _context3.next = 45;
            break;
          }
          ing = _step.value;
          materia_id = ing.materia_id, cantidad = ing.cantidad;
          if (!(!materia_id || !cantidad || cantidad <= 0)) {
            _context3.next = 36;
            break;
          }
          throw new Error('Cada ingrediente debe tener materia_id y cantidad > 0');
        case 36:
          _context3.next = 38;
          return connection.query('SELECT materia_id FROM MateriasPrimas WHERE materia_id = ?', [materia_id]);
        case 38:
          _yield$connection$que7 = _context3.sent;
          _yield$connection$que8 = (0, _slicedToArray2["default"])(_yield$connection$que7, 1);
          materia = _yield$connection$que8[0];
          if (!(materia.length === 0)) {
            _context3.next = 43;
            break;
          }
          throw new Error("Materia prima ID ".concat(materia_id, " no existe"));
        case 43:
          _context3.next = 31;
          break;
        case 45:
          _context3.next = 50;
          break;
        case 47:
          _context3.prev = 47;
          _context3.t0 = _context3["catch"](29);
          _iterator.e(_context3.t0);
        case 50:
          _context3.prev = 50;
          _iterator.f();
          return _context3.finish(50);
        case 53:
          _context3.next = 55;
          return connection.query("\n            INSERT INTO Recetas (producto_id, porciones_salida, costo_mano_obra, costo_energia)\n            VALUES (?, ?, ?, ?)\n        ", [producto_id, porciones_salida, parseFloat(costo_mano_obra), parseFloat(costo_energia)]);
        case 55:
          _yield$connection$que5 = _context3.sent;
          _yield$connection$que6 = (0, _slicedToArray2["default"])(_yield$connection$que5, 1);
          result = _yield$connection$que6[0];
          receta_id = result.insertId; // Insertar ingredientes
          _iterator2 = _createForOfIteratorHelper(ingredientes);
          _context3.prev = 60;
          _iterator2.s();
        case 62:
          if ((_step2 = _iterator2.n()).done) {
            _context3.next = 68;
            break;
          }
          _ing = _step2.value;
          _context3.next = 66;
          return connection.query("\n                INSERT INTO RecetaDetalle (receta_id, materia_id, cantidad)\n                VALUES (?, ?, ?)\n            ", [receta_id, _ing.materia_id, parseFloat(_ing.cantidad)]);
        case 66:
          _context3.next = 62;
          break;
        case 68:
          _context3.next = 73;
          break;
        case 70:
          _context3.prev = 70;
          _context3.t1 = _context3["catch"](60);
          _iterator2.e(_context3.t1);
        case 73:
          _context3.prev = 73;
          _iterator2.f();
          return _context3.finish(73);
        case 76:
          _context3.next = 78;
          return connection.commit();
        case 78:
          res.status(201).json({
            message: 'Receta creada exitosamente',
            receta_id: receta_id,
            producto_id: producto_id,
            porciones_salida: porciones_salida,
            total_ingredientes: ingredientes.length
          });
          _context3.next = 87;
          break;
        case 81:
          _context3.prev = 81;
          _context3.t2 = _context3["catch"](6);
          _context3.next = 85;
          return connection.rollback();
        case 85:
          console.error('Error creating receta:', _context3.t2);
          res.status(500).json({
            message: 'Error al crear receta',
            error: _context3.t2.message || 'Datos inválidos'
          });
        case 87:
          _context3.prev = 87;
          connection.release();
          return _context3.finish(87);
        case 90:
        case "end":
          return _context3.stop();
      }
    }, _callee3, null, [[6, 81, 87, 90], [29, 47, 50, 53], [60, 70, 73, 76]]);
  }));
  return function createReceta(_x5, _x6) {
    return _ref3.apply(this, arguments);
  };
}();
var updateReceta = exports.updateReceta = /*#__PURE__*/function () {
  var _ref4 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee4(req, res) {
    var pool, connection, id, _req$body2, porciones_salida, _req$body2$costo_mano, costo_mano_obra, _req$body2$costo_ener, costo_energia, ingredientes, _yield$connection$que9, _yield$connection$que10, receta, _iterator3, _step3, ing, _yield$connection$que11, _yield$connection$que12, m, _iterator4, _step4, _ing2;
    return _regenerator["default"].wrap(function _callee4$(_context4) {
      while (1) switch (_context4.prev = _context4.next) {
        case 0:
          _context4.next = 2;
          return (0, _database.connect)();
        case 2:
          pool = _context4.sent;
          _context4.next = 5;
          return pool.getConnection();
        case 5:
          connection = _context4.sent;
          id = parseInt(req.params.id);
          _context4.prev = 7;
          _context4.next = 10;
          return connection.beginTransaction();
        case 10:
          _req$body2 = req.body, porciones_salida = _req$body2.porciones_salida, _req$body2$costo_mano = _req$body2.costo_mano_obra, costo_mano_obra = _req$body2$costo_mano === void 0 ? 0 : _req$body2$costo_mano, _req$body2$costo_ener = _req$body2.costo_energia, costo_energia = _req$body2$costo_ener === void 0 ? 0 : _req$body2$costo_ener, ingredientes = _req$body2.ingredientes;
          if (!(!ingredientes || !Array.isArray(ingredientes) || ingredientes.length === 0)) {
            _context4.next = 13;
            break;
          }
          return _context4.abrupt("return", res.status(400).json({
            message: 'Debe enviar al menos un ingrediente'
          }));
        case 13:
          _context4.next = 15;
          return connection.query('SELECT * FROM Recetas WHERE receta_id = ?', [id]);
        case 15:
          _yield$connection$que9 = _context4.sent;
          _yield$connection$que10 = (0, _slicedToArray2["default"])(_yield$connection$que9, 1);
          receta = _yield$connection$que10[0];
          if (!(receta.length === 0)) {
            _context4.next = 20;
            break;
          }
          return _context4.abrupt("return", res.status(404).json({
            message: 'Receta no encontrada'
          }));
        case 20:
          // Validar ingredientes
          _iterator3 = _createForOfIteratorHelper(ingredientes);
          _context4.prev = 21;
          _iterator3.s();
        case 23:
          if ((_step3 = _iterator3.n()).done) {
            _context4.next = 36;
            break;
          }
          ing = _step3.value;
          if (!(!ing.materia_id || !ing.cantidad || ing.cantidad <= 0)) {
            _context4.next = 27;
            break;
          }
          throw new Error('Ingrediente inválido');
        case 27:
          _context4.next = 29;
          return connection.query('SELECT materia_id FROM MateriasPrimas WHERE materia_id = ?', [ing.materia_id]);
        case 29:
          _yield$connection$que11 = _context4.sent;
          _yield$connection$que12 = (0, _slicedToArray2["default"])(_yield$connection$que11, 1);
          m = _yield$connection$que12[0];
          if (!(m.length === 0)) {
            _context4.next = 34;
            break;
          }
          throw new Error("Materia prima ".concat(ing.materia_id, " no existe"));
        case 34:
          _context4.next = 23;
          break;
        case 36:
          _context4.next = 41;
          break;
        case 38:
          _context4.prev = 38;
          _context4.t0 = _context4["catch"](21);
          _iterator3.e(_context4.t0);
        case 41:
          _context4.prev = 41;
          _iterator3.f();
          return _context4.finish(41);
        case 44:
          _context4.next = 46;
          return connection.query("\n            UPDATE Recetas \n            SET porciones_salida = ?, costo_mano_obra = ?, costo_energia = ?\n            WHERE receta_id = ?\n        ", [porciones_salida || receta[0].porciones_salida, parseFloat(costo_mano_obra), parseFloat(costo_energia), id]);
        case 46:
          _context4.next = 48;
          return connection.query('DELETE FROM RecetaDetalle WHERE receta_id = ?', [id]);
        case 48:
          // Insertar nuevos
          _iterator4 = _createForOfIteratorHelper(ingredientes);
          _context4.prev = 49;
          _iterator4.s();
        case 51:
          if ((_step4 = _iterator4.n()).done) {
            _context4.next = 57;
            break;
          }
          _ing2 = _step4.value;
          _context4.next = 55;
          return connection.query("\n                INSERT INTO RecetaDetalle (receta_id, materia_id, cantidad)\n                VALUES (?, ?, ?)\n            ", [id, _ing2.materia_id, parseFloat(_ing2.cantidad)]);
        case 55:
          _context4.next = 51;
          break;
        case 57:
          _context4.next = 62;
          break;
        case 59:
          _context4.prev = 59;
          _context4.t1 = _context4["catch"](49);
          _iterator4.e(_context4.t1);
        case 62:
          _context4.prev = 62;
          _iterator4.f();
          return _context4.finish(62);
        case 65:
          _context4.next = 67;
          return connection.commit();
        case 67:
          res.json({
            message: 'Receta actualizada correctamente'
          });
          _context4.next = 76;
          break;
        case 70:
          _context4.prev = 70;
          _context4.t2 = _context4["catch"](7);
          _context4.next = 74;
          return connection.rollback();
        case 74:
          console.error('Error updating receta:', _context4.t2);
          res.status(500).json({
            message: 'Error al actualizar receta'
          });
        case 76:
          _context4.prev = 76;
          connection.release();
          return _context4.finish(76);
        case 79:
        case "end":
          return _context4.stop();
      }
    }, _callee4, null, [[7, 70, 76, 79], [21, 38, 41, 44], [49, 59, 62, 65]]);
  }));
  return function updateReceta(_x7, _x8) {
    return _ref4.apply(this, arguments);
  };
}();
var deleteReceta = exports.deleteReceta = /*#__PURE__*/function () {
  var _ref5 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee5(req, res) {
    var pool, connection, id, _yield$connection$que13, _yield$connection$que14, usada, _yield$connection$que15, _yield$connection$que16, result;
    return _regenerator["default"].wrap(function _callee5$(_context5) {
      while (1) switch (_context5.prev = _context5.next) {
        case 0:
          _context5.next = 2;
          return (0, _database.connect)();
        case 2:
          pool = _context5.sent;
          _context5.next = 5;
          return pool.getConnection();
        case 5:
          connection = _context5.sent;
          id = parseInt(req.params.id);
          _context5.prev = 7;
          _context5.next = 10;
          return connection.beginTransaction();
        case 10:
          _context5.next = 12;
          return connection.query("\n            SELECT COUNT(*) AS total \n            FROM ProduccionDiaria pd\n            JOIN Recetas r ON pd.producto_id = r.producto_id\n            WHERE r.receta_id = ?\n        ", [id]);
        case 12:
          _yield$connection$que13 = _context5.sent;
          _yield$connection$que14 = (0, _slicedToArray2["default"])(_yield$connection$que13, 1);
          usada = _yield$connection$que14[0];
          if (!(usada[0].total > 0)) {
            _context5.next = 17;
            break;
          }
          return _context5.abrupt("return", res.status(400).json({
            message: 'No se puede eliminar: esta receta ya se usó en producción'
          }));
        case 17:
          _context5.next = 19;
          return connection.query('DELETE FROM RecetaDetalle WHERE receta_id = ?', [id]);
        case 19:
          _context5.next = 21;
          return connection.query('DELETE FROM Recetas WHERE receta_id = ?', [id]);
        case 21:
          _yield$connection$que15 = _context5.sent;
          _yield$connection$que16 = (0, _slicedToArray2["default"])(_yield$connection$que15, 1);
          result = _yield$connection$que16[0];
          if (!(result.affectedRows === 0)) {
            _context5.next = 26;
            break;
          }
          return _context5.abrupt("return", res.status(404).json({
            message: 'Receta no encontrada'
          }));
        case 26:
          _context5.next = 28;
          return connection.commit();
        case 28:
          res.json({
            message: 'Receta eliminada correctamente'
          });
          _context5.next = 37;
          break;
        case 31:
          _context5.prev = 31;
          _context5.t0 = _context5["catch"](7);
          _context5.next = 35;
          return connection.rollback();
        case 35:
          console.error('Error deleting receta:', _context5.t0);
          res.status(500).json({
            message: 'Error al eliminar receta'
          });
        case 37:
          _context5.prev = 37;
          connection.release();
          return _context5.finish(37);
        case 40:
        case "end":
          return _context5.stop();
      }
    }, _callee5, null, [[7, 31, 37, 40]]);
  }));
  return function deleteReceta(_x9, _x10) {
    return _ref5.apply(this, arguments);
  };
}();