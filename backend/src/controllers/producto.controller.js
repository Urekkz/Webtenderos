// src/controllers/producto.controller.js

import pool from '../models/db.js';

// Función para obtener todos los productos disponibles
export const obtenerProductos = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM productos ORDER BY nombre ASC');
        res.status(200).json(rows);
    } catch (error) {
        console.error('Error al obtener los productos:', error);
        res.status(500).json({ message: 'Error en el servidor al obtener los productos.' });
    }
};

export const crearProducto = async (req, res) => {
    const { nombre, precio } = req.body;
    if (!nombre || !precio) {
        return res.status(400).json({ message: 'Nombre y precio son obligatorios.' });
    }
    try {
        const query = 'INSERT INTO productos (nombre, precio) VALUES (?, ?)';
        const [result] = await pool.query(query, [nombre, precio]);
        res.status(201).json({ id: result.insertId, nombre, precio });
    } catch (error) {
        console.error('Error al crear producto:', error);
        res.status(500).json({ message: 'Error en el servidor.' });
    }
};

