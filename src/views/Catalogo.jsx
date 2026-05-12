import React, { useEffect, useState, useMemo } from "react";
import { Container, Row, Col, Spinner, Alert, Form } from "react-bootstrap";
import { supabase } from "../database/supabaseconfig";
import TarjetaCatalogo from "../components/catalogo/TarjetaCatalogo";
import CuadroBusquedas from "../components/busquedas/CuadroBusquedas";

const Catalogo = () => {

  // 🔹 Estados
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("todas");
  const [textoBusqueda, setTextoBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  // 🔹 Handlers
  const manejarCambioCategoria = (e) => {
    setCategoriaSeleccionada(e.target.value);
  };

  const manejarCambioBusqueda = (e) => {
    setTextoBusqueda(e.target.value);
  };

  const obtenerNombreCategoria = (idCategoria) => {
    const cat = categorias.find((c) => c.id_categoria === idCategoria);
    return cat ? cat.nombre_categoria : "Sin categoría";
  };

  // 🔹 Cargar datos
  const cargarDatos = async () => {
    try {
      setCargando(true);

      const [resProductos, resCategorias] = await Promise.all([
        supabase
          .from("productos")
          .select("*")
          .order("nombre_producto", { ascending: true }),

        supabase
          .from("categorias")
          .select("id_categoria, nombre_categoria")
          .order("nombre_categoria"),
      ]);

      if (resProductos.error) throw resProductos.error;
      if (resCategorias.error) throw resCategorias.error;

      setProductos(resProductos.data || []);
      setCategorias(resCategorias.data || []);
    } catch (err) {
      console.error("Error al cargar catálogo:", err);
      setError("No se pudieron cargar los productos.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  // 🔹 Filtrado
  const productosFiltrados = useMemo(() => {
    let filtrados = productos;

    if (categoriaSeleccionada !== "todas") {
      filtrados = filtrados.filter(
        (prod) => prod.categoria_producto === parseInt(categoriaSeleccionada)
      );
    }

    if (textoBusqueda.trim()) {
      const textoLower = textoBusqueda.toLowerCase();

      filtrados = filtrados.filter((prod) => {
        const nombre = prod.nombre_producto?.toLowerCase() || "";
        const descripcion = prod.descripcion_producto?.toLowerCase() || "";

        return (
          nombre.includes(textoLower) ||
          descripcion.includes(textoLower)
        );
      });
    }

    return filtrados;
  }, [productos, categoriaSeleccionada, textoBusqueda]);

  // 🔹 Render
  return (
    <Container className="mt-3 px-1">

      {/* Título */}
      <Row className="text-center mb-1">
        <Col>
          <p className="lead text-muted">
            Nuestros productos de belleza
          </p>
        </Col>
      </Row>

      {/* Filtros */}
      <Row className="mb-1 align-items-end">

        {/* Selector categoría */}
        <Col md={4} lg={3} className="mb-2">
          <Form.Group controlId="filtroCategoria">
            <Form.Select
              value={categoriaSeleccionada}
              onChange={manejarCambioCategoria}
              className="shadow-sm"
            >
              <option value="todas">Todas las categorías</option>
              {categorias.map((cat) => (
                <option key={cat.id_categoria} value={cat.id_categoria}>
                  {cat.nombre_categoria}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>

        {/* Buscador */}
        <Col md={6} lg={5} className="mb-2">
          <Form.Group controlId="busquedaProducto">
            <CuadroBusquedas
              textoBusqueda={textoBusqueda}
              manejarCambioBusqueda={manejarCambioBusqueda}
            />
          </Form.Group>
        </Col>

      </Row>

      {/* 🔹 Estados */}
      {cargando && (
        <Row className="text-center my-5">
          <Col>
            <Spinner animation="border" variant="success" size="lg" />
            <p className="mt-3 text-muted">Cargando productos...</p>
          </Col>
        </Row>
      )}

      {!cargando && productosFiltrados.length === 0 && (
        <Alert variant="info" className="text-center">
          <i className="bi bi-info-circle me-2"></i>
          No se encontraron productos que coincidan con tu búsqueda.
        </Alert>
      )}

      {/* 🔹 Productos */}
      {!cargando && productosFiltrados.length > 0 && (
        <Row className="g-3">
          {productosFiltrados.map((producto) => (
            <Col xs={6} sm={6} md={4} lg={3} key={producto.id_producto}>
              <TarjetaCatalogo
                producto={producto}
                nombreCategoria={obtenerNombreCategoria(producto.categoria_producto)}
              />
            </Col>
          ))}
        </Row>
      )}

      {/* Error */}
      {error && (
        <Alert variant="danger" className="mt-3 text-center">
          {error}
        </Alert>
      )}

    </Container>
  );
};

export default Catalogo;