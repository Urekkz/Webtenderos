// src/models/db.js

import mysql from 'mysql2/promise';
import 'dotenv/config'; // Para que lea las variables del archivo .env

// Creamos un pool de conexiones en lugar de una única conexión
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Pequeña función para probar la conexión al iniciar
async function testConnection() {
    try {
        await pool.query('SELECT 1');
        console.log('✅ Conexión a la base de datos exitosa.');
    } catch (error) {
        console.error('❌ Error al conectar con la base de datos:', error);
    }
}

testConnection();

export default pool;