// src/components/Navbar.jsx

import React from "react";
import { Link } from "react-router-dom";
import "./Navbar.css"; // Crearemos este archivo para los estilos

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <Link to="/">Plataforma Pedidos</Link>
      </div>
      <ul className="navbar-links">
        <li>
          <Link to="/registro">Registro Tendero</Link>
        </li>
        <li>
          <Link to="/crear-pedido">Crear Pedido (Tendero)</Link>
        </li>
        <li>
          <Link to="/plataforma">Plataforma Central</Link>
        </li>
        <li>
          <Link to="/mis-pedidos">Mis Pedidos (Tendero)</Link>
        </li>
        <li>
          <Link to="/consolidacion">Consolidar Pedidos</Link>
        </li>
        <li>
          <Link to="/productos">Gestionar Productos</Link>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
