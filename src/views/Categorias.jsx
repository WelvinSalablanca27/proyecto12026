import React, { useState, useEffect } from "react";
import { Container, Row, Col, Button, Spinner } from "react-bootstrap";
import { supabase } from "../database/supabaseconfig";

// 🔍 Importa el componente de búsqueda para filtrar categorías
import CuadrosBusquedas from "../components/busquedas/CuadroBusquedas";
import Paginacion from "../components/ordenamiento/Paginacion";

// 📦 Importación de modales y componentes auxiliares
import ModalRegistroCategoria from "../components/categorias/ModalRegistroCategoria";
import ModalEdicionCategoria from "../components/categorias/ModalEdicionCategoria"
import NotificacionOperacion from "../components/NotificacionOperacion";
import TablaCategorias from "../components/categorias/TablaCategorias";
import ModalEliminacionCategoria from "../components/categorias/ModalEliminacionCategoria";
import TarjetaCategoria from "../components/categorias/TarjetaCategoria";

const Categorias = () => {

  // 🔔 Estado para mostrar notificaciones (toast)
  const [toast, setToast] = useState({ mostrar: false, mensaje: "", tipo: "" });

  // 📌 Control de visibilidad del modal de registro
  const [mostrarModal, setMostrarModal] = useState(false);

  // 📊 Lista de categorías y estado de carga
  const [categorias, setCategorias] = useState([]);
  const [cargando, setCargando] = useState(true);

  // 🗑️ Control de eliminación
  const [mostrarModalEliminacion, setMostrarModalEliminacion] = useState(false);
  const [categoriaAEliminar, setCategoriaAEliminar] = useState(null);

  // ✏️ Control de edición
  const [mostrarModalEdicion, setMostrarModalEdicion] = useState(false);

  // 🔎 Búsqueda
  const [textoBusqueda, setTextoBusqueda] = useState("");
  const [categoriaFiltradas, setCategoriasFiltradas] = useState([]);

  // 📌 Cantidad de registros que se mostrarán por cada página
  const [registrosPorPagina, establecerRegistrosPorPagina] = useState(5);
  const [paginaActual, establecerPaginaActual] = useState(1)

  // 📌 Lista de categorías ya filtradas y divididas según la página actual
  const categoriasPaginadas = categoriaFiltradas.slice(
    (paginaActual - 1) * registrosPorPagina,
    paginaActual * registrosPorPagina
  );
  // ✏️ Datos de categoría en edición
  const [categoriaEditar, setCategoriaEditar] = useState({
    id_categoria: "",
    nombre_categoria: "",
    descripcion_categoria: "",
  });

  // ➕ Datos para nueva categoría
  const [nuevaCategoria, setNuevaCategoria] = useState({
    nombre_categoria: "",
    descripcion_categoria: "",
  });

  // 🚀 Carga inicial de categorías
  useEffect(() => {
    cargarCategorias();
  }, []);

  // ✏️ Abre el modal de edición con datos cargados
  const abrirModalEdicion = (categoria) => {
    setCategoriaEditar({
      id_categoria: categoria.id_categoria,
      nombre_categoria: categoria.nombre_categoria,
      descripcion_categoria: categoria.descripcion_categoria,
    });
    setMostrarModalEdicion(true);
  };

  // 🗑️ Abre modal de confirmación de eliminación
  const abrirModalEliminacion = (categoria) => {
    setCategoriaAEliminar(categoria);
    setMostrarModalEliminacion(true);
  };

  // ✍️ Maneja inputs de nueva categoría
  const manejoCambioInput = (e) => {
    const { name, value } = e.target;
    setNuevaCategoria((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ✍️ Maneja inputs de edición
  const manejoCambioInputEdicion = (e) => {
    const { name, value } = e.target;
    setCategoriaEditar((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // 🔍 Manejo del texto de búsqueda
  const manejoBusqueda = (e) => {
    setTextoBusqueda(e.target.value);
  };

  // 🔎 Filtrado dinámico de categorías
  useEffect(() => {
    if (!textoBusqueda.trim()) {
      setCategoriasFiltradas(categorias);
    } else {
      const textoLower = textoBusqueda.toLowerCase().trim();
      const filtradas = categorias.filter((cat) =>
        cat.nombre_categoria.toLowerCase().includes(textoLower) ||
        cat.descripcion_categoria.toLowerCase().includes(textoLower)
      );
      setCategoriasFiltradas(filtradas);
    }
  }, [textoBusqueda, categorias]);

  // 📥 Cargar categorías desde Supabase
  const cargarCategorias = async () => {
    try {
      setCargando(true);

      const { data, error } = await supabase
        .from("categorias")
        .select("*")
        .order("id_categoria", { ascending: true });

      if (error) {
        console.error("Error al cargar categorias:", error.message);
        setToast({
          mostrar: true,
          mensaje: "Error al cargar categorias.",
          tipo: "error",
        });
        return;
      }

      setCategorias(data || []);
    } catch (err) {
      console.error("Excepción al cargar categorias:", err.message);
      setToast({
        mostrar: true,
        mensaje: "Error inesperado al cargar categorias.",
        tipo: "error",
      });
    } finally {
      setCargando(false);
    }
  };

  // ➕ Agregar nueva categoría
  const agregarCategoria = async () => {
    try {
      // ⚠️ Validación de campos vacíos
      if (
        !nuevaCategoria.nombre_categoria.trim() ||
        !nuevaCategoria.descripcion_categoria.trim()
      ) {
        setToast({
          mostrar: true,
          mensaje: "Debe llenar todos los campos.",
          tipo: "advertencia",
        });
        return;
      }

      const { error } = await supabase.from("categorias").insert([
        {
          nombre_categoria: nuevaCategoria.nombre_categoria,
          descripcion_categoria: nuevaCategoria.descripcion_categoria,
        },
      ]);

      if (error) {
        console.error("Error al agregar categoría:", error.message);
        return;
      }

      await cargarCategorias();

      // ✅ Mensaje de éxito
      setToast({
        mostrar: true,
        mensaje: `Categoría "${nuevaCategoria.nombre_categoria}" registrada exitosamente.`,
        tipo: "exito",
      });

      // 🔄 Reset formulario
      setNuevaCategoria({ nombre_categoria: "", descripcion_categoria: "" });
      setMostrarModal(false);

    } catch (err) {
      console.error("Excepción:", err.message);
    }
  };

  // ✏️ Actualizar categoría existente
  const actualizarCategoria = async () => {
    try {
      if (
        !categoriaEditar.nombre_categoria.trim() ||
        !categoriaEditar.descripcion_categoria.trim()
      ) {
        setToast({
          mostrar: true,
          mensaje: "Debe llenar todos los campos",
          tipo: "advertencia"
        });
        return;
      }

      setMostrarModalEdicion(false)

      const { error } = await supabase
        .from("categorias")
        .update({
          nombre_categoria: categoriaEditar.nombre_categoria,
          descripcion_categoria: categoriaEditar.descripcion_categoria,
        })
        .eq("id_categoria", categoriaEditar.id_categoria);

      if (error) {
        console.error("Error al actualizar categoria:", error.message);
        setToast({
          mostrar: true,
          mensaje: `Error ala actualizar categoria "${categoriaEditar.nombre_categoria}.`,
          tipo: "exito",
        });
        return;
      }

      await cargarCategorias();

      // ⚠️ Aquí hay un pequeño detalle: el mensaje dice error pero es éxito
      setToast({
        mostrar: true,
        mensaje: "Confimardo la Actualizacion",
        tipo: "exito",
      });

    } catch (err) {
      setToast({
        mostrar: true,
        mensaje: "Error inesperado al actualizar categoría.",
        tipo: "error",
      });
      console.error("Excepción al actualizar categoría:", err.message);
    }
  };

  // 🗑️ Eliminar categoría
  const eliminarCategoria = async () => {
    if (!categoriaAEliminar) return;

    try {
      setMostrarModalEliminacion(false);

      const { error } = await supabase
        .from("categorias")
        .delete()
        .eq("id_categoria", categoriaAEliminar.id_categoria);

      if (error) {
        console.error("Error al eliminar categoria:", error.message);
        setToast({
          mostrar: true,
          mensaje: `Error ala eliminar categoria ${categoriaAEliminar.nombre_categoria}.`,
          tipo: "error"
        });
        return;
      }

      await cargarCategorias();

      setToast({
        mostrar: true,
        mensaje: `Catgoria ${categoriaAEliminar.nombre_categoria} eliminada exitosamente.`,
        tipo: "exito"
      });

    } catch (err) {
      setToast({
        mostrar: true,
        mensaje: `Error inesperado al Eliminar categoria.`,
        tipo: "error"
      });
      console.error("Excepcion al eliminar categoria:", err.message);
    }
  };

  return (
    <Container className="mt-3">

      {/* 📌 Encabezado */}
      <Row className="align-items-center mb-3">
        <Col xs={9} sm={7} md={7} lg={7} className="d-flex align-items-center">
          <h3 className="mb-0">
            <i className="bi-bookmark-plus-fill me-2"></i> Categorías
          </h3>
        </Col>

        {/* ➕ Botón nueva categoría */}
        <Col xs={3} sm={5} md={5} lg={5} className="text-end">
          <Button onClick={() => setMostrarModal(true)} size="md">
            <i className="bi-plus-lg"></i>
            <span className="d-none d-sm-inline ms-2">Nueva Categoría</span>
          </Button>
        </Col>
      </Row>

      <hr />

      {/* 🔍 Cuadro de Busqueda debajo de la linea divisoria */}
      <Row className="mb-4">
        <Col md={6} lg={5}>
          <CuadrosBusquedas
            textoBusqueda={textoBusqueda}
            manejarCambioBusqueda={manejoBusqueda}
          />
        </Col>
      </Row>

      {/* ⚠️ Mensaje si no hay resultados */}
      {!cargando && textoBusqueda.trim() && categoriaFiltradas.length === 0 && (
        <Row>
          <Col>
            <div className="alert alert-info text-center">
              <i className="bi bi-info-circle me-2"></i>
              No se encontraron categorías con "{textoBusqueda}"
            </div>
          </Col>
        </Row>
      )}

      {/* ⏳ Loader */}
      {cargando && (
        <Row className="text-center my-5">
          <Col>
            <Spinner animation="border" variant="success" size="lg" />
            <p className="mt-3 text-muted">Cargando categorías...</p>
          </Col>
        </Row>
      )}

      {/* 📊 Tabla en escritorio */}
      {!cargando && categoriaFiltradas.length > 0 && (
        <Row>
          <Col xs={12} className="d-none d-lg-block">
            <TablaCategorias
              categorias={categoriaFiltradas}
              abrirModalEdicion={abrirModalEdicion}
              abrirModalEliminacion={abrirModalEliminacion}
            />
          </Col>
          {/* 📱 Vista en tarjetas para móvil */}
          <Col xs={12} sm={12} md={12} className="d-lg-none">
            <TarjetaCategoria
              categorias={categoriaFiltradas}
              abrirModalEdicion={abrirModalEdicion}
              abrirModalEliminacion={abrirModalEliminacion}
            />
          </Col>
        </Row>
      )}

      {/* 📦 Modales */}
      <ModalRegistroCategoria
        mostrarModal={mostrarModal}
        setMostrarModal={setMostrarModal}
        nuevaCategoria={nuevaCategoria}
        manejoCambioInput={manejoCambioInput}
        agregarCategoria={agregarCategoria}
      />

      <Paginacion
        registrosPorPagina={registrosPorPagina}
        totalRegistros={categoriaFiltradas.length}
        paginaActual={paginaActual}
        establecerPaginaActual={establecerPaginaActual}
        establecerRegistrosPorPagina={establecerRegistrosPorPagina}
      />
      <ModalEdicionCategoria
        mostrarModalEdicion={mostrarModalEdicion}
        setMostrarModalEdicion={setMostrarModalEdicion}
        categoriaEditar={categoriaEditar}
        manejoCambioInputEdicion={manejoCambioInputEdicion}
        actualizarCategoria={actualizarCategoria}
      />

      <ModalEliminacionCategoria
        mostrarModalEliminacion={mostrarModalEliminacion}
        setMostrarModalEliminacion={setMostrarModalEliminacion}
        eliminarCategoria={eliminarCategoria}
        categoria={categoriaAEliminar}
      />

      {/* 🔔 Notificaciones */}
      <NotificacionOperacion
        mostrar={toast.mostrar}
        mensaje={toast.mensaje}
        tipo={toast.tipo}
        onCerrar={() => setToast({ ...toast, mostrar: false })}
      />

    </Container>
  );
};

export default Categorias;