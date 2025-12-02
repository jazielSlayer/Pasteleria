import { connect } from '../database';
import highs from 'highs';

/**
 * MÉTODO IMPLEMENTADO: Programación Lineal con Coeficientes de Ganancia
 * 
 * ECUACIÓN DEL MODELO:
 * 
 * Maximizar: Z = c₁·x₁ + c₂·x₂ + c₃·x₃ + ... + cₙ·xₙ
 * 
 * Donde:
 * - xᵢ = cantidad a producir del producto i
 * - cᵢ = coeficiente de ganancia del producto i (margen_unitario)
 * - cᵢ = precio_venta_i - (costo_materiales_i + costo_mano_obra_i + costo_energia_i)
 * 
 * Ejemplo para 3 productos:
 * Z = 40x₁ + 8x₂ + 2x₃
 * 
 * Sujeto a:
 * 1. Restricciones de recursos: Σ(uso_recurso_j_i · xᵢ) ≤ capacidad_j  ∀j∈Recursos
 * 2. Restricciones de demanda: xᵢ ≤ demanda_maxima_i  ∀i∈Productos
 * 3. No negatividad: xᵢ ≥ 0  ∀i∈Productos
 * 
 * TÉCNICA: Programación Lineal Simplex para maximizar la función objetivo
 * sujeta a restricciones lineales.
 */

