import React, { useState } from "react";
import { Modal, Form, Button, ModalFooter } from "react-bootstrap";
import { Await } from "react-router-dom";

const ModalEdicionCategoria = ({
    mostrarModalEdicion,
    setMostrarModalEdicio,
    categoriaEditar,
    manejoCambioInputEdicion,
    actualizarCategoria,
}) => {

    const [deshabilitado, setDeshabilitado] = useState(false);
    const handleActualizar = async () => {
        if (deshabilitado) return;
        setDeshabilitado(true);
        await actualizarCategoria();
        setDeshabilitado(false);
    };

    return (
        <Modal
            show={mostrarModalEdicion}
            onHide={() => setMostrarModalEdicio(false)}
            backdrop="static"
            keyboard={false}
            centered
        >
            <Modal.Header closeButton>
                <Modal.Title>Editar Categoria</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Form.Group className="mb-3">
                        <Form.Label>Nombre</Form.Label>
                        <Form.Control
                            type="text"
                            name="nombre_categoria"
                            value={categoriaEditar.nombre_categoria}
                            onChange={manejoCambioInputEdicion}
                            placeholder="Ingresa el nombre"
                        />
                    </Form.Group>

                    <Form.Group>
                        <Form.Label>Descripcion</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            name="descripcion_categoria"
                            value={categoriaEditar.descripcion_categoria}
                            onChange={manejoCambioInputEdicion}
                            placeholder="Ingresa el descrippcion"
                        />
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={() => setMostrarModalEdicio(false)}>
                    Canceler
                </Button>
                <Button
                    variant="primary"
                    onClick={handleActualizar}
                    disabled={categoriaEditar.nombre_categoria.trim() === "" || deshabilitado}
                >
                    Actualizar
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ModalEdicionCategoria;