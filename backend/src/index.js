// src/index.js

import express from 'express';
import cors from 'cors';
import './models/db.js';

// Importamos nuestras rutas
import tenderoRoutes from './routes/tendero.routes.js';
import productoRoutes from './routes/producto.routes.js'; 
import pedidoRoutes from './routes/pedido.routes.js';
const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json());

// Ruta de prueba
app.get('/', (req, res) => {
    res.send('¡Hola! El servidor está funcionando correctamente.');
});

// Usamos las rutas
app.use('/api/tenderos', tenderoRoutes);
app.use('/api/productos', productoRoutes); 
app.use('/api/pedidos', pedidoRoutes);

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
});