async function optimizarGananciasYCostos() {
  try {
    const highsInstance = await highs();
    const pool = connect();

    // Obtener productos con sus coeficientes de ganancia (cᵢ)
    const [products] = await pool.execute(`
      SELECT 
        p.producto_id,
        p.nombre,
        p.precio_venta,
        COALESCE(
          SUM(rd.cantidad * mp.costo_promedio) / r.porciones_salida, 0
        ) as costo_materiales,
        COALESCE(r.costo_mano_obra / r.porciones_salida, 0) as costo_mano_obra,
        COALESCE(r.costo_energia / r.porciones_salida, 0) as costo_energia,
        p.precio_venta - (
          COALESCE(SUM(rd.cantidad * mp.costo_promedio) / r.porciones_salida, 0) +
          COALESCE(r.costo_mano_obra / r.porciones_salida, 0) +
          COALESCE(r.costo_energia / r.porciones_salida, 0)
        ) as coeficiente_ganancia
      FROM productos p
      LEFT JOIN recetas r ON p.producto_id = r.producto_id
      LEFT JOIN recetadetalle rd ON r.receta_id = rd.receta_id
      LEFT JOIN materiasprimas mp ON rd.materia_id = mp.materia_id
      WHERE p.activo = 1
      GROUP BY p.producto_id, r.porciones_salida, r.costo_mano_obra, r.costo_energia
      HAVING coeficiente_ganancia > 0
    `);

    if (products.length === 0) {
      return {
        success: false,
        message: 'No hay productos con coeficiente de ganancia positivo'
      };
    }

    // Obtener recursos disponibles
    const [resources] = await pool.execute(
      'SELECT nombre, cantidad_disponible FROM recursos_produccion WHERE cantidad_disponible > 0'
    );

    console.log(`\n🔍 DIAGNÓSTICO:`);
    console.log(`   - Productos encontrados: ${products.length}`);
    console.log(`   - Recursos disponibles: ${resources.length}`);

    // Obtener consumo de recursos por producto
    const [usages] = await pool.execute(
      'SELECT producto_id, recurso_nombre, cantidad_requerida FROM producto_recursos WHERE cantidad_requerida > 0'
    );

    console.log(`   - Registros de uso de recursos: ${usages.length}`);

    // Verificar qué productos tienen recursos asignados
    const productosConRecursos = new Set(usages.map(u => u.producto_id));
    const productosValidos = products.filter(p => productosConRecursos.has(p.producto_id));

    console.log(`   - Productos con recursos asignados: ${productosValidos.length}`);

    if (productosValidos.length === 0) {
      return {
        success: false,
        message: 'PROBLEMA: Ningún producto tiene recursos asignados en la tabla producto_recursos.',
        diagnostico: {
          productos_encontrados: products.length,
          productos_sin_recursos: products.map(p => p.nombre),
          solucion: 'Debes insertar datos en la tabla producto_recursos para asignar recursos a cada producto.'
        }
      };
    }

    // Usar solo productos que tienen recursos
    const productsToOptimize = productosValidos;

    // Obtener demandas máximas
    const [demandas] = await pool.execute(
      'SELECT producto_id, cantidad_maxima FROM demandas_maximas'
    );

    // Crear mapeo de productos con sus coeficientes
    const varMap = {};
    const varNames = [];
    
    productsToOptimize.forEach((p, index) => {
      const varName = `x${index + 1}`;
      const costoTotal = parseFloat(p.costo_materiales) + 
                        parseFloat(p.costo_mano_obra) + 
                        parseFloat(p.costo_energia);
      
      varMap[p.producto_id] = {
        varName,
        nombre: p.nombre,
        coeficiente: parseFloat(p.coeficiente_ganancia), // cᵢ en la ecuación
        costo_total: costoTotal,
        precio_venta: parseFloat(p.precio_venta),
        costo_materiales: parseFloat(p.costo_materiales),
        costo_mano_obra: parseFloat(p.costo_mano_obra),
        costo_energia: parseFloat(p.costo_energia),
        producto_id: p.producto_id
      };
      varNames.push(varName);
    });

    // Crear mapeo de recursos
    const resMap = {};
    resources.forEach(r => {
      resMap[r.nombre] = parseFloat(r.cantidad_disponible);
    });

    // Crear mapeo de uso de recursos
    const usageMap = {};
    Object.keys(resMap).forEach(res => {
      usageMap[res] = {};
    });
    usages.forEach(u => {
      if (usageMap[u.recurso_nombre] && varMap[u.producto_id]) {
        usageMap[u.recurso_nombre][u.producto_id] = parseFloat(u.cantidad_requerida);
      }
    });

    // Crear mapeo de demandas
    const demandaMap = {};
    demandas.forEach(d => {
      demandaMap[d.producto_id] = parseInt(d.cantidad_maxima);
    });

    // Construir modelo LP según la ecuación: Z = c₁·x₁ + c₂·x₂ + ... + cₙ·xₙ
    let lp = 'Maximize\n';

    // Función objetivo: Z = Σ(coeficiente_i · x_i)
    const objTerms = productsToOptimize.map((p, i) => {
      const info = varMap[p.producto_id];
      const coef = info.coeficiente; // cᵢ = margen unitario
      return `${coef.toFixed(2)} ${varNames[i]}`;
    });

    lp += 'obj: ' + objTerms.join(' + ') + '\n';
    
    // Mostrar ecuación explícita
    console.log('\n📊 ECUACIÓN DEL MODELO:');
    console.log('Maximizar: Z = ' + productsToOptimize.map((p, i) => {
      const coef = varMap[p.producto_id].coeficiente;
      return `${coef.toFixed(2)}·${varNames[i]}`;
    }).join(' + '));
    console.log('\nDonde:');
    productsToOptimize.forEach((p, i) => {
      const info = varMap[p.producto_id];
      console.log(`  ${varNames[i]} = ${info.nombre} (coeficiente: ${info.coeficiente.toFixed(2)} Bs/unidad)`);
    });
    
    lp += 'Subject To\n';

    // Restricciones de recursos
    let constraintsAdded = 0;
    Object.keys(resMap).forEach(res => {
      let terms = [];
      productsToOptimize.forEach((p, i) => {
        const usage = usageMap[res][p.producto_id] || 0;
        if (usage > 0) {
          terms.push(`${usage} ${varNames[i]}`);
        }
      });

      if (terms.length > 0) {
        const constraintName = res.replace(/\s+/g, '_');
        lp += `${constraintName}: ${terms.join(' + ')} <= ${resMap[res]}\n`;
        constraintsAdded++;
      }
    });

    console.log(`\n⚙️  Restricciones de recursos agregadas: ${constraintsAdded}`);

    // Si no hay restricciones de recursos, agregar restricciones generales
    if (constraintsAdded === 0) {
      console.log('⚠️  ADVERTENCIA: No hay restricciones de recursos. Agregando restricciones por defecto.');
      
      // Agregar restricción de producción total
      lp += `produccion_total: ${varNames.join(' + ')} <= 100\n`;
      
      // Agregar restricciones individuales por producto
      varNames.forEach((v, i) => {
        lp += `max_${v}: ${v} <= 20\n`;
      });
    }

    // Restricciones de demanda
    let demandasAdded = 0;
    productsToOptimize.forEach((p, i) => {
      if (demandaMap[p.producto_id]) {
        const varName = varNames[i];
        lp += `demanda_${varName}: ${varName} <= ${demandaMap[p.producto_id]}\n`;
        demandasAdded++;
      }
    });

    console.log(`   Restricciones de demanda agregadas: ${demandasAdded}`);

    // Restricciones de no negatividad
    lp += 'Bounds\n';
    varNames.forEach(v => {
      lp += `${v} >= 0\n`;
    });
    lp += 'End\n';

    console.log('\n🔧 Modelo LP generado. Resolviendo...\n');

    // Resolver
    const results = await highsInstance.solve(lp);

    console.log(`📈 Estado de la solución: ${results.Status}`);

    if (results.Status === 'Optimal') {
      const produccion = [];
      let gananciaTotal = 0; // Z óptimo
      let costoTotal = 0;
      let ingresoTotal = 0;

      productsToOptimize.forEach((p, i) => {
        const v = varNames[i];
        const cantidad = results.Columns[v]?.Primal || 0;
        
        if (cantidad > 0.01) {
          const info = varMap[p.producto_id];
          const ganancia = cantidad * info.coeficiente; // cᵢ · xᵢ
          const costo = cantidad * info.costo_total;
          const ingreso = cantidad * info.precio_venta;
          
          gananciaTotal += ganancia;
          costoTotal += costo;
          ingresoTotal += ingreso;

          produccion.push({
            producto_id: p.producto_id,
            variable: info.varName,
            nombre: info.nombre,
            cantidad_producir: Math.round(cantidad * 100) / 100,
            coeficiente_ci: Math.round(info.coeficiente * 100) / 100,
            precio_venta: Math.round(info.precio_venta * 100) / 100,
            costo_unitario: Math.round(info.costo_total * 100) / 100,
            ingreso_total: Math.round(ingreso * 100) / 100,
            costo_total: Math.round(costo * 100) / 100,
            ganancia_total: Math.round(ganancia * 100) / 100,
            contribucion_z: `${info.coeficiente.toFixed(2)} × ${cantidad.toFixed(2)} = ${ganancia.toFixed(2)} Bs`,
            detalle_costos: {
              materiales: Math.round(info.costo_materiales * cantidad * 100) / 100,
              mano_obra: Math.round(info.costo_mano_obra * cantidad * 100) / 100,
              energia: Math.round(info.costo_energia * cantidad * 100) / 100
            }
          });
        }
      });

      // Calcular recursos utilizados
      const recursosUsados = [];
      Object.keys(resMap).forEach(res => {
        let usado = 0;
        productsToOptimize.forEach(p => {
          const varName = varMap[p.producto_id].varName;
          const cantidad = results.Columns[varName]?.Primal || 0;
          const consumo = usageMap[res][p.producto_id] || 0;
          usado += cantidad * consumo;
        });

        const disponible = resMap[res];
        recursosUsados.push({
          recurso: res,
          disponible: Math.round(disponible * 100) / 100,
          usado: Math.round(usado * 100) / 100,
          holgura: Math.round((disponible - usado) * 100) / 100,
          porcentaje_uso: Math.round((usado / disponible) * 100 * 100) / 100
        });
      });

      // Construir ecuación con valores óptimos
      const ecuacionOptima = 'Z = ' + produccion.map(p => 
        `${p.coeficiente_ci}·${p.cantidad_producir}`
      ).join(' + ') + ` = ${gananciaTotal.toFixed(2)} Bs`;

      console.log(`\n✅ SOLUCIÓN ÓPTIMA ENCONTRADA`);
      console.log(`   Z* = ${gananciaTotal.toFixed(2)} Bs`);
      console.log(`   Productos a producir: ${produccion.length}\n`);

      return {
        success: true,
        metodo: 'Programación Lineal - Método Simplex',
        ecuacion: {
          forma_general: 'Z = c₁·x₁ + c₂·x₂ + c₃·x₃ + ... + cₙ·xₙ',
          modelo: 'Z = ' + productsToOptimize.map((p, i) => {
            const coef = varMap[p.producto_id].coeficiente;
            return `${coef.toFixed(2)}·${varNames[i]}`;
          }).join(' + '),
          solucion_optima: ecuacionOptima,
          restricciones: [
            'Σ(uso_recurso_j,i · xᵢ) ≤ capacidad_j  ∀j ∈ Recursos',
            'xᵢ ≤ demanda_maxima_i  ∀i ∈ Productos',
            'xᵢ ≥ 0  ∀i ∈ Productos'
          ]
        },
        valor_optimo_z: Math.round(gananciaTotal * 100) / 100,
        resultados_financieros: {
          ingreso_total: Math.round(ingresoTotal * 100) / 100,
          costo_total: Math.round(costoTotal * 100) / 100,
          ganancia_total: Math.round(gananciaTotal * 100) / 100,
          margen_porcentual: Math.round((gananciaTotal / ingresoTotal) * 100 * 100) / 100,
          roi: Math.round((gananciaTotal / costoTotal) * 100 * 100) / 100
        },
        produccion: produccion.sort((a, b) => b.ganancia_total - a.ganancia_total),
        recursos: recursosUsados,
        resumen: {
          productos_a_producir: produccion.length,
          total_productos_analizados: productsToOptimize.length,
          eficiencia_promedio: recursosUsados.length > 0 ? Math.round(
            (recursosUsados.reduce((sum, r) => sum + r.porcentaje_uso, 0) / recursosUsados.length) * 100
          ) / 100 : 0
        },
        modelo_lp: lp
      };
    } else {
      return {
        success: false,
        status: results.Status,
        message: 'No se encontró solución óptima. Revisa las restricciones del modelo.',
        diagnostico: {
          productos_analizados: productsToOptimize.length,
          restricciones_recursos: constraintsAdded,
          restricciones_demanda: demandasAdded,
          posibles_causas: [
            constraintsAdded === 0 ? 'No hay restricciones de recursos configuradas' : null,
            'Las restricciones pueden ser inconsistentes',
            'Verifica que la tabla producto_recursos tenga datos válidos'
          ].filter(Boolean)
        },
        modelo_lp: lp
      };
    }

  } catch (error) {
    console.error('❌ Error en optimización:', error);
    return {
      success: false,
      message: 'Error: ' + error.message,
      stack: error.stack
    };
  }
}

