// src/pages/CrearPedido.jsx

import React, { useState, useEffect } from "react";
import "./CrearPedido.css"; // Estilos para esta página
import './styles.css'; // Estilos globales


const CrearPedido = () => {
  const [productos, setProductos] = useState([]); // Para almacenar la lista de productos de la API
  const [pedido, setPedido] = useState({}); // Para almacenar el pedido actual (productoId: cantidad)
  const [tenderoId, setTenderoId] = useState(1); // ID del tendero logueado, por ahora lo ponemos fijo (hardcoded)

  // useEffect se ejecuta cuando el componente se monta por primera vez.
  // Es el lugar perfecto para cargar datos desde una API.
  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const response = await fetch("http://localhost:3001/api/productos");
        if (!response.ok) {
          throw new Error("No se pudieron cargar los productos");
        }
        const data = await response.json();
        setProductos(data); // Guardamos los productos en el estado
      } catch (error) {
        console.error("Error fetching productos:", error);
        alert(`Error: ${error.message}`);
      }
    };

    fetchProductos();
  }, []); // El array vacío [] significa que este efecto se ejecuta solo una vez.

  // Maneja el cambio en la cantidad de un producto
  const handleCantidadChange = (productoId, cantidad) => {
    // Convertimos la cantidad a número, asegurándonos de que no sea negativo
    const numCantidad = Math.max(0, Number(cantidad));

    setPedido((prevPedido) => ({
      ...prevPedido,
      [productoId]: numCantidad,
    }));
  };

  // Maneja el envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Filtramos los productos para enviar solo aquellos con cantidad mayor a cero
    const productosAEnviar = Object.entries(pedido)
      .filter(([id, cantidad]) => cantidad > 0)
      .map(([id, cantidad]) => ({
        producto_id: Number(id),
        cantidad: cantidad,
      }));

    if (productosAEnviar.length === 0) {
      alert("Por favor, añade al menos un producto a tu pedido.");
      return;
    }

    const nuevoPedido = {
      tendero_id: tenderoId,
      productos: productosAEnviar,
    };

    console.log("Enviando pedido:", nuevoPedido);

    try {
      const response = await fetch("http://localhost:3001/api/pedidos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nuevoPedido),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Error al crear el pedido");
      }

      alert("¡Pedido creado con éxito!");
      setPedido({}); // Limpiamos el pedido actual
    } catch (error) {
      console.error("Error al crear el pedido:", error);
      alert(`Error: ${error.message}`);
    }
  };

  return (
    <div className="crear-pedido-container">
      <h2>Crear Nuevo Pedido</h2>
      <p>
        Tendero ID: {tenderoId} (en el futuro esto será automático con el login)
      </p>
      <form onSubmit={handleSubmit} className="pedido-form">
        <table className="productos-table">
          <thead>
            <tr>
              <th>Producto</th>
              <th>Precio</th>
              <th>Cantidad</th>
            </tr>
          </thead>
          <tbody>
            {productos.map((producto) => (
              <tr key={producto.id}>
                <td>{producto.nombre}</td>
                <td>${Number(producto.precio).toLocaleString("es-CO")}</td>
                <td>
                  <input
                    type="number"
                    min="0"
                    className="cantidad-input"
                    value={pedido[producto.id] || ""}
                    onChange={(e) =>
                      handleCantidadChange(producto.id, e.target.value)
                    }
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button type="submit" className="submit-btn">
          Realizar Pedido
        </button>
      </form>
    </div>
  );
};

export default CrearPedido;
