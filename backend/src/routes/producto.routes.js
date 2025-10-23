// src/routes/producto.routes.js
import { Router } from 'express';
// ¡No olvides importar la nueva función!
import { obtenerProductos, crearProducto } from '../controllers/producto.controller.js';

const router = Router();

router.get('/', obtenerProductos);
router.post('/', crearProducto); // <-- NUEVA LÍNEA

export default router;