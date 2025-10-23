// src/controllers/tendero.controller.js

import pool from '../models/db.js'; // Importamos nuestra conexión a la BD

// Función para registrar un nuevo tendero
export const registrarTendero = async (req, res) => {
    // Extraemos los datos del cuerpo de la petición
    const { nombre, zona, contacto, password } = req.body;

    // Verificación básica de que todos los campos necesarios están presentes
    if (!nombre || !zona || !contacto || !password) {
        return res.status(400).json({ message: 'Todos los campos son obligatorios.' });
    }

    try {
        // Creamos la consulta SQL para insertar el nuevo tendero
        const query = 'INSERT INTO tenderos (nombre, zona, contacto, password) VALUES (?, ?, ?, ?)';
        
        // Por ahora guardaremos la contraseña como texto plano.
        // En un proyecto real, ¡SIEMPRE se debe "hashear" la contraseña antes de guardarla!
        const [result] = await pool.query(query, [nombre, zona, contacto, password]);

        // Enviamos una respuesta exitosa
        res.status(201).json({
            message: 'Tendero registrado con éxito!',
            id: result.insertId,
            nombre,
            zona
        });

    } catch (error) {
        console.error('Error al registrar el tendero:', error);
        res.status(500).json({ message: 'Error en el servidor al intentar registrar el tendero.' });
    }
};