/**
 * Analizar el efecto de cambiar coeficientes de ganancia
 */
async function analizarSensibilidadCoeficientes() {
  const resultadoBase = await optimizarGananciasYCostos();
  
  if (!resultadoBase.success) {
    return resultadoBase;
  }

  return {
    success: true,
    analisis: 'Sensibilidad de coeficientes de ganancia',
    resultado_base: {
      z_optimo: resultadoBase.valor_optimo_z,
      ecuacion: resultadoBase.ecuacion.solucion_optima,
      productos: resultadoBase.produccion.map(p => ({
        nombre: p.nombre,
        coeficiente: p.coeficiente_ci,
        cantidad: p.cantidad_producir,
        contribucion: p.ganancia_total
      }))
    },
    interpretacion: {
      valor_z: `El valor óptimo Z = ${resultadoBase.valor_optimo_z} Bs representa la máxima ganancia posible`,
      productos_optimos: `Se deben producir ${resultadoBase.produccion.length} productos diferentes`,
      mejor_producto: resultadoBase.produccion[0] ? {
        nombre: resultadoBase.produccion[0].nombre,
        coeficiente: resultadoBase.produccion[0].coeficiente_ci,
        mensaje: `${resultadoBase.produccion[0].nombre} tiene el mayor coeficiente de ganancia`
      } : null
    }
  };
}




async function optimizarProduccion() {
  try {
    const highsInstance = await highs();
    const pool = connect();

    // Validar que existan datos en producto_recursos
    const [checkRecursos] = await pool.execute(
      'SELECT COUNT(*) as total FROM producto_recursos'
    );
    
    if (checkRecursos[0].total === 0) {
      return {
        success: false,
        message: 'No hay datos en la tabla producto_recursos. Debes configurar los recursos que consume cada producto.'
      };
    }

    const [allProducts] = await pool.execute(
      'SELECT producto_id, nombre, margen_unitario FROM vw_costo_productos WHERE margen_unitario > 0'
    );

    if (allProducts.length === 0) {
      return {
        success: false,
        message: 'No se encontraron productos con margen de utilidad positivo.'
      };
    }

    const [resources] = await pool.execute(
      'SELECT nombre, cantidad_disponible AS rhs FROM recursos_produccion WHERE cantidad_disponible > 0'
    );

    if (resources.length === 0) {
      return {
        success: false,
        message: 'No se encontraron recursos de producción configurados.'
      };
    }

    const [usages] = await pool.execute(
      'SELECT producto_id, recurso_nombre, cantidad_requerida FROM producto_recursos WHERE cantidad_requerida > 0'
    );

    if (usages.length === 0) {
      return {
        success: false,
        message: 'No hay productos con recursos asignados.'
      };
    }

    const productosConRecursos = new Set(usages.map(u => u.producto_id));
    const products = allProducts.filter(p => productosConRecursos.has(p.producto_id));

    if (products.length === 0) {
      return {
        success: false,
        message: 'Ninguno de los productos rentables tiene recursos asignados.'
      };
    }

    const varMap = {};
    const varNames = [];
    
    products.forEach((p, index) => {
      const varName = `x${index + 1}`;
      varMap[p.producto_id] = { 
        varName, 
        nombre: p.nombre, 
        coef: parseFloat(p.margen_unitario) || 0,
        producto_id: p.producto_id
      };
      varNames.push(varName);
    });

    const resMap = {};
    const resConstraintNames = {};
    resources.forEach(r => {
      resMap[r.nombre] = parseFloat(r.rhs);
      resConstraintNames[r.nombre] = r.nombre.replace(/\s+/g, '_');
    });

    const usageMap = {};
    Object.keys(resMap).forEach(res => {
      usageMap[res] = {};
    });

    usages.forEach(u => {
      if (usageMap[u.recurso_nombre] && varMap[u.producto_id]) {
        usageMap[u.recurso_nombre][u.producto_id] = parseFloat(u.cantidad_requerida);
      }
    });

    let lp = 'Maximize\n';

    const objTerms = products.map((p, i) => {
      const coef = varMap[p.producto_id].coef;
      if (coef > 0) return `${coef} ${varNames[i]}`;
      return null;
    }).filter(t => t);

    if (objTerms.length === 0) {
      return {
        success: false,
        message: 'No hay productos con margen positivo.'
      };
    }

    lp += 'obj: ' + objTerms.join(' + ') + '\n';
    lp += 'Subject To\n';

    let hasConstraints = false;
    Object.keys(resMap).forEach(res => {
      let terms = [];
      products.forEach((p, i) => {
        const u = usageMap[res][p.producto_id] || 0;
        if (u > 0) {
          terms.push(`${u} ${varNames[i]}`);
        }
      });

      if (terms.length > 0) {
        const constraintName = resConstraintNames[res];
        lp += `${constraintName}: ${terms.join(' + ')} <= ${resMap[res]}\n`;
        hasConstraints = true;
      }
    });

    if (!hasConstraints) {
      return {
        success: false,
        message: 'No se pudieron generar restricciones válidas.'
      };
    }

    const [demandas] = await pool.execute(
      'SELECT producto_id, cantidad_maxima FROM demandas_maximas'
    );

    if (demandas.length > 0) {
      demandas.forEach(d => {
        const varInfo = varMap[d.producto_id];
        if (varInfo) {
          const demandName = `demanda_${varInfo.varName}`;
          lp += `${demandName}: ${varInfo.varName} <= ${d.cantidad_maxima}\n`;
        }
      });
    }

    lp += 'Bounds\n';
    varNames.forEach(v => {
      lp += `${v} >= 0\n`;
    });
    lp += 'End\n';

    const results = await highsInstance.solve(lp);

    if (results.Status === 'Optimal') {
      const produccion = [];
      const productosNoIncluidos = [];
      let utilidadTotal = 0;

      products.forEach((p, i) => {
        const v = varNames[i];
        const cantidad = results.Columns[v]?.Primal || 0;
        
        if (cantidad > 0.01) {
          const info = varMap[p.producto_id];
          const utilidad = cantidad * info.coef;
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

      const recursosUsados = [];
      
      Object.keys(resMap).forEach(res => {
        const constraintName = resConstraintNames[res];
        
        let rowData = null;
        if (results.Rows) {
          if (typeof results.Rows === 'object' && !Array.isArray(results.Rows)) {
            rowData = results.Rows[constraintName];
          } else if (Array.isArray(results.Rows)) {
            rowData = results.Rows.find(r => r.Name === constraintName);
          }
        }

        let usado = 0;
        if (rowData && rowData.Primal !== undefined) {
          usado = rowData.Primal;
        } else {
          products.forEach(p => {
            const varName = varMap[p.producto_id].varName;
            const cantidad = results.Columns[varName]?.Primal || 0;
            const consumo = usageMap[res][p.producto_id] || 0;
            usado += cantidad * consumo;
          });
        }

        const disponible = resMap[res];
        const holgura = disponible - usado;
        const precioSombra = rowData?.Dual || 0;
        const porcentajeUso = (usado / disponible) * 100;

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

      return {
        success: true,
        status: 'Optimal',
        utilidad_maxima: Math.round(utilidadTotal * 100) / 100,
        produccion: produccion.sort((a, b) => b.utilidad_total - a.utilidad_total),
        productos_no_incluidos: productosNoIncluidos,
        recursos: recursosUsados,
        recomendaciones: generarRecomendaciones(recursosUsados, produccion, productosNoIncluidos),
        modelo_lp: lp,
        resumen: {
          total_productos: products.length,
          productos_a_producir: produccion.length,
          recursos_saturados: recursosUsados.filter(r => r.estado === 'Saturado').length,
          recursos_disponibles: recursosUsados.length
        }
      };
    } else {
      return {
        success: false,
        status: results.Status,
        message: 'No se encontró una solución óptima.',
        modelo_lp: lp
      };
    }

  } catch (error) {
    console.error('Error en optimización:', error);
    return {
      success: false,
      message: 'Error: ' + error.message
    };
  }
}


function generarRecomendaciones(recursos, produccion, productosNoIncluidos) {
  const recomendaciones = [];
  
  // 1. Identificar cuellos de botella
  const saturados = recursos.filter(r => r.estado === 'Saturado');
  if (saturados.length > 0) {
    saturados.forEach(r => {
      recomendaciones.push({
        tipo: 'CUELLO_BOTELLA',
        prioridad: 'ALTA',
        recurso: r.recurso,
        mensaje: `El recurso ${r.recurso} está al 100% de capacidad y limita la producción.`,
        accion: r.precio_sombra > 0 
          ? `Aumentar ${r.recurso} en 1 unidad generaría ${r.precio_sombra.toFixed(2)} Bs adicionales de utilidad.`
          : `Optimizar el uso de ${r.recurso} para mejorar la eficiencia.`,
        impacto_economico: r.precio_sombra
      });
    });
  }
  
  // 2. Recursos con alto valor marginal
  const valorables = recursos.filter(r => r.precio_sombra > 500 && r.estado === 'Saturado');
  if (valorables.length > 0) {
    recomendaciones.push({
      tipo: 'INVERSION_PRIORITARIA',
      prioridad: 'ALTA',
      mensaje: 'Invertir en aumentar la capacidad de estos recursos generaría alto retorno:',
      recursos: valorables.map(r => ({
        recurso: r.recurso,
        retorno_por_unidad: `${r.precio_sombra.toFixed(2)} Bs`,
        capacidad_actual: r.disponible
      }))
    });
  }
  
  // 3. Recursos subutilizados
  const subutilizados = recursos.filter(r => r.porcentaje_uso < 50);
  if (subutilizados.length > 0) {
    recomendaciones.push({
      tipo: 'CAPACIDAD_OCIOSA',
      prioridad: 'MEDIA',
      mensaje: 'Los siguientes recursos tienen capacidad ociosa significativa:',
      recursos: subutilizados.map(r => ({
        recurso: r.recurso,
        uso: `${r.porcentaje_uso.toFixed(1)}%`,
        capacidad_ociosa: r.holgura
      })),
      accion: 'Considera reducir costos fijos o buscar productos que utilicen estos recursos.'
    });
  }
  
  // 4. Productos no incluidos con buen margen
  if (productosNoIncluidos.length > 0) {
    const buenMargen = productosNoIncluidos.filter(p => p.margen_unitario > 200);
    if (buenMargen.length > 0) {
      recomendaciones.push({
        tipo: 'PRODUCTOS_ALTERNATIVOS',
        prioridad: 'MEDIA',
        mensaje: 'Estos productos tienen buen margen pero no entraron en la solución óptima:',
        productos: buenMargen.map(p => ({
          nombre: p.nombre,
          margen: `${p.margen_unitario} Bs`
        })),
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


async function analizarSensibilidad(recursoNombre, incremento) {
  const pool = connect();
  
  try {
    // Guardar valor original
    const [original] = await pool.execute(
      'SELECT cantidad_disponible FROM recursos_produccion WHERE nombre = ?',
      [recursoNombre]
    );
    
    if (original.length === 0) {
      return { success: false, message: 'Recurso no encontrado' };
    }
    
    const valorOriginal = parseFloat(original[0].cantidad_disponible);
    
    // Optimizar con valor original
    const resultadoOriginal = await optimizarProduccion();
    
    if (!resultadoOriginal.success) {
      return resultadoOriginal;
    }
    
    const nuevoValor = valorOriginal + incremento;
    
    // Actualizar temporalmente
    await pool.execute(
      'UPDATE recursos_produccion SET cantidad_disponible = ? WHERE nombre = ?',
      [nuevoValor, recursoNombre]
    );
    
    // Optimizar con el nuevo valor
    const resultadoNuevo = await optimizarProduccion();
    
    // Restaurar valor original
    await pool.execute(
      'UPDATE recursos_produccion SET cantidad_disponible = ? WHERE nombre = ?',
      [valorOriginal, recursoNombre]
    );
    
    const diferenciaUtilidad = resultadoNuevo.utilidad_maxima - resultadoOriginal.utilidad_maxima;
    const roi = diferenciaUtilidad / Math.abs(incremento);
    
    return {
      success: true,
      recurso: recursoNombre,
      valor_original: valorOriginal,
      valor_nuevo: nuevoValor,
      incremento: incremento,
      utilidad_original: resultadoOriginal.utilidad_maxima,
      utilidad_nueva: resultadoNuevo.utilidad_maxima,
      diferencia_utilidad: Math.round(diferenciaUtilidad * 100) / 100,
      roi_por_unidad: Math.round(roi * 100) / 100,
      recomendacion: diferenciaUtilidad > 0 
        ? `Aumentar ${recursoNombre} es rentable: cada unidad adicional genera ${roi.toFixed(2)} Bs`
        : `Aumentar ${recursoNombre} no mejora la utilidad actualmente`,
      produccion_original: resultadoOriginal.produccion,
      produccion_nueva: resultadoNuevo.produccion
    };
    
  } catch (error) {
    console.error('Error en análisis de sensibilidad:', error);
    return { success: false, message: error.message };
  }
}


async function planificarProduccionPeriodo(dias) {
  const resultadoDiario = await optimizarProduccion();
  
  if (!resultadoDiario.success) {
    return resultadoDiario;
  }
  
  return {
    success: true,
    periodo_dias: dias,
    utilidad_total_periodo: Math.round(resultadoDiario.utilidad_maxima * dias * 100) / 100,
    produccion_diaria: resultadoDiario.produccion,
    produccion_total_periodo: resultadoDiario.produccion.map(p => ({
      ...p,
      cantidad_total_periodo: Math.round(p.cantidad_producir * dias * 100) / 100,
      utilidad_total_periodo: Math.round(p.utilidad_total * dias * 100) / 100
    })),
    recursos_necesarios_periodo: resultadoDiario.recursos.map(r => ({
      recurso: r.recurso,
      necesario_por_dia: r.usado,
      necesario_total: Math.round(r.usado * dias * 100) / 100,
      disponible_por_dia: r.disponible,
      disponible_total: Math.round(r.disponible * dias * 100) / 100
    })),
    resumen: {
      dias: dias,
      utilidad_diaria: resultadoDiario.utilidad_maxima,
      utilidad_total: Math.round(resultadoDiario.utilidad_maxima * dias * 100) / 100,
      productos_diferentes: resultadoDiario.produccion.length
    }
  };
}




export { 
  optimizarProduccion, 
  analizarSensibilidad,
  planificarProduccionPeriodo,
  optimizarGananciasYCostos,
  analizarSensibilidadCoeficientes 
};