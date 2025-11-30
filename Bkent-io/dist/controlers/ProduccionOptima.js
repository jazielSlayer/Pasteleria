"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.analizarSensibilidad = analizarSensibilidad;
exports.optimizarProduccion = optimizarProduccion;
exports.planificarProduccionPeriodo = planificarProduccionPeriodo;
var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));
var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));
var _typeof2 = _interopRequireDefault(require("@babel/runtime/helpers/typeof"));
var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));
var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));
var _database = require("../database");
var _highs = _interopRequireDefault(require("highs"));
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { (0, _defineProperty2["default"])(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function optimizarProduccion() {
  return _optimizarProduccion.apply(this, arguments);
}
function _optimizarProduccion() {
  _optimizarProduccion = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee() {
    var highsInstance, pool, _yield$pool$execute, _yield$pool$execute2, checkRecursos, _yield$pool$execute3, _yield$pool$execute4, allProducts, _yield$pool$execute5, _yield$pool$execute6, resources, _yield$pool$execute7, _yield$pool$execute8, usages, productosConRecursos, products, varMap, varNames, resMap, resConstraintNames, usageMap, lp, objTerms, hasConstraints, _yield$pool$execute9, _yield$pool$execute10, demandas, results, produccion, productosNoIncluidos, utilidadTotal, recursosUsados;
    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          _context.next = 3;
          return (0, _highs["default"])();
        case 3:
          highsInstance = _context.sent;
          pool = (0, _database.connect)(); // Validar que existan datos en producto_recursos
          _context.next = 7;
          return pool.execute('SELECT COUNT(*) as total FROM producto_recursos');
        case 7:
          _yield$pool$execute = _context.sent;
          _yield$pool$execute2 = (0, _slicedToArray2["default"])(_yield$pool$execute, 1);
          checkRecursos = _yield$pool$execute2[0];
          if (!(checkRecursos[0].total === 0)) {
            _context.next = 12;
            break;
          }
          return _context.abrupt("return", {
            success: false,
            message: 'No hay datos en la tabla producto_recursos. Debes configurar los recursos que consume cada producto.'
          });
        case 12:
          _context.next = 14;
          return pool.execute('SELECT producto_id, nombre, margen_unitario FROM vw_costo_productos WHERE margen_unitario > 0');
        case 14:
          _yield$pool$execute3 = _context.sent;
          _yield$pool$execute4 = (0, _slicedToArray2["default"])(_yield$pool$execute3, 1);
          allProducts = _yield$pool$execute4[0];
          if (!(allProducts.length === 0)) {
            _context.next = 19;
            break;
          }
          return _context.abrupt("return", {
            success: false,
            message: 'No se encontraron productos con margen de utilidad positivo.'
          });
        case 19:
          _context.next = 21;
          return pool.execute('SELECT nombre, cantidad_disponible AS rhs FROM recursos_produccion WHERE cantidad_disponible > 0');
        case 21:
          _yield$pool$execute5 = _context.sent;
          _yield$pool$execute6 = (0, _slicedToArray2["default"])(_yield$pool$execute5, 1);
          resources = _yield$pool$execute6[0];
          if (!(resources.length === 0)) {
            _context.next = 26;
            break;
          }
          return _context.abrupt("return", {
            success: false,
            message: 'No se encontraron recursos de producción configurados.'
          });
        case 26:
          _context.next = 28;
          return pool.execute('SELECT producto_id, recurso_nombre, cantidad_requerida FROM producto_recursos WHERE cantidad_requerida > 0');
        case 28:
          _yield$pool$execute7 = _context.sent;
          _yield$pool$execute8 = (0, _slicedToArray2["default"])(_yield$pool$execute7, 1);
          usages = _yield$pool$execute8[0];
          if (!(usages.length === 0)) {
            _context.next = 33;
            break;
          }
          return _context.abrupt("return", {
            success: false,
            message: 'No hay productos con recursos asignados.'
          });
        case 33:
          productosConRecursos = new Set(usages.map(function (u) {
            return u.producto_id;
          }));
          products = allProducts.filter(function (p) {
            return productosConRecursos.has(p.producto_id);
          });
          if (!(products.length === 0)) {
            _context.next = 37;
            break;
          }
          return _context.abrupt("return", {
            success: false,
            message: 'Ninguno de los productos rentables tiene recursos asignados.'
          });
        case 37:
          varMap = {};
          varNames = [];
          products.forEach(function (p, index) {
            var varName = "x".concat(index + 1);
            varMap[p.producto_id] = {
              varName: varName,
              nombre: p.nombre,
              coef: parseFloat(p.margen_unitario) || 0,
              producto_id: p.producto_id
            };
            varNames.push(varName);
          });
          resMap = {};
          resConstraintNames = {};
          resources.forEach(function (r) {
            resMap[r.nombre] = parseFloat(r.rhs);
            resConstraintNames[r.nombre] = r.nombre.replace(/\s+/g, '_');
          });
          usageMap = {};
          Object.keys(resMap).forEach(function (res) {
            usageMap[res] = {};
          });
          usages.forEach(function (u) {
            if (usageMap[u.recurso_nombre] && varMap[u.producto_id]) {
              usageMap[u.recurso_nombre][u.producto_id] = parseFloat(u.cantidad_requerida);
            }
          });
          lp = 'Maximize\n';
          objTerms = products.map(function (p, i) {
            var coef = varMap[p.producto_id].coef;
            if (coef > 0) return "".concat(coef, " ").concat(varNames[i]);
            return null;
          }).filter(function (t) {
            return t;
          });
          if (!(objTerms.length === 0)) {
            _context.next = 50;
            break;
          }
          return _context.abrupt("return", {
            success: false,
            message: 'No hay productos con margen positivo.'
          });
        case 50:
          lp += 'obj: ' + objTerms.join(' + ') + '\n';
          lp += 'Subject To\n';
          hasConstraints = false;
          Object.keys(resMap).forEach(function (res) {
            var terms = [];
            products.forEach(function (p, i) {
              var u = usageMap[res][p.producto_id] || 0;
              if (u > 0) {
                terms.push("".concat(u, " ").concat(varNames[i]));
              }
            });
            if (terms.length > 0) {
              var constraintName = resConstraintNames[res];
              lp += "".concat(constraintName, ": ").concat(terms.join(' + '), " <= ").concat(resMap[res], "\n");
              hasConstraints = true;
            }
          });
          if (hasConstraints) {
            _context.next = 56;
            break;
          }
          return _context.abrupt("return", {
            success: false,
            message: 'No se pudieron generar restricciones válidas.'
          });
        case 56:
          _context.next = 58;
          return pool.execute('SELECT producto_id, cantidad_maxima FROM demandas_maximas');
        case 58:
          _yield$pool$execute9 = _context.sent;
          _yield$pool$execute10 = (0, _slicedToArray2["default"])(_yield$pool$execute9, 1);
          demandas = _yield$pool$execute10[0];
          if (demandas.length > 0) {
            demandas.forEach(function (d) {
              var varInfo = varMap[d.producto_id];
              if (varInfo) {
                var demandName = "demanda_".concat(varInfo.varName);
                lp += "".concat(demandName, ": ").concat(varInfo.varName, " <= ").concat(d.cantidad_maxima, "\n");
              }
            });
          }
          lp += 'Bounds\n';
          varNames.forEach(function (v) {
            lp += "".concat(v, " >= 0\n");
          });
          lp += 'End\n';
          _context.next = 67;
          return highsInstance.solve(lp);
        case 67:
          results = _context.sent;
          if (!(results.Status === 'Optimal')) {
            _context.next = 78;
            break;
          }
          produccion = [];
          productosNoIncluidos = [];
          utilidadTotal = 0;
          products.forEach(function (p, i) {
            var _results$Columns$v;
            var v = varNames[i];
            var cantidad = ((_results$Columns$v = results.Columns[v]) === null || _results$Columns$v === void 0 ? void 0 : _results$Columns$v.Primal) || 0;
            if (cantidad > 0.01) {
              var info = varMap[p.producto_id];
              var utilidad = cantidad * info.coef;
              utilidadTotal += utilidad;
              produccion.push({
                producto_id: p.producto_id,
                nombre: info.nombre,
                cantidad_producir: Math.round(cantidad * 100) / 100,
                margen_unitario: Math.round(info.coef * 100) / 100,
                utilidad_total: Math.round(utilidad * 100) / 100
              });
            } else {
              productosNoIncluidos.push({
                producto_id: p.producto_id,
                nombre: p.nombre,
                margen_unitario: Math.round(parseFloat(p.margen_unitario) * 100) / 100
              });
            }
          });
          recursosUsados = [];
          Object.keys(resMap).forEach(function (res) {
            var _rowData;
            var constraintName = resConstraintNames[res];
            var rowData = null;
            if (results.Rows) {
              if ((0, _typeof2["default"])(results.Rows) === 'object' && !Array.isArray(results.Rows)) {
                rowData = results.Rows[constraintName];
              } else if (Array.isArray(results.Rows)) {
                rowData = results.Rows.find(function (r) {
                  return r.Name === constraintName;
                });
              }
            }
            var usado = 0;
            if (rowData && rowData.Primal !== undefined) {
              usado = rowData.Primal;
            } else {
              products.forEach(function (p) {
                var _results$Columns$varN;
                var varName = varMap[p.producto_id].varName;
                var cantidad = ((_results$Columns$varN = results.Columns[varName]) === null || _results$Columns$varN === void 0 ? void 0 : _results$Columns$varN.Primal) || 0;
                var consumo = usageMap[res][p.producto_id] || 0;
                usado += cantidad * consumo;
              });
            }
            var disponible = resMap[res];
            var holgura = disponible - usado;
            var precioSombra = ((_rowData = rowData) === null || _rowData === void 0 ? void 0 : _rowData.Dual) || 0;
            var porcentajeUso = usado / disponible * 100;
            recursosUsados.push({
              recurso: res,
              disponible: Math.round(disponible * 100) / 100,
              usado: Math.round(usado * 100) / 100,
              holgura: Math.round(holgura * 100) / 100,
              precio_sombra: Math.round(precioSombra * 100) / 100,
              porcentaje_uso: Math.round(porcentajeUso * 100) / 100,
              estado: holgura < 0.01 ? 'Saturado' : 'Con holgura'
            });
          });
          return _context.abrupt("return", {
            success: true,
            status: 'Optimal',
            utilidad_maxima: Math.round(utilidadTotal * 100) / 100,
            produccion: produccion.sort(function (a, b) {
              return b.utilidad_total - a.utilidad_total;
            }),
            productos_no_incluidos: productosNoIncluidos,
            recursos: recursosUsados,
            recomendaciones: generarRecomendaciones(recursosUsados, produccion, productosNoIncluidos),
            modelo_lp: lp,
            resumen: {
              total_productos: products.length,
              productos_a_producir: produccion.length,
              recursos_saturados: recursosUsados.filter(function (r) {
                return r.estado === 'Saturado';
              }).length,
              recursos_disponibles: recursosUsados.length
            }
          });
        case 78:
          return _context.abrupt("return", {
            success: false,
            status: results.Status,
            message: 'No se encontró una solución óptima.',
            modelo_lp: lp
          });
        case 79:
          _context.next = 85;
          break;
        case 81:
          _context.prev = 81;
          _context.t0 = _context["catch"](0);
          console.error('Error en optimización:', _context.t0);
          return _context.abrupt("return", {
            success: false,
            message: 'Error: ' + _context.t0.message
          });
        case 85:
        case "end":
          return _context.stop();
      }
    }, _callee, null, [[0, 81]]);
  }));
  return _optimizarProduccion.apply(this, arguments);
}
function generarRecomendaciones(recursos, produccion, productosNoIncluidos) {
  var recomendaciones = [];

  // 1. Identificar cuellos de botella
  var saturados = recursos.filter(function (r) {
    return r.estado === 'Saturado';
  });
  if (saturados.length > 0) {
    saturados.forEach(function (r) {
      recomendaciones.push({
        tipo: 'CUELLO_BOTELLA',
        prioridad: 'ALTA',
        recurso: r.recurso,
        mensaje: "El recurso ".concat(r.recurso, " est\xE1 al 100% de capacidad y limita la producci\xF3n."),
        accion: r.precio_sombra > 0 ? "Aumentar ".concat(r.recurso, " en 1 unidad generar\xEDa ").concat(r.precio_sombra.toFixed(2), " Bs adicionales de utilidad.") : "Optimizar el uso de ".concat(r.recurso, " para mejorar la eficiencia."),
        impacto_economico: r.precio_sombra
      });
    });
  }

  // 2. Recursos con alto valor marginal
  var valorables = recursos.filter(function (r) {
    return r.precio_sombra > 500 && r.estado === 'Saturado';
  });
  if (valorables.length > 0) {
    recomendaciones.push({
      tipo: 'INVERSION_PRIORITARIA',
      prioridad: 'ALTA',
      mensaje: 'Invertir en aumentar la capacidad de estos recursos generaría alto retorno:',
      recursos: valorables.map(function (r) {
        return {
          recurso: r.recurso,
          retorno_por_unidad: "".concat(r.precio_sombra.toFixed(2), " Bs"),
          capacidad_actual: r.disponible
        };
      })
    });
  }

  // 3. Recursos subutilizados
  var subutilizados = recursos.filter(function (r) {
    return r.porcentaje_uso < 50;
  });
  if (subutilizados.length > 0) {
    recomendaciones.push({
      tipo: 'CAPACIDAD_OCIOSA',
      prioridad: 'MEDIA',
      mensaje: 'Los siguientes recursos tienen capacidad ociosa significativa:',
      recursos: subutilizados.map(function (r) {
        return {
          recurso: r.recurso,
          uso: "".concat(r.porcentaje_uso.toFixed(1), "%"),
          capacidad_ociosa: r.holgura
        };
      }),
      accion: 'Considera reducir costos fijos o buscar productos que utilicen estos recursos.'
    });
  }

  // 4. Productos no incluidos con buen margen
  if (productosNoIncluidos.length > 0) {
    var buenMargen = productosNoIncluidos.filter(function (p) {
      return p.margen_unitario > 200;
    });
    if (buenMargen.length > 0) {
      recomendaciones.push({
        tipo: 'PRODUCTOS_ALTERNATIVOS',
        prioridad: 'MEDIA',
        mensaje: 'Estos productos tienen buen margen pero no entraron en la solución óptima:',
        productos: buenMargen.map(function (p) {
          return {
            nombre: p.nombre,
            margen: "".concat(p.margen_unitario, " Bs")
          };
        }),
        accion: 'Revisa si puedes ajustar las restricciones o producirlos en momentos de menor demanda.'
      });
    }
  }

  // 5. Concentración de producción
  if (produccion.length === 1) {
    recomendaciones.push({
      tipo: 'DIVERSIFICACION',
      prioridad: 'BAJA',
      mensaje: 'La producción óptima se concentra en un solo producto.',
      accion: 'Considera diversificar para reducir riesgo de mercado y dependencia de un producto.'
    });
  }
  return recomendaciones;
}
function analizarSensibilidad(_x, _x2) {
  return _analizarSensibilidad.apply(this, arguments);
}
function _analizarSensibilidad() {
  _analizarSensibilidad = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee2(recursoNombre, incremento) {
    var pool, _yield$pool$execute11, _yield$pool$execute12, original, valorOriginal, resultadoOriginal, nuevoValor, resultadoNuevo, diferenciaUtilidad, roi;
    return _regenerator["default"].wrap(function _callee2$(_context2) {
      while (1) switch (_context2.prev = _context2.next) {
        case 0:
          pool = (0, _database.connect)();
          _context2.prev = 1;
          _context2.next = 4;
          return pool.execute('SELECT cantidad_disponible FROM recursos_produccion WHERE nombre = ?', [recursoNombre]);
        case 4:
          _yield$pool$execute11 = _context2.sent;
          _yield$pool$execute12 = (0, _slicedToArray2["default"])(_yield$pool$execute11, 1);
          original = _yield$pool$execute12[0];
          if (!(original.length === 0)) {
            _context2.next = 9;
            break;
          }
          return _context2.abrupt("return", {
            success: false,
            message: 'Recurso no encontrado'
          });
        case 9:
          valorOriginal = parseFloat(original[0].cantidad_disponible); // Optimizar con valor original
          _context2.next = 12;
          return optimizarProduccion();
        case 12:
          resultadoOriginal = _context2.sent;
          if (resultadoOriginal.success) {
            _context2.next = 15;
            break;
          }
          return _context2.abrupt("return", resultadoOriginal);
        case 15:
          nuevoValor = valorOriginal + incremento; // Actualizar temporalmente
          _context2.next = 18;
          return pool.execute('UPDATE recursos_produccion SET cantidad_disponible = ? WHERE nombre = ?', [nuevoValor, recursoNombre]);
        case 18:
          _context2.next = 20;
          return optimizarProduccion();
        case 20:
          resultadoNuevo = _context2.sent;
          _context2.next = 23;
          return pool.execute('UPDATE recursos_produccion SET cantidad_disponible = ? WHERE nombre = ?', [valorOriginal, recursoNombre]);
        case 23:
          diferenciaUtilidad = resultadoNuevo.utilidad_maxima - resultadoOriginal.utilidad_maxima;
          roi = diferenciaUtilidad / Math.abs(incremento);
          return _context2.abrupt("return", {
            success: true,
            recurso: recursoNombre,
            valor_original: valorOriginal,
            valor_nuevo: nuevoValor,
            incremento: incremento,
            utilidad_original: resultadoOriginal.utilidad_maxima,
            utilidad_nueva: resultadoNuevo.utilidad_maxima,
            diferencia_utilidad: Math.round(diferenciaUtilidad * 100) / 100,
            roi_por_unidad: Math.round(roi * 100) / 100,
            recomendacion: diferenciaUtilidad > 0 ? "Aumentar ".concat(recursoNombre, " es rentable: cada unidad adicional genera ").concat(roi.toFixed(2), " Bs") : "Aumentar ".concat(recursoNombre, " no mejora la utilidad actualmente"),
            produccion_original: resultadoOriginal.produccion,
            produccion_nueva: resultadoNuevo.produccion
          });
        case 28:
          _context2.prev = 28;
          _context2.t0 = _context2["catch"](1);
          console.error('Error en análisis de sensibilidad:', _context2.t0);
          return _context2.abrupt("return", {
            success: false,
            message: _context2.t0.message
          });
        case 32:
        case "end":
          return _context2.stop();
      }
    }, _callee2, null, [[1, 28]]);
  }));
  return _analizarSensibilidad.apply(this, arguments);
}
function planificarProduccionPeriodo(_x3) {
  return _planificarProduccionPeriodo.apply(this, arguments);
}
function _planificarProduccionPeriodo() {
  _planificarProduccionPeriodo = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee3(dias) {
    var resultadoDiario;
    return _regenerator["default"].wrap(function _callee3$(_context3) {
      while (1) switch (_context3.prev = _context3.next) {
        case 0:
          _context3.next = 2;
          return optimizarProduccion();
        case 2:
          resultadoDiario = _context3.sent;
          if (resultadoDiario.success) {
            _context3.next = 5;
            break;
          }
          return _context3.abrupt("return", resultadoDiario);
        case 5:
          return _context3.abrupt("return", {
            success: true,
            periodo_dias: dias,
            utilidad_total_periodo: Math.round(resultadoDiario.utilidad_maxima * dias * 100) / 100,
            produccion_diaria: resultadoDiario.produccion,
            produccion_total_periodo: resultadoDiario.produccion.map(function (p) {
              return _objectSpread(_objectSpread({}, p), {}, {
                cantidad_total_periodo: Math.round(p.cantidad_producir * dias * 100) / 100,
                utilidad_total_periodo: Math.round(p.utilidad_total * dias * 100) / 100
              });
            }),
            recursos_necesarios_periodo: resultadoDiario.recursos.map(function (r) {
              return {
                recurso: r.recurso,
                necesario_por_dia: r.usado,
                necesario_total: Math.round(r.usado * dias * 100) / 100,
                disponible_por_dia: r.disponible,
                disponible_total: Math.round(r.disponible * dias * 100) / 100
              };
            }),
            resumen: {
              dias: dias,
              utilidad_diaria: resultadoDiario.utilidad_maxima,
              utilidad_total: Math.round(resultadoDiario.utilidad_maxima * dias * 100) / 100,
              productos_diferentes: resultadoDiario.produccion.length
            }
          });
        case 6:
        case "end":
          return _context3.stop();
      }
    }, _callee3);
  }));
  return _planificarProduccionPeriodo.apply(this, arguments);
}