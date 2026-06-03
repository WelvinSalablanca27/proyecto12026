function registroProducto(producto) {
    const {nombre_producto, precio_venta, descripcion_producto, categoria_producto, stock} = producto;

    // Campos obligatorios
    if (!nombre_producto || !precio_venta || !descripcion_producto || !categoria_producto || !stock) {
        return { valido: false, mensaje: "Todos los campos son obligatorios" };
    }

    // Validar nombre
    const regexNombre = /^[a-zA-ZÁÉÍÓÚáéíóúÑñ\s]+$/;
    if (!regexNombre.test(nombre_producto)) {
        return { valido: false, mensaje: "El nombre solo puede contener letras" };
    }

    // Precio Unitario
    if (isNaN(precio_venta) || Number(precio_venta) <= 0) {
        return { valido: false, mensaje: "El precio debe ser un número positivo" };
    }

    // Stock
    if (isNaN(stock) || Number(stock) < 0) {
        return { valido: false, mensaje: "El stock debe ser un número no negativo" };
    }

    // Descripción opcional (solo valida si existe)
    if (descripcion_producto && descripcion_producto.length > 255) {
        return { valido: false, mensaje: "La descripción no puede exceder los 255 caracteres" };
    }

    return { valido: true};
}

module.exports = registroProducto;