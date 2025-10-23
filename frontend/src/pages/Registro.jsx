// src/pages/Registro.jsx

import React, { useState } from 'react';
import './Registro.css'; // Crearemos este archivo para los estilos

const Registro = () => {
    // Usamos el hook useState para crear un estado para nuestro formulario.
    // formData es un objeto que contendrá los valores de los inputs.
    // setFormData es la función que usamos para actualizar el estado.
    const [formData, setFormData] = useState({
        nombre: '',
        zona: '',
        contacto: '',
        password: ''
    });

    // Esta función se ejecuta cada vez que el usuario escribe en un input.
    const handleChange = (e) => {
        // Actualizamos el estado. Usamos el 'name' del input para saber qué campo cambiar.
        setFormData({
            ...formData, // Mantenemos los valores que ya estaban en el formulario
            [e.target.name]: e.target.value // Actualizamos el campo que cambió
        });
    };

    // Esta función se ejecuta cuando el usuario envía el formulario.
    const handleSubmit = async (e) => {
        e.preventDefault(); // Prevenimos que la página se recargue, que es el comportamiento por defecto.
        
        console.log('Enviando datos:', formData); // Un log para ver qué estamos enviando.

        try {
            // Hacemos la petición POST a nuestro backend usando fetch.
            const response = await fetch('http://localhost:3001/api/tenderos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json' // Le decimos al backend que estamos enviando JSON
                },
                body: JSON.stringify(formData) // Convertimos nuestro objeto de JS a una cadena de texto JSON
            });

            const data = await response.json(); // Leemos la respuesta del backend

            if (!response.ok) {
                // Si el backend respondió con un error (ej: status 400, 500)
                throw new Error(data.message || 'Algo salió mal');
            }

            // Si todo salió bien
            alert('¡Tendero registrado con éxito!');
            // Aquí podríamos limpiar el formulario o redirigir al usuario
            setFormData({ nombre: '', zona: '', contacto: '', password: '' });

        } catch (error) {
            // Si hubo un error en la comunicación o en el backend
            console.error('Error en el registro:', error);
            alert(`Error: ${error.message}`);
        }
    };

    return (
        <div className="registro-container">
            <h2>Registro de Nuevo Tendero</h2>
            <form onSubmit={handleSubmit} className="registro-form">
                <div className="form-group">
                    <label htmlFor="nombre">Nombre de la tienda</label>
                    <input
                        type="text"
                        id="nombre"
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="zona">Zona</label>
                    <input
                        type="text"
                        id="zona"
                        name="zona"
                        value={formData.zona}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="contacto">Contacto (Email o teléfono)</label>
                    <input
                        type="text"
                        id="contacto"
                        name="contacto"
                        value={formData.contacto}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="password">Contraseña</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                </div>
                <button type="submit" className="submit-btn">Registrar</button>
            </form>
        </div>
    );
};

export default Registro;