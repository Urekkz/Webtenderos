// src/pages/Consolidacion.jsx

import React, { useState, useEffect } from 'react';
import './CrearPedido.css'; // Reutilizamos estilos

const Consolidacion = () => {
    const [productos, setProductos] = useState([]);

    const fetchConsolidados = async () => {
        const res = await fetch('http://localhost:3001/api/pedidos/consolidados');
        const data = await res.json();
        setProductos(data);
    };

    useEffect(() => {
        fetchConsolidados();
    }, []);

    const handleUpdateLote = async (estadoAnterior, nuevoEstado) => {
        if (!confirm(`¿Confirmas que quieres pasar todos los pedidos "${estadoAnterior}" a "${nuevoEstado}"?`)) return;
        
        await fetch('http://localhost:3001/api/pedidos/actualizar-lote', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ estadoAnterior, nuevoEstado })
        });
        
        alert('¡Estados actualizados!');
        fetchConsolidados(); // Recargamos la lista (se vaciará si funciona)
    };

    return (
        <div className="crear-pedido-container">
            <h2>Productos Consolidados para Proveedor</h2>
            <div className="pedido-actions">
                <button onClick={() => handleUpdateLote('en_consolidacion', 'en_asignacion')} className="submit-btn">
                    Asignar Proveedor (Pasa a "En Asignación")
                </button>
                <button onClick={() => handleUpdateLote('en_asignacion', 'despachado')} className="submit-btn" style={{marginTop: '1rem', backgroundColor: '#388e3c'}}>
                    Realizar Pedido a Proveedor (Pasa a "Despachado")
                </button>
            </div>
            <table className="productos-table">
                <thead>
                    <tr><th>Producto</th><th>Cantidad Total</th></tr>
                </thead>
                <tbody>
                    {productos.map(p => (
                        <tr key={p.producto_id}>
                            <td>{p.producto_nombre}</td>
                            <td>{p.cantidad_total}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Consolidacion;