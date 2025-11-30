import { connect } from '../database.js';

// ========================================
// OBTENER TODOS LOS RECURSOS
// ========================================
async function obtenerRecursos() {
  const pool = connect();
  
  try {
    const [recursos] = await pool.execute(
      'SELECT * FROM recursos_produccion ORDER BY nombre'
    );
    
    return {
      success: true,
      data: recursos,
      total: recursos.length
    };
  } catch (error) {
    console.error('Error al obtener recursos:', error);
    return {
      success: false,
      message: 'Error al obtener los recursos',
      error: error.message
    };
  }
}

// ========================================
// OBTENER UN RECURSO POR ID
// ========================================
async function obtenerRecursoPorId(recurso_id) {
  const pool = connect();
  
  try {
    const [recursos] = await pool.execute(
      'SELECT * FROM recursos_produccion WHERE recurso_id = ?',
      [recurso_id]
    );
    
    if (recursos.length === 0) {
      return {
        success: false,
        message: 'Recurso no encontrado'
      };
    }
    
    return {
      success: true,
      data: recursos[0]
    };
  } catch (error) {
    console.error('Error al obtener recurso:', error);
    return {
      success: false,
      message: 'Error al obtener el recurso',
      error: error.message
    };
  }
}

// ========================================
// CREAR NUEVO RECURSO
// ========================================
async function crearRecurso(datos) {
  const pool = connect();
  
  try {
    // Validaciones
    if (!datos.nombre || datos.nombre.trim() === '') {
      return {
        success: false,
        message: 'El nombre del recurso es obligatorio'
      };
    }
    
    if (datos.cantidad_disponible === undefined || datos.cantidad_disponible === null) {
      return {
        success: false,
        message: 'La cantidad disponible es obligatoria'
      };
    }
    
    if (!datos.unidad || datos.unidad.trim() === '') {
      return {
        success: false,
        message: 'La unidad es obligatoria'
      };
    }
    
    const cantidadNum = parseFloat(datos.cantidad_disponible);
    
    if (isNaN(cantidadNum) || cantidadNum < 0) {
      return {
        success: false,
        message: 'La cantidad disponible debe ser un número mayor o igual a 0'
      };
    }
    
    // Verificar si ya existe un recurso con el mismo nombre
    const [existente] = await pool.execute(
      'SELECT recurso_id FROM recursos_produccion WHERE nombre = ?',
      [datos.nombre.trim().toUpperCase()]
    );
    
    if (existente.length > 0) {
      return {
        success: false,
        message: 'Ya existe un recurso con ese nombre'
      };
    }
    
    // Insertar el nuevo recurso
    const [resultado] = await pool.execute(
      'INSERT INTO recursos_produccion (nombre, cantidad_disponible, unidad) VALUES (?, ?, ?)',
      [
        datos.nombre.trim().toUpperCase(),
        cantidadNum,
        datos.unidad.trim()
      ]
    );
    
    return {
      success: true,
      message: 'Recurso creado exitosamente',
      data: {
        recurso_id: resultado.insertId,
        nombre: datos.nombre.trim().toUpperCase(),
        cantidad_disponible: cantidadNum,
        unidad: datos.unidad.trim()
      }
    };
  } catch (error) {
    console.error('Error al crear recurso:', error);
    return {
      success: false,
      message: 'Error al crear el recurso',
      error: error.message
    };
  }
}

// ========================================
// ACTUALIZAR RECURSO
// ========================================
async function actualizarRecurso(recurso_id, datos) {
  const pool = connect();
  
  try {
    // Verificar que el recurso existe
    const [existente] = await pool.execute(
      'SELECT * FROM recursos_produccion WHERE recurso_id = ?',
      [recurso_id]
    );
    
    if (existente.length === 0) {
      return {
        success: false,
        message: 'Recurso no encontrado'
      };
    }
    
    // Construir la consulta de actualización dinámicamente
    const campos = [];
    const valores = [];
    
    if (datos.nombre && datos.nombre.trim() !== '') {
      // Verificar que no exista otro recurso con el mismo nombre
      const [duplicado] = await pool.execute(
        'SELECT recurso_id FROM recursos_produccion WHERE nombre = ? AND recurso_id != ?',
        [datos.nombre.trim().toUpperCase(), recurso_id]
      );
      
      if (duplicado.length > 0) {
        return {
          success: false,
          message: 'Ya existe otro recurso con ese nombre'
        };
      }
      
      campos.push('nombre = ?');
      valores.push(datos.nombre.trim().toUpperCase());
    }
    
    if (datos.cantidad_disponible !== undefined && datos.cantidad_disponible !== null) {
      const cantidadNum = parseFloat(datos.cantidad_disponible);
      
      if (isNaN(cantidadNum) || cantidadNum < 0) {
        return {
          success: false,
          message: 'La cantidad disponible debe ser un número mayor o igual a 0'
        };
      }
      
      campos.push('cantidad_disponible = ?');
      valores.push(cantidadNum);
    }
    
    if (datos.unidad && datos.unidad.trim() !== '') {
      campos.push('unidad = ?');
      valores.push(datos.unidad.trim());
    }
    
    if (campos.length === 0) {
      return {
        success: false,
        message: 'No se proporcionaron datos para actualizar'
      };
    }
    
    valores.push(recurso_id);
    
    await pool.execute(
      `UPDATE recursos_produccion SET ${campos.join(', ')} WHERE recurso_id = ?`,
      valores
    );
    
    // Obtener el recurso actualizado
    const [actualizado] = await pool.execute(
      'SELECT * FROM recursos_produccion WHERE recurso_id = ?',
      [recurso_id]
    );
    
    return {
      success: true,
      message: 'Recurso actualizado exitosamente',
      data: actualizado[0]
    };
  } catch (error) {
    console.error('Error al actualizar recurso:', error);
    return {
      success: false,
      message: 'Error al actualizar el recurso',
      error: error.message
    };
  }
}

// ========================================
// ELIMINAR RECURSO
// ========================================
async function eliminarRecurso(recurso_id) {
  const pool = connect();
  
  try {
    // Verificar que el recurso existe
    const [existente] = await pool.execute(
      'SELECT * FROM recursos_produccion WHERE recurso_id = ?',
      [recurso_id]
    );
    
    if (existente.length === 0) {
      return {
        success: false,
        message: 'Recurso no encontrado'
      };
    }
    
    // Verificar si el recurso está siendo usado en producto_recursos
    const [enUso] = await pool.execute(
      'SELECT COUNT(*) as total FROM producto_recursos WHERE recurso_nombre = ?',
      [existente[0].nombre]
    );
    
    if (enUso[0].total > 0) {
      return {
        success: false,
        message: `No se puede eliminar el recurso porque está siendo usado por ${enUso[0].total} producto(s)`,
        productos_afectados: enUso[0].total
      };
    }
    
    await pool.execute(
      'DELETE FROM recursos_produccion WHERE recurso_id = ?',
      [recurso_id]
    );
    
    return {
      success: true,
      message: 'Recurso eliminado exitosamente',
      data: existente[0]
    };
  } catch (error) {
    console.error('Error al eliminar recurso:', error);
    return {
      success: false,
      message: 'Error al eliminar el recurso',
      error: error.message
    };
  }
}

// ========================================
// OBTENER ESTADÍSTICAS DE RECURSOS
// ========================================
async function obtenerEstadisticasRecursos() {
  const pool = connect();
  
  try {
    const [stats] = await pool.execute(`
      SELECT 
        r.recurso_id,
        r.nombre,
        r.cantidad_disponible,
        r.unidad,
        COUNT(pr.producto_id) as productos_usando,
        COALESCE(SUM(pr.cantidad_requerida), 0) as consumo_total_productos
      FROM recursos_produccion r
      LEFT JOIN producto_recursos pr ON r.nombre = pr.recurso_nombre
      GROUP BY r.recurso_id
      ORDER BY productos_usando DESC, r.nombre
    `);
    
    return {
      success: true,
      data: stats,
      resumen: {
        total_recursos: stats.length,
        recursos_en_uso: stats.filter(r => r.productos_usando > 0).length,
        recursos_sin_usar: stats.filter(r => r.productos_usando === 0).length
      }
    };
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    return {
      success: false,
      message: 'Error al obtener estadísticas',
      error: error.message
    };
  }
}

export {
  obtenerRecursos,
  obtenerRecursoPorId,
  crearRecurso,
  actualizarRecurso,
  eliminarRecurso,
  obtenerEstadisticasRecursos
};