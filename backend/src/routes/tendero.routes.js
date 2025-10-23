// src/routes/tendero.routes.js

import { Router } from 'express';
import { registrarTendero } from '../controllers/tendero.controller.js';

const router = Router();

// Definimos la ruta para el registro.
// Cuando llegue una petición POST a '/', se ejecutará la función registrarTendero
router.post('/', registrarTendero);

// Aquí podríamos añadir más rutas para los tenderos en el futuro
// router.get('/', obtenerTenderos);
// router.get('/:id', obtenerTenderoPorId);

export default router;