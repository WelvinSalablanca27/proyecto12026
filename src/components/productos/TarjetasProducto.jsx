import React, { useState, useEffect, useCallback } from "react";
import { Card, Row, Col, Spinner, Button, Image } from "react-bootstrap";
import "bootstrap-icons/font/bootstrap-icons.css";

const TarjetaProducto = ({
    productos,
    abrirModalEdicion,
    abrirModalEliminacion
}) => {

    const [cargando, setCargado] = useState(true);
    const [idTarjetaActiva, setIdTarjetaActiva] = useState(null);

    useEffect(() => {
        setCargado(!(productos && productos.length > 0));
    }, [productos]);

    const manejarTeclaEscape = useCallback((evento) => {
        if (evento.key === "Escape") setIdTarjetaActiva(null);
    }, []);

    useEffect(() => {
        window.addEventListener("keydown", manejarTeclaEscape);
        return () => window.removeEventListener("keydown", manejarTeclaEscape);
    }, [manejarTeclaEscape]);

    const alternarTarjetaActiva = (id) => {
        setIdTarjetaActiva((anterior) => (anterior === id ? null : id));
    };

    return (
        <>
            {cargando ? (
                <div className="text-center my-5">
                    <h5>Cargando productos...</h5>
                    <Spinner animation="border" variant="success" role="status" />
                </div>
            ) : (
                <div>
                    {productos.map((producto) => {
                        const tarjetaActiva =
                            idTarjetaActiva === producto.id_producto;

                        return (
                            <Card
                                key={producto.id_producto}
                                className="mb-3 border-0 rounded-3 shadow-sm w-100"
                                onClick={() =>
                                    alternarTarjetaActiva(producto.id_producto)
                                }
                                tabIndex={0}
                                onKeyDown={(evento) => {
                                    if (
                                        evento.key === "Enter" ||
                                        evento.key === " "
                                    ) {
                                        evento.preventDefault();
                                        alternarTarjetaActiva(
                                            producto.id_producto
                                        );
                                    }
                                }}
                                aria-label={`Producto ${producto.nombre_producto}`}
                            >
                                <Card.Body
                                    className={`p-2 ${
                                        tarjetaActiva
                                            ? "bg-light"
                                            : "bg-white"
                                    }`}
                                >
                                    <Row className="align-items-center gx-3">

                                        <Col xs={3}>
                                            <Image
                                                src={producto.url_imagen}
                                                rounded
                                                fluid
                                                style={{
                                                    width: "60px",
                                                    height: "60px",
                                                    objectFit: "cover"
                                                }}
                                            />
                                        </Col>

                                        <Col xs={5} className="text-start">
                                            <div className="fw-semibold text-truncate">
                                                {producto.nombre_producto}
                                            </div>

                                            <div className="small text-muted text-truncate">
                                                {producto.descripcion_producto}
                                            </div>
                                        </Col>

                                        <Col
                                            xs={4}
                                            className="d-flex flex-column align-items-end text-end"
                                        >
                                            <div className="badge bg-success mb-1">
                                                C$ {producto.precio_venta}
                                            </div>

                                            <small className="text-muted text-truncate">
                                                {producto.categoria_producto}
                                            </small>
                                        </Col>
                                    </Row>
                                </Card.Body>

                                {tarjetaActiva && (
                                    <div
                                        role="dialog"
                                        aria-modal="true"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setIdTarjetaActiva(null);
                                        }}
                                        className="tarjeta-categoria-capa"
                                    >
                                        <div
                                            className="d-flex gap-2 tarjeta-categoria-botones-capa"
                                            onClick={(e) =>
                                                e.stopPropagation()
                                            }
                                        >
                                            <Button
                                                variant="outline-warning"
                                                size="sm"
                                                onClick={() => {
                                                    abrirModalEdicion(producto);
                                                    setIdTarjetaActiva(null);
                                                }}
                                            >
                                                <i className="bi bi-pencil"></i>
                                            </Button>

                                            <Button
                                                variant="outline-danger"
                                                size="sm"
                                                onClick={() => {
                                                    abrirModalEliminacion(producto);
                                                    setIdTarjetaActiva(null);
                                                }}
                                            >
                                                <i className="bi bi-trash"></i>
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </Card>
                        );
                    })}
                </div>
            )}
        </>
    );
};

export default TarjetaProducto;