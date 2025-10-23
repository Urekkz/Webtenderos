// src/controllers/pedido.controller.js

import pool from '../models/db.js';

// src/controllers/pedido.controller.js

export const crearPedido = async (req, res) => {
    const { tendero_id, productos } = req.body;

    if (!tendero_id || !productos || !Array.isArray(productos) || productos.length === 0) {
        return res.status(400).json({ message: 'Datos del pedido incompletos o incorrectos.' });
    }

    let connection;

    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();

        // --- NUEVA LÓGICA DE VALIDACIÓN ---
        // 1. Revisamos si el tendero ya tiene un pedido activo.
        // Un pedido activo es cualquiera que no esté 'recibido' o 'cancelado' (si tuviéramos ese estado).
        const [pedidosActivos] = await connection.query(
            "SELECT id FROM pedidos WHERE tendero_id = ? AND estado <> 'recibido'",
            [tendero_id]
        );

        // 2. Si se encuentra al menos un pedido activo, devolvemos un error.
        if (pedidosActivos.length > 0) {
            // El código de estado 409 Conflict es apropiado aquí.
            return res.status(409).json({ message: 'Ya tienes un pedido activo. No puedes crear uno nuevo hasta que el anterior sea completado.' });
        }
        // --- FIN DE LA NUEVA LÓGICA ---


        // 3. Si no hay pedidos activos, procedemos a crear el nuevo como antes.
        const pedidoQuery = 'INSERT INTO pedidos (tendero_id, estado) VALUES (?, ?)';
        const [pedidoResult] = await connection.query(pedidoQuery, [tendero_id, 'pendiente']);
        const nuevoPedidoId = pedidoResult.insertId;

        const productosQuery = 'INSERT INTO pedidos_productos (pedido_id, producto_id, cantidad) VALUES ?';
        const productosValues = productos.map(p => [nuevoPedidoId, p.producto_id, p.cantidad]);
        await connection.query(productosQuery, [productosValues]);

        await connection.commit();
        res.status(201).json({ message: 'Pedido creado con éxito!', pedidoId: nuevoPedidoId });

    } catch (error) {
        if (connection) await connection.rollback();
        console.error('Error al crear el pedido:', error);
        res.status(500).json({ message: 'Error en el servidor al crear el pedido.' });
    } finally {
        if (connection) connection.release();
    }
};



// Nueva función para obtener todos los pedidos
export const obtenerTodosLosPedidos = async (req, res) => {
    try {
        // Esta consulta compleja une 4 tablas para obtener toda la información que necesitamos.
        const query = `
            SELECT 
                p.id AS pedido_id,
                p.fecha_creacion,
                p.estado,
                t.nombre AS tendero_nombre,
                t.zona,
                pr.nombre AS producto_nombre,
                pp.cantidad
            FROM pedidos p
            JOIN tenderos t ON p.tendero_id = t.id
            JOIN pedidos_productos pp ON p.id = pp.pedido_id
            JOIN productos pr ON pp.producto_id = pr.id
            ORDER BY p.fecha_creacion DESC;
        `;

        const [rows] = await pool.query(query);

        // El resultado de la consulta es "plano", es decir, repite la información del pedido por cada producto.
        // Ejemplo:
        // { pedido_id: 1, tendero_nombre: 'Don Pepe', producto_nombre: 'Arroz', cantidad: 10 }
        // { pedido_id: 1, tendero_nombre: 'Don Pepe', producto_nombre: 'Panela', cantidad: 20 }
        // Necesitamos agruparlos para que sea más fácil de manejar en el frontend.

        const pedidosAgrupados = {};

        rows.forEach(row => {
            if (!pedidosAgrupados[row.pedido_id]) {
                pedidosAgrupados[row.pedido_id] = {
                    id: row.pedido_id,
                    fecha: row.fecha_creacion,
                    estado: row.estado,
                    tendero: row.tendero_nombre,
                    zona: row.zona,
                    productos: []
                };
            }
            pedidosAgrupados[row.pedido_id].productos.push({
                nombre: row.producto_nombre,
                cantidad: row.cantidad
            });
        });

        // Convertimos el objeto de pedidos agrupados en un array
        const resultadoFinal = Object.values(pedidosAgrupados);

        res.status(200).json(resultadoFinal);

    } catch (error) {
        console.error('Error al obtener los pedidos:', error);
        res.status(500).json({ message: 'Error en el servidor al obtener los pedidos.' });
    }
};

// Nueva función para obtener pedidos por tendero
export const obtenerPedidosPorTendero = async (req, res) => {
    const { tenderoId } = req.params;

    try {
        // La consulta es casi idéntica a la de obtenerTodosLosPedidos, pero con un WHERE
        const query = `
            SELECT 
                p.id AS pedido_id, p.fecha_creacion, p.estado,
                pr.nombre AS producto_nombre, pp.cantidad
            FROM pedidos p
            JOIN pedidos_productos pp ON p.id = pp.pedido_id
            JOIN productos pr ON pp.producto_id = pr.id
            WHERE p.tendero_id = ?
            ORDER BY p.fecha_creacion DESC;
        `;
        const [rows] = await pool.query(query, [tenderoId]);

        // Reutilizamos la misma lógica de agrupación que ya creamos
        const pedidosAgrupados = {};
        rows.forEach(row => {
            if (!pedidosAgrupados[row.pedido_id]) {
                pedidosAgrupados[row.pedido_id] = {
                    id: row.pedido_id,
                    fecha: row.fecha_creacion,
                    estado: row.estado,
                    productos: []
                };
            }
            pedidosAgrupados[row.pedido_id].productos.push({
                nombre: row.producto_nombre,
                cantidad: row.cantidad
            });
        });

        res.status(200).json(Object.values(pedidosAgrupados));

    } catch (error) {
        console.error('Error al obtener los pedidos del tendero:', error);
        res.status(500).json({ message: 'Error en el servidor.' });
    }
};

export const obtenerProductosConsolidados = async (req, res) => {
    try {
        // Esta consulta suma las cantidades de cada producto
        // agrupándolas por producto, solo para pedidos 'en_consolidacion'.
        const query = `
            SELECT
                pr.id AS producto_id,
                pr.nombre AS producto_nombre,
                SUM(pp.cantidad) AS cantidad_total
            FROM pedidos_productos pp
            JOIN productos pr ON pp.producto_id = pr.id
            JOIN pedidos p ON pp.pedido_id = p.id
            WHERE p.estado = 'en_consolidacion'
            GROUP BY pr.id, pr.nombre;
        `;
        const [rows] = await pool.query(query);
        res.status(200).json(rows);
    } catch (error) {
        console.error('Error al obtener productos consolidados:', error);
        res.status(500).json({ message: 'Error en el servidor.' });
    }
};

// Función para actualizar el estado de MÚLTIPLES pedidos a la vez
export const actualizarEstadoLote = async (req, res) => {
    const { nuevoEstado, estadoAnterior } = req.body;
    if (!nuevoEstado || !estadoAnterior) {
        return res.status(400).json({ message: 'Se requiere un estado anterior y uno nuevo.' });
    }
    try {
        // Actualizamos todos los pedidos que estaban en el estado anterior
        const query = 'UPDATE pedidos SET estado = ? WHERE estado = ?';
        const [result] = await pool.query(query, [nuevoEstado, estadoAnterior]);

        res.status(200).json({ 
            message: `Se actualizaron ${result.affectedRows} pedidos a ${nuevoEstado}.`
        });
    } catch (error) {
        console.error('Error en actualización por lote:', error);
        res.status(500).json({ message: 'Error en el servidor.' });
    }
};

// Nueva función para actualizar el estado de un pedido
export const actualizarEstadoPedido = async (req, res) => {
    // Obtenemos el ID del pedido de los parámetros de la URL (ej: /api/pedidos/5/estado)
    const { id } = req.params; 
    // Obtenemos el nuevo estado del cuerpo de la petición
    const { estado } = req.body;

    // Validación básica
    if (!estado) {
        return res.status(400).json({ message: 'El nuevo estado es obligatorio.' });
    }

    try {
        const query = 'UPDATE pedidos SET estado = ? WHERE id = ?';
        const [result] = await pool.query(query, [estado, id]);

        // Verificamos si la consulta realmente afectó alguna fila.
        // Si result.affectedRows es 0, significa que no se encontró un pedido con ese ID.
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Pedido no encontrado.' });
        }

        res.status(200).json({ message: 'Estado del pedido actualizado con éxito.' });

    } catch (error) {
        console.error('Error al actualizar el estado del pedido:', error);
        res.status(500).json({ message: 'Error en el servidor al actualizar el estado.' });
    }
};




