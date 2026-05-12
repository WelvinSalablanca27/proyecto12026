import React, { useState } from 'react';
import { Modal, Form, Button, Row, Col } from 'react-bootstrap';

const ModalEdicionProducto = ({
  mostrarModalEdicion,
  setMostrarModalEdicion,
  productoEditar,
  manejoCambioInputEdicion,
  manejoCambioArchivoActualizar,
  actualizarProducto,
  categorias
}) => {

  const [deshabilitado, setDeshabilitado] = useState(false);

  const handleActualizar = async () => {
    if (deshabilitado) return;
    setDeshabilitado(true);
    await actualizarProducto();
    setDeshabilitado(false);
  };

  return (
    <Modal
      show={mostrarModalEdicion}
      onHide={() => setMostrarModalEdicion(false)}
      backdrop="static"
      centered
      size="lg"
    >
      <Modal.Header closeButton>
        <Modal.Title>Editar Producto</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form>
          <Row>
            {/* Categoría */}
            <Col xs={12} md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Categoría</Form.Label>
                <Form.Select
                  name="id_categoria_producto"
                  value={productoEditar.id_categoria_producto || ""}
                  onChange={manejoCambioInputEdicion}
                  required
                >
                  <option value="">Selecciona una categoría</option>
                  {categorias.map((cat) => (
                    <option key={cat.id_categoria} value={cat.id_categoria}>
                      {cat.nombre_categoria}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            {/* Nombre */}
            <Col xs={12} md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Nombre</Form.Label>
                <Form.Control
                  type="text"
                  name="nombre_producto"
                  value={productoEditar.nombre_producto || ""}
                  onChange={manejoCambioInputEdicion}
                  required
                />
              </Form.Group>
            </Col>

            {/* Precio */}
            <Col xs={12} md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Precio de venta</Form.Label>
                <Form.Control
                  type="number"
                  step="0.01"
                  name="precio_venta"
                  value={productoEditar.precio_venta || ""}
                  onChange={manejoCambioInputEdicion}
                  required
                />
              </Form.Group>
            </Col>

            {/* Imagen actual */}
            <Col xs={12}>
              <Form.Group className="mb-3 text-center">
                <Form.Label>Imagen actual</Form.Label>
                <div className="mt-2">
                  {productoEditar.url_imagen ? (
                    <img
                      src={productoEditar.url_imagen}
                      alt="Producto actual"
                      style={{
                        maxWidth: "120px",
                        maxHeight: "120px",
                        objectFit: "cover",
                        borderRadius: "8px",
                      }}
                    />
                  ) : (
                    <p className="text-muted">Sin imagen</p>
                  )}
                </div>
              </Form.Group>
            </Col>

            {/* Nueva imagen */}
            <Col xs={12}>
              <Form.Group className="mb-3">
                <Form.Label>Nueva imagen (opcional)</Form.Label>
                <Form.Control
                  type="file"
                  accept="image/*"
                  onChange={manejoCambioArchivoActualizar}
                />
                <Form.Text className="text-muted">
                  Si seleccionas una nueva imagen, reemplazará la actual
                </Form.Text>
              </Form.Group>
            </Col>

            {/* Descripción */}
            <Col xs={12}>
              <Form.Group className="mb-3">
                <Form.Label>Descripción</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="descripcion_producto"
                  value={productoEditar.descripcion_producto || ""}
                  onChange={manejoCambioInputEdicion}
                  placeholder="Descripción del producto (opcional)"
                />
              </Form.Group>
            </Col>

          </Row>
        </Form>
      </Modal.Body>

      <Modal.Footer>
        <Button
          variant="secondary"
          onClick={() => setMostrarModalEdicion(false)}
        >
          Cancelar
        </Button>

        <Button
          variant="primary"
          onClick={handleActualizar}
          disabled={deshabilitado}
        >
          Actualizar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalEdicionProducto;