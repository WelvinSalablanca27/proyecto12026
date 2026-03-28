// Importaciones de librerías
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";

// Importaciones de componentes
import Encabezado from "./components/navegacion/Encabezado";
import RutaProtegida from "./components/rutas/RutaProtegida";

// Importaciones de vistas
import Inicio from "./views/Inicio";
import Categorias from "./views/Categorias";
import Catalogo from "./views/Catalogo";
import Productos from "./views/Productos";
import Login from "./views/Login";
import Pagina404 from "./views/Pagina404";

const App = () => {
  return (
    <Router>
      <Encabezado />

      <main className="margen-superior-main">
        <Routes>

          {/* Ruta pública */}
          <Route path="/login" element={<Login />} />

          {/* Rutas protegidas */}
          <Route path="/" element={<RutaProtegida><Inicio /></RutaProtegida>} />
          <Route path="/categorias" element={<RutaProtegida><Categorias /></RutaProtegida>} />
           <Route path="/catalogo" element={<Catalogo />} /> {/* Ruta pública */}
          <Route path="/productos" element={<RutaProtegida><Productos /></RutaProtegida>} />

          {/* Página no encontrada */}
          <Route path="*" element={<Pagina404 />} />

        </Routes>
      </main>
    </Router>
  );
};

export default App;