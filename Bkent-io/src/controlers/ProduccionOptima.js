import { connect } from '../database';
import highs from 'highs';

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
  planificarProduccionPeriodo 
};