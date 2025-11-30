import express from 'express';
import { 
  optimizarProduccion, 
  analizarSensibilidad,
  planificarProduccionPeriodo 
} from '../controlers/ProduccionOptima.js';

const router = express.Router();

// ========================================
// OPTIMIZACIÓN DE PRODUCCIÓN
// ========================================

/**
 * GET /api/produccion/optimizar
 * Calcula el plan de producción óptimo que maximiza utilidad
 * Response: { success, utilidad_maxima, produccion[], recursos[], recomendaciones[] }
 */
router.get('/produccion/optimizar', async (req, res) => {
  try {
    const resultado = await optimizarProduccion();
    
    if (!resultado.success) {
      return res.status(400).json(resultado);
    }
    
    res.json(resultado);
  } catch (error) {
    console.error('Error en /optimizar:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor',
      error: error.message 
    });
  }
});

// ========================================
// ANÁLISIS DE SENSIBILIDAD
// ========================================

/**
 * POST /api/produccion/sensibilidad
 * Analiza el impacto de cambiar la cantidad de un recurso
 * Body: { recurso: string, incremento: number }
 * Response: { success, diferencia_utilidad, roi_por_unidad, ... }
 */
router.post('/produccion/sensibilidad', async (req, res) => {
  try {
    const { recurso, incremento } = req.body;
    
    // Validaciones
    if (!recurso || typeof recurso !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'El campo "recurso" es requerido y debe ser texto'
      });
    }
    
    if (incremento === undefined || incremento === null) {
      return res.status(400).json({
        success: false,
        message: 'El campo "incremento" es requerido'
      });
    }

    const incrementoNum = parseFloat(incremento);
    
    if (isNaN(incrementoNum)) {
      return res.status(400).json({
        success: false,
        message: 'El incremento debe ser un número válido'
      });
    }
    
    if (incrementoNum === 0) {
      return res.status(400).json({
        success: false,
        message: 'El incremento no puede ser cero'
      });
    }
    
    const resultado = await analizarSensibilidad(recurso.trim(), incrementoNum);
    
    if (!resultado.success) {
      return res.status(400).json(resultado);
    }
    
    res.json(resultado);
  } catch (error) {
    console.error('Error en /sensibilidad:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor',
      error: error.message 
    });
  }
});

// ========================================
// PLANIFICACIÓN POR PERÍODO
// ========================================

/**
 * GET /api/produccion/planificar/:dias
 * Calcula producción y recursos necesarios para un período de días
 * Params: dias (1-365)
 * Response: { success, periodo_dias, utilidad_total_periodo, produccion_total_periodo[], ... }
 */
router.get('/produccion/planificar/:dias', async (req, res) => {
  try {
    const dias = parseInt(req.params.dias);
    
    // Validaciones
    if (isNaN(dias)) {
      return res.status(400).json({
        success: false,
        message: 'El parámetro "dias" debe ser un número'
      });
    }
    
    if (dias < 1) {
      return res.status(400).json({
        success: false,
        message: 'El período debe ser al menos 1 día'
      });
    }
    
    if (dias > 365) {
      return res.status(400).json({
        success: false,
        message: 'El período no puede exceder 365 días'
      });
    }
    
    const resultado = await planificarProduccionPeriodo(dias);
    
    if (!resultado.success) {
      return res.status(400).json(resultado);
    }
    
    res.json(resultado);
  } catch (error) {
    console.error('Error en /planificar:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor',
      error: error.message 
    });
  }
});

// ========================================
// RUTA DE SALUD (Health Check)
// ========================================

/**
 * GET /api/produccion/health
 * Verifica que el servicio esté funcionando
 */
router.get('/health', (req, res) => {
  res.json({ 
    success: true, 
    service: 'Optimización de Producción',
    status: 'active',
    timestamp: new Date().toISOString()
  });
});

export default router;