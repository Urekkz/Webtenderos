// src/controllers/pedido.controller.js

import pool from '../models/db.js';

// --------------------------- CREAR PEDIDO ---------------------------
export const crearPedido = async (req, res) => {
    const { tendero_id, productos } = req.body;

    if (!tendero_id || !productos || !Array.isArray(productos) || productos.length === 0) {
        return res.status(400).json({ message: 'Datos del pedido incompletos o incorrectos.' });
    }

    let connection;

    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();

        // --- VALIDACIÓN: un pedido activo por tendero ---
        const [pedidosActivos] = await connection.query(
            "SELECT id FROM pedidos WHERE tendero_id = ? AND estado <> 'recibido'",
            [tendero_id]
        );

        if (pedidosActivos.length > 0) {
            return res.status(409).json({
                message: 'Ya tienes un pedido activo. No puedes crear uno nuevo hasta que el anterior sea completado.'
            });
        }

        // --- CREAR NUEVO PEDIDO ---
        const pedidoQuery = 'INSERT INTO pedidos (tendero_id, estado, fecha_creacion) VALUES (?, ?, NOW())';
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


// --------------------------- OBTENER TODOS LOS PEDIDOS ---------------------------
export const obtenerTodosLosPedidos = async (req, res) => {
    try {
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

        // --- LÓGICA DE 72 HORAS ---
        const ahora = new Date();

        for (const pedido of Object.values(pedidosAgrupados)) {
            const fechaCreacion = new Date(pedido.fecha);
            const horasTranscurridas = (ahora - fechaCreacion) / (1000 * 60 * 60);

            if (pedido.estado === 'pendiente' && horasTranscurridas > 72) {
                pedido.estado = 'vencido';
                try {
                    await pool.query('UPDATE pedidos SET estado = ? WHERE id = ?', ['vencido', pedido.id]);
                } catch (updateErr) {
                    console.error(`Error actualizando estado del pedido ${pedido.id}:`, updateErr);
                }
            }
        }
        // --- FIN LÓGICA 72 HORAS ---

        const resultadoFinal = Object.values(pedidosAgrupados);
        res.status(200).json(resultadoFinal);

    } catch (error) {
        console.error('Error al obtener los pedidos:', error);
        res.status(500).json({ message: 'Error en el servidor al obtener los pedidos.' });
    }
};


// --------------------------- OBTENER PEDIDOS POR TENDERO ---------------------------
export const obtenerPedidosPorTendero = async (req, res) => {
    const { tenderoId } = req.params;

    try {
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


// --------------------------- PRODUCTOS CONSOLIDADOS ---------------------------
export const obtenerProductosConsolidados = async (req, res) => {
    try {
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


// --------------------------- ACTUALIZAR ESTADO POR LOTE ---------------------------
export const actualizarEstadoLote = async (req, res) => {
    const { nuevoEstado, estadoAnterior } = req.body;
    if (!nuevoEstado || !estadoAnterior) {
        return res.status(400).json({ message: 'Se requiere un estado anterior y uno nuevo.' });
    }
    try {
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


// --------------------------- ACTUALIZAR ESTADO INDIVIDUAL ---------------------------
export const actualizarEstadoPedido = async (req, res) => {
    const { id } = req.params;
    const { estado } = req.body;

    if (!estado) {
        return res.status(400).json({ message: 'El nuevo estado es obligatorio.' });
    }

    try {
        const query = 'UPDATE pedidos SET estado = ? WHERE id = ?';
        const [result] = await pool.query(query, [estado, id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Pedido no encontrado.' });
        }

        res.status(200).json({ message: 'Estado del pedido actualizado con éxito.' });

    } catch (error) {
        console.error('Error al actualizar el estado del pedido:', error);
        res.status(500).json({ message: 'Error en el servidor al actualizar el estado.' });
    }
};
