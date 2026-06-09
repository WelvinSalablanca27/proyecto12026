
import React, { useEffect, useState } from "react";
import { Container, Row, Col, Button, Alert, Spinner } from "react-bootstrap";
import { supabase } from "../database/supabaseconfig";
import ModalRegistroProducto from "../components/productos/ModalRegistroProducto";
import NotificacionOperacion from "../components/NotificacionOperacion";
import CuadrosBusquedas from "../components/busquedas/CuadroBusquedas";
import Paginacion from "../components/ordenamiento/Paginacion";
import TablaProductos from "../components/productos/TablaProducto";
import TarjetaProducto from "../components/productos/TarjetasProducto";
import ModalEdicionProducto from "../components/productos/ModalEdicionProducto";
import ModalEliminacionProducto from "../components/productos/ModalEliminacionProducto";
import ModalQRProducto from "../components/productos/ModalQRProducto";

const Productos = () => {

    const [productos, setProductos] = useState([]);
    const [productosFiltrados, setProductosFiltrados] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [textoBusqueda, setTextoBusqueda] = useState("");
    const [cargando, setCargando] = useState(true);

    const [mostrarModal, setMostrarModal] = useState(false);
    const [mostrarModalEliminacion, setMostrarModalEliminacion] = useState(false);
    const [mostrarModalEdicion, setMostrarModalEdicion] = useState(false);

    const [registrosPorPagina, establecerRegistrosPorPagina] = useState(5);
    const [paginaActual, establecerPaginaActual] = useState(1);

    const productosPaginados = productosFiltrados.slice(
        (paginaActual - 1) * registrosPorPagina,
        paginaActual * registrosPorPagina
    );

    const [mostrarModalQR, setMostrarModalQR] = useState(false);
    const [productoQR, setProductoQR] = useState(null);

    const generarQRImagen = (producto) => {

        if (!producto?.url_imagen) {

            setToast({
                mostrar: true,
                mensaje: "Este producto no tiene imagen asociada",
                tipo: "advertencia"
            });

            return;
        }

        setProductoQR(producto);
        setMostrarModalQR(true);
    };

    const [nuevoProducto, setNuevoProducto] = useState({
        nombre_producto: "",
        descripcion_producto: "",
        categoria_producto: "",
        precio_venta: "",
        archivo: null,
    });

    const [productoEditar, setProductoEditar] = useState({
        id_producto: "",
        nombre_producto: "",
        descripcion_producto: "",
        categoria_producto: "",
        precio_venta: "",
        url_imagen: "",
        archivo: null,
    });

    const [productoAEliminar, setProductoAEliminar] = useState(null);

    const [toast, setToast] = useState({
        mostrar: false,
        mensaje: "",
        tipo: "",
    });

    const abrirModalEdicion = (producto) => {
        setProductoEditar(producto);
        setMostrarModalEdicion(true);
    };

    const abrirModalEliminacion = (producto) => {
        setProductoAEliminar(producto);
        setMostrarModalEliminacion(true);
    };

    const manejoCambioInput = (e) => {
        const { name, value } = e.target;
        setNuevoProducto((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const manejoCambioInputEdicion = (e) => {
        const { name, value } = e.target;
        setProductoEditar((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const manejoCambioArchivoActualizar = (e) => {
        const archivo = e.target.files[0];

        if (archivo && archivo.type.startsWith("image/")) {
            setProductoEditar((prev) => ({
                ...prev,
                archivo,
            }));
        } else {
            alert("Selecciona una imagen válida (JPG, PNG, etc.)");
        }
    };

    const manejoCambioArchivo = (e) => {
        const archivo = e.target.files[0];

        if (archivo && archivo.type.startsWith("image/")) {
            setNuevoProducto((prev) => ({
                ...prev,
                archivo,
            }));
        } else {
            alert("Selecciona una imagen válida");
        }
    };

    const manejarBusqueda = (e) => {
        setTextoBusqueda(e.target.value);
    };

    useEffect(() => {
        if (!textoBusqueda.trim()) {
            setProductosFiltrados(productos);
        } else {
            const textoLower = textoBusqueda.toLowerCase().trim();

            const filtrados = productos.filter((prod) => {
                const nombre = prod.nombre_producto?.toLowerCase() || "";
                const descripcion =
                    prod.descripcion_producto?.toLowerCase() || "";
                const precio = prod.precio_venta?.toString() || "";

                return (
                    nombre.includes(textoLower) ||
                    descripcion.includes(textoLower) ||
                    precio.includes(textoLower)
                );
            });

            setProductosFiltrados(filtrados);
        }
    }, [textoBusqueda, productos]);

    useEffect(() => {
        cargarCategorias();
        cargarProductos();
    }, []);

    const actualizarProducto = async () => {
        try {
            // Validación de campos obligatorios
            if (
                !productoEditar.nombre_producto?.trim() ||
                !productoEditar.categoria_producto ||
                !productoEditar.precio_venta
            ) {
                setToast({
                    mostrar: true,
                    mensaje: "Completa los campos obligatorios",
                    tipo: "advertencia",
                });
                return;
            }

            setMostrarModalEdicion(false);

            let datosActualizados = {
                nombre_producto: productoEditar.nombre_producto.trim(),
                descripcion_producto: productoEditar.descripcion_producto?.trim() || null,
                categoria_producto: productoEditar.categoria_producto,
                precio_venta: parseFloat(productoEditar.precio_venta),
                url_imagen: productoEditar.url_imagen,
            };

            // === Manejo de nueva imagen ===
            if (productoEditar.archivo) {
                const nombreArchivo = `${Date.now()}_${productoEditar.archivo.name}`;

                // Subir nueva imagen
                const { error: uploadError } = await supabase.storage
                    .from('imagenes_productos')
                    .upload(nombreArchivo, productoEditar.archivo, {
                        cacheControl: '3600',
                        upsert: false,
                    });

                if (uploadError) throw uploadError;

                // Obtener URL pública
                const { data: urlData } = supabase.storage
                    .from('imagenes_productos')
                    .getPublicUrl(nombreArchivo);

                datosActualizados.url_imagen = urlData.publicUrl;

                // Eliminar imagen anterior si existe
                if (productoEditar.url_imagen) {
                    try {
                        const nombreAnterior = productoEditar.url_imagen
                            .split('/')
                            .pop()
                            ?.split('?')[0];

                        if (nombreAnterior) {
                            await supabase.storage
                                .from('imagenes_productos')
                                .remove([nombreAnterior]);
                        }
                    } catch (deleteError) {
                        console.warn("No se pudo eliminar la imagen anterior:", deleteError);
                        // No bloqueamos la actualización por error al borrar la imagen vieja
                    }
                }
            }

            // Actualizar en la base de datos
            const { error } = await supabase
                .from('productos')
                .update(datosActualizados)
                .eq('id_producto', productoEditar.id_producto);

            if (error) throw error;

            // Recargar lista y resetear formulario
            await cargarProductos();

            setProductoEditar({
                id_producto: "",
                nombre_producto: "",
                descripcion_producto: "",
                categoria_producto: "",
                precio_venta: "",
                url_imagen: "",
                archivo: null,
            });

            setToast({
                mostrar: true,
                mensaje: "Producto actualizado correctamente",
                tipo: "exito",
            });

        } catch (err) {
            console.error("Error al actualizar producto:", err);
            setToast({
                mostrar: true,
                mensaje: "Error al actualizar producto",
                tipo: "error",
            });
        }
    };


    // ✅ AQUÍ ESTÁ LO QUE TE FALTABA
    const eliminarProducto = async () => {
        try {
            if (!productoAEliminar) return;

            const { error } = await supabase
                .from("productos")
                .delete()
                .eq("id_producto", productoAEliminar.id_producto);

            if (error) throw error;

            setMostrarModalEliminacion(false);
            setProductoAEliminar(null);

            cargarProductos();

            setToast({
                mostrar: true,
                mensaje: "Producto eliminado correctamente",
                tipo: "exito",
            });

        } catch (err) {
            console.error("Error al eliminar producto:", err);

            setToast({
                mostrar: true,
                mensaje: "Error al eliminar producto",
                tipo: "error",
            });
        }
    };

    const cargarProductos = async () => {
        try {
            setCargando(true);

            const { data, error } = await supabase
                .from("productos")
                .select("*")
                .order("id_producto", { ascending: true });

            if (error) throw error;

            setProductos(data || []);
            setProductosFiltrados(data || []);
        } catch (err) {
            console.error("Error al cargar productos:", err);
        } finally {
            setCargando(false);
        }
    };

    const cargarCategorias = async () => {
        try {
            const { data, error } = await supabase
                .from("categorias")
                .select("*")
                .order("id_categoria", { ascending: true });

            if (error) throw error;

            setCategorias(data || []);
        } catch (err) {
            console.error("Error al cargar categorías:", err);
        }
    };

    const agregarProducto = async () => {
        try {
            if (
                !nuevoProducto.nombre_producto.trim() ||
                !nuevoProducto.categoria_producto ||
                !nuevoProducto.precio_venta ||
                !nuevoProducto.archivo
            ) {
                setToast({
                    mostrar: true,
                    mensaje:
                        "Completa los campos obligatorios (nombre, categoría, precio e imagen)",
                    tipo: "advertencia",
                });
                return;
            }

            setMostrarModal(false);

            const nombreArchivo = `${Date.now()}_${nuevoProducto.archivo.name}`;

            const { error: uploadError } = await supabase.storage
                .from("imagenes_productos")
                .upload(nombreArchivo, nuevoProducto.archivo);

            if (uploadError) throw uploadError;

            const { data: urlData } = supabase.storage
                .from("imagenes_productos")
                .getPublicUrl(nombreArchivo);

            const urlPublica = urlData.publicUrl;

            const { error } = await supabase.from("productos").insert([
                {
                    nombre_producto: nuevoProducto.nombre_producto,
                    descripcion_producto:
                        nuevoProducto.descripcion_producto || null,
                    categoria_producto:
                        nuevoProducto.categoria_producto,
                    precio_venta: parseFloat(
                        nuevoProducto.precio_venta
                    ),
                    url_imagen: urlPublica,
                },
            ]);

            if (error) throw error;

            cargarProductos();

            setNuevoProducto({
                nombre_producto: "",
                descripcion_producto: "",
                categoria_producto: "",
                precio_venta: "",
                archivo: null,
            });

            setToast({
                mostrar: true,
                mensaje: "Producto registrado correctamente",
                tipo: "exito",
            });
        } catch (err) {
            console.error("Error al agregar producto:", err);

            setToast({
                mostrar: true,
                mensaje: "Error al registrar producto",
                tipo: "error",
            });
        }
    };

    return (
        <Container className="mt-3">

            <Row className="align-items-center mb-3">

                <Col className="d-flex align-items-center">
                    <h3 className="mb-0">
                        <i className="bi-bag-heart-fill me-2"></i>
                        Productos
                    </h3>
                </Col>

                <Col xs={3} sm={5} md={5} lg={5} className="text-end">
                    <Button onClick={() => setMostrarModal(true)} size="md">
                        <i className="bi-plus-lg"></i>
                        <span className="d-none d-sm-inline ms-2">
                            Nuevo Producto
                        </span>
                    </Button>
                </Col>

            </Row>

            <hr />

            <Row className="mb-4">
                <Col md={6} lg={5}>
                    <CuadrosBusquedas
                        textoBusqueda={textoBusqueda}
                        manejarCambioBusqueda={manejarBusqueda}
                        placeholder="Buscar por nombre, descripción o precio..."
                    />
                </Col>
            </Row>

            {!cargando && textoBusqueda.trim() && productosFiltrados.length === 0 && (
                <Row>
                    <Col>
                        <div className="alert alert-info text-center">
                            No se encontraron productos con "{textoBusqueda}"
                        </div>
                    </Col>
                </Row>
            )}

            {cargando && (
                <Row className="text-center my-5">
                    <Col>
                        <Spinner animation="border" variant="success" size="lg" />
                        <p className="mt-3 text-muted">Cargando productos...</p>
                    </Col>
                </Row>
            )}

            {!cargando && productosFiltrados.length > 0 && (
                <Row>
                    <Col xs={12} className="d-none d-lg-block">
                        <TablaProductos
                            productos={productosPaginados}
                            abrirModalEdicion={abrirModalEdicion}
                            abrirModalEliminacion={abrirModalEliminacion}
                            generarQRImagen={generarQRImagen}
                        />
                    </Col>

                    <Col xs={12} className="d-lg-none">
                        <TarjetaProducto
                            productos={productosPaginados}
                            abrirModalEdicion={abrirModalEdicion}
                            abrirModalEliminacion={abrirModalEliminacion}
                            generarQRImagen={generarQRImagen}
                        />
                    </Col>
                </Row>
            )}

            {productosFiltrados.length > 0 && (
                <Paginacion
                    registrosPorPagina={registrosPorPagina}
                    totalRegistros={productosFiltrados.length}
                    paginaActual={paginaActual}
                    establecerPaginaActual={establecerPaginaActual}
                    establecerRegistrosPorPagina={establecerRegistrosPorPagina}
                />
            )}

            <ModalEdicionProducto
                mostrarModalEdicion={mostrarModalEdicion}
                setMostrarModalEdicion={setMostrarModalEdicion}
                productoEditar={productoEditar}
                manejoCambioInputEdicion={manejoCambioInputEdicion}
                manejoCambioArchivoActualizar={manejoCambioArchivoActualizar}
                actualizarProducto={actualizarProducto}
                categorias={categorias}

            />

            <ModalEliminacionProducto
                mostrarModalEliminacion={mostrarModalEliminacion}
                setMostrarModalEliminacion={setMostrarModalEliminacion}
                productoAEliminar={productoAEliminar}
                eliminarProducto={eliminarProducto}
            />

            <ModalRegistroProducto
                mostrarModal={mostrarModal}
                setMostrarModal={setMostrarModal}
                nuevoProducto={nuevoProducto}
                manejoCambioInput={manejoCambioInput}
                manejoCambioArchivo={manejoCambioArchivo}
                agregarProducto={agregarProducto}
                categorias={categorias}
            />

            <ModalQRProducto
                mostrar={mostrarModalQR}
                onHide={() => setMostrarModalQR(false)}
                producto={productoQR}
            />

            <NotificacionOperacion
                mostrar={toast.mostrar}
                mensaje={toast.mensaje}
                tipo={toast.tipo}
                onCerrar={() =>
                    setToast({
                        ...toast,
                        mostrar: false,
                    })
                }
            />

        </Container>
    );
};

export default Productos;