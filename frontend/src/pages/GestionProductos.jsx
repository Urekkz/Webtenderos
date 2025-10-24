// src/pages/GestionProductos.jsx
import React, { useState, useEffect } from 'react';
import './Registro.css'; // Reutilizamos el estilo del formulario de registro



const GestionProductos = () => {
    const [productos, setProductos] = useState([]);
    const [formData, setFormData] = useState({ nombre: '', precio: '' });

    const fetchProductos = async () => {
        const res = await fetch('http://localhost:3001/api/productos');
        const data = await res.json();
        setProductos(data);
    };

    useEffect(() => {
        fetchProductos();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:3001/api/productos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            if (!response.ok) throw new Error('Error al crear el producto');
            alert('¡Producto creado con éxito!');
            setFormData({ nombre: '', precio: '' }); // Limpiar formulario
            fetchProductos(); // Recargar la lista de productos
        } catch (error) {
            alert(`Error: ${error.message}`);
        }
    };

    return (
        <div className="registro-container">
            <h2>Gestión de Productos</h2>
            <form onSubmit={handleSubmit} className="registro-form">
                <h3>Añadir Nuevo Producto</h3>
                <div className="form-group">
                    <label htmlFor="nombre">Nombre del Producto</label>
                    <input type="text" id="nombre" name="nombre" value={formData.nombre} onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label htmlFor="precio">Precio</label>
                    <input type="number" id="precio" name="precio" value={formData.precio} onChange={handleChange} required step="0.01" />
                </div>
                <button type="submit" className="submit-btn">Añadir Producto</button>
            </form>

            <hr style={{ margin: '2rem 0' }} />

            <h3>Productos Existentes</h3>
            <ul>
                {productos.map(p => (
                    <li key={p.id}>{p.nombre} - ${Number(p.precio).toLocaleString('es-CO')}</li>
                ))}
            </ul>
        </div>
    );
};

export default GestionProductos;