// src/App.jsx

// 1. Importa los componentes de React Router y nuestras páginas/componentes
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Registro from "./pages/Registro";
import CrearPedido from "./pages/CrearPedido";
import PlataformaCentral from "./pages/PlataformaCentral";
import MisPedidos from "./pages/MisPedidos";
import Consolidacion from './pages/Consolidacion';
import GestionProductos from './pages/GestionProductos';

function App() {
  return (
    <div>
      {/* 2. El Navbar se coloca fuera de <Routes> para que aparezca en todas las páginas */}
      <Navbar />

      <main>
        {/* 3. <Routes> actúa como un contenedor para todas nuestras rutas individuales */}
        <Routes>
          {/* 
            Cada <Route> define una regla:
            - path: La URL que activará esta ruta.
            - element: El componente que se debe renderizar cuando la URL coincide.
            La ruta "/" es la página de inicio.
          */}
          <Route path="/" element={<PlataformaCentral />} />
          <Route path="/registro" element={<Registro />} />
          <Route path="/crear-pedido" element={<CrearPedido />} />
          <Route path="/plataforma" element={<PlataformaCentral />} />
          <Route path="/mis-pedidos" element={<MisPedidos />} />
          <Route path="/consolidacion" element={<Consolidacion />} />
          <Route path="/productos" element={<GestionProductos />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
