// src/pages/MisPedidos.jsx

import React, { useState, useEffect } from 'react';
import './PlataformaCentral.css'; // Reutilizamos los mismos estilos

const MisPedidos = () => {
    const [pedidos, setPedidos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tenderoId, setTenderoId] = useState(1); // Hardcodeado por ahora

    const fetchMisPedidos = async () => {
        try {
            setLoading(true);
            const response = await fetch(`http://localhost:3001/api/pedidos/tendero/${tenderoId}`);
            if (!response.ok) throw new Error('Error al cargar mis pedidos');
            const data = await response.json();
            setPedidos(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMisPedidos();
    }, [tenderoId]); // Se ejecutará si tenderoId cambia

    const handleMarcarRecibido = async (pedidoId) => {
        if (!confirm('¿Estás seguro de que quieres marcar este pedido como recibido?')) return;
        
        try {
            const response = await fetch(`http://localhost:3001/api/pedidos/${pedidoId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ estado: 'recibido' })
            });
            if (!response.ok) throw new Error('No se pudo actualizar el estado');
            
            alert('¡Pedido marcado como recibido!');
            fetchMisPedidos(); // Recargamos la lista
        } catch (error) {
            alert(`Error: ${error.message}`);
        }
    };

    if (loading) return <div>Cargando mis pedidos...</div>;

    return (
        <div className="plataforma-container">
            <h1>Mis Pedidos (Tendero ID: {tenderoId})</h1>
            <div className="pedidos-list">
                {pedidos.map(pedido => (
                    <div key={pedido.id} className={`pedido-card estado-${pedido.estado}`}>
                        <div className="pedido-header">
                            <h3>Pedido #{pedido.id}</h3>
                            <span className="pedido-estado">{pedido.estado.replace('_', ' ')}</span>
                        </div>
                        <div className="pedido-body">
                            <p><strong>Fecha:</strong> {new Date(pedido.fecha).toLocaleString('es-CO')}</p>
                            <ul>
                                {pedido.productos.map((p, i) => <li key={i}>{p.nombre} - Cant: {p.cantidad}</li>)}
                            </ul>
                        </div>
                        <div className="pedido-actions">
                            {pedido.estado === 'despachado' && (
                                <button onClick={() => handleMarcarRecibido(pedido.id)} className="action-btn recibido">
                                    Marcar como Recibido
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MisPedidos;