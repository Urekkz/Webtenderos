// src/routes/pedido.routes.js

import { Router } from 'express';
// Importamos la nueva función del controlador
import { 
    crearPedido, 
    obtenerTodosLosPedidos, 
    actualizarEstadoPedido,
    obtenerPedidosPorTendero,        
    obtenerProductosConsolidados,    
    actualizarEstadoLote         
} from '../controllers/pedido.controller.js';

const router = Router();

// ... (rutas POST y GET existentes) ...
router.post('/', crearPedido);
router.get('/', obtenerTodosLosPedidos);

// GET /api/pedidos/tendero/:tenderoId - Nueva ruta
router.get('/tendero/:tenderoId', obtenerPedidosPorTendero);

router.get('/consolidados', obtenerProductosConsolidados);

router.post('/actualizar-lote', actualizarEstadoLote);

// PATCH /api/pedidos/:id - para actualizar un pedido (en este caso, su estado)
router.patch('/:id', actualizarEstadoPedido); // <-- NUEVA LÍNEA


export default router;