import express from 'express';
import {
  obtenerRecursos,
  obtenerRecursoPorId,
  crearRecurso,
  actualizarRecurso,
  eliminarRecurso,
  obtenerEstadisticasRecursos
} from '../controlers/Recursos.js';

const router = express.Router();

// ========================================
// OBTENER TODOS LOS RECURSOS
// ========================================

/**
 * GET /api/recursos
 * Obtiene todos los recursos de producción
 * Response: { success, data[], total }
 */
router.get('/recursos', async (req, res) => {
  try {
    const resultado = await obtenerRecursos();
    
    if (!resultado.success) {
      return res.status(400).json(resultado);
    }
    
    res.json(resultado);
  } catch (error) {
    console.error('Error en GET /recursos:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
});

// ========================================
// OBTENER UN RECURSO POR ID
// ========================================

/**
 * GET /api/recursos/:id
 * Obtiene un recurso específico por su ID
 * Params: id (recurso_id)
 * Response: { success, data }
 */
router.get('/recursos/:id', async (req, res) => {
  try {
    const recurso_id = parseInt(req.params.id);
    
    if (isNaN(recurso_id)) {
      return res.status(400).json({
        success: false,
        message: 'El ID del recurso debe ser un número válido'
      });
    }
    
    const resultado = await obtenerRecursoPorId(recurso_id);
    
    if (!resultado.success) {
      return res.status(404).json(resultado);
    }
    
    res.json(resultado);
  } catch (error) {
    console.error('Error en GET /recursos/:id:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
});

// ========================================
// CREAR NUEVO RECURSO
// ========================================

/**
 * POST /api/recursos
 * Crea un nuevo recurso de producción
 * Body: { nombre, cantidad_disponible, unidad }
 * Response: { success, message, data }
 */
router.post('/recursos', async (req, res) => {
  try {
    const { nombre, cantidad_disponible, unidad } = req.body;
    
    const resultado = await crearRecurso({
      nombre,
      cantidad_disponible,
      unidad
    });
    
    if (!resultado.success) {
      return res.status(400).json(resultado);
    }
    
    res.status(201).json(resultado);
  } catch (error) {
    console.error('Error en POST /recursos:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
});

// ========================================
// ACTUALIZAR RECURSO
// ========================================

/**
 * PUT /api/recursos/:id
 * Actualiza un recurso existente
 * Params: id (recurso_id)
 * Body: { nombre?, cantidad_disponible?, unidad? }
 * Response: { success, message, data }
 */
router.put('/recursos/:id', async (req, res) => {
  try {
    const recurso_id = parseInt(req.params.id);
    
    if (isNaN(recurso_id)) {
      return res.status(400).json({
        success: false,
        message: 'El ID del recurso debe ser un número válido'
      });
    }
    
    const { nombre, cantidad_disponible, unidad } = req.body;
    
    const resultado = await actualizarRecurso(recurso_id, {
      nombre,
      cantidad_disponible,
      unidad
    });
    
    if (!resultado.success) {
      return res.status(400).json(resultado);
    }
    
    res.json(resultado);
  } catch (error) {
    console.error('Error en PUT /recursos/:id:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
});

// ========================================
// ACTUALIZACIÓN PARCIAL (PATCH)
// ========================================

/**
 * PATCH /api/recursos/:id
 * Actualiza parcialmente un recurso
 * Params: id (recurso_id)
 * Body: { campo a actualizar }
 * Response: { success, message, data }
 */
router.patch('/recursos/:id', async (req, res) => {
  try {
    const recurso_id = parseInt(req.params.id);
    
    if (isNaN(recurso_id)) {
      return res.status(400).json({
        success: false,
        message: 'El ID del recurso debe ser un número válido'
      });
    }
    
    const resultado = await actualizarRecurso(recurso_id, req.body);
    
    if (!resultado.success) {
      return res.status(400).json(resultado);
    }
    
    res.json(resultado);
  } catch (error) {
    console.error('Error en PATCH /recursos/:id:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
});

// ========================================
// ELIMINAR RECURSO
// ========================================

/**
 * DELETE /api/recursos/:id
 * Elimina un recurso de producción
 * Params: id (recurso_id)
 * Response: { success, message, data }
 */
router.delete('/recursos/:id', async (req, res) => {
  try {
    const recurso_id = parseInt(req.params.id);
    
    if (isNaN(recurso_id)) {
      return res.status(400).json({
        success: false,
        message: 'El ID del recurso debe ser un número válido'
      });
    }
    
    const resultado = await eliminarRecurso(recurso_id);
    
    if (!resultado.success) {
      return res.status(400).json(resultado);
    }
    
    res.json(resultado);
  } catch (error) {
    console.error('Error en DELETE /recursos/:id:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
});

// ========================================
// ESTADÍSTICAS DE RECURSOS
// ========================================

/**
 * GET /api/recursos/estadisticas/general
 * Obtiene estadísticas sobre el uso de recursos
 * Response: { success, data[], resumen }
 */
router.get('/recursos/estadisticas/general', async (req, res) => {
  try {
    const resultado = await obtenerEstadisticasRecursos();
    
    if (!resultado.success) {
      return res.status(400).json(resultado);
    }
    
    res.json(resultado);
  } catch (error) {
    console.error('Error en GET /recursos/estadisticas:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
});

// ========================================
// HEALTH CHECK
// ========================================

/**
 * GET /api/recursos/health
 * Verifica que el servicio esté funcionando
 */
router.get('/recursos/health', (req, res) => {
  res.json({
    success: true,
    service: 'CRUD Recursos de Producción',
    status: 'active',
    timestamp: new Date().toISOString()
  });
});

export default router;