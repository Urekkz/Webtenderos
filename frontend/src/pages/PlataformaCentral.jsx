// src/pages/PlataformaCentral.jsx

import React, { useState, useEffect } from 'react';
import './PlataformaCentral.css';

const PlataformaCentral = () => {
    const [pedidos, setPedidos] = useState([]);
    const [loading, setLoading] = useState(true);

    // 1. Mantenemos la función para cargar los pedidos
    const fetchPedidos = async () => {
        try {
            setLoading(true);
            const response = await fetch('http://localhost:3001/api/pedidos');
            if (!response.ok) throw new Error('Error al cargar los pedidos');
            const data = await response.json();
            setPedidos(data);
        } catch (error) {
            console.error(error);
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPedidos();
    }, []);

    // 2. Implementamos la lógica de actualización
    const handleActualizarEstado = async (pedidoId, nuevoEstado) => {
        try {
            const response = await fetch(`http://localhost:3001/api/pedidos/${pedidoId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ estado: nuevoEstado })
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'No se pudo actualizar el estado');
            }

            alert(`Pedido #${pedidoId} actualizado a "${nuevoEstado.replace('_', ' ')}"`);
            
            // 3. Recargamos los pedidos para que la UI muestre el cambio
            fetchPedidos(); 

        } catch (error) {
            console.error('Error al actualizar estado:', error);
            alert(`Error: ${error.message}`);
        }
    };

    if (loading) {
        return <div>Cargando pedidos...</div>;
    }

    return (
        <div className="plataforma-container">
            <h1>Plataforma Central de Pedidos</h1>
            <div className="pedidos-list">
                {pedidos.length === 0 ? (
                    <p>No hay pedidos para mostrar.</p>
                ) : (
                    pedidos.map(pedido => (
                        <div key={pedido.id} className={`pedido-card estado-${pedido.estado}`}>
                            <div className="pedido-header">
                                <h3>Pedido #{pedido.id} - {pedido.tendero} ({pedido.zona})</h3>
                                <span className="pedido-estado">{pedido.estado.replace('_', ' ')}</span>
                            </div>
                            {/* ... (código del pedido-body sin cambios) ... */}
                            <div className="pedido-body">
                                <p><strong>Fecha:</strong> {new Date(pedido.fecha).toLocaleString('es-CO')}</p>
                                <h4>Productos:</h4>
                                <ul>
                                    {pedido.productos.map((p, index) => (
                                        <li key={index}>{p.nombre} - <strong>Cantidad: {p.cantidad}</strong></li>
                                    ))}
                                </ul>
                            </div>
                            <div className="pedido-actions">
                                {/* Ahora el botón llama a la nueva función con los parámetros correctos */}
                                {pedido.estado === 'pendiente' && (
                                    <button 
                                        onClick={() => handleActualizarEstado(pedido.id, 'en_consolidacion')} 
                                        className="action-btn consolidar"
                                    >
                                        Pasar a Consolidación
                                    </button>
                                )}
                                {/* Podríamos añadir más botones para otros estados aquí en el futuro */}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default PlataformaCentral;