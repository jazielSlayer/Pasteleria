import express from 'express';
import { 
  optimizarProduccion, 
  analizarSensibilidad,
  planificarProduccionPeriodo 
} from '../controlers/ProduccionOptima.js';

const router = express.Router();

// Endpoint principal
router.get('/optimizar-produccion', async (req, res) => {
  try {
    const resultado = await optimizarProduccion();
    res.json(resultado);
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// Análisis de sensibilidad
router.post('/analisis-sensibilidad', async (req, res) => {
  try {
    const { recurso, incremento } = req.body;
    
    if (!recurso || incremento === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Se requieren los campos: recurso e incremento'
      });
    }
    
    const resultado = await analizarSensibilidad(recurso, parseFloat(incremento));
    res.json(resultado);
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// Planificación por periodo
router.get('/planificar-periodo/:dias', async (req, res) => {
  try {
    const dias = parseInt(req.params.dias);
    
    if (isNaN(dias) || dias < 1 || dias > 365) {
      return res.status(400).json({
        success: false,
        message: 'Los días deben ser un número entre 1 y 365'
      });
    }
    
    const resultado = await planificarProduccionPeriodo(dias);
    res.json(resultado);
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

export default router;