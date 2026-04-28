import React, { useState } from "react";
import { Form, InputGroup } from "react-bootstrap";

const CuadrosBusquedas = ({ textoBusqueda, manejarCambioBusqueda }) => {
    return (
        <InputGroup style={{ width: "100%", borderRadius: "0.37rem" }} className="shadow-sm">
            <InputGroup.Text>
                <i className="bi bi-search"></i>
            </InputGroup.Text>
            <Form.Control
                type="text"
                placeholder="Buscar..."
                value={textoBusqueda}
                onChange={manejarCambioBusqueda}
            />
        </InputGroup>
    );
};

export default CuadrosBusquedas;