const registroProducto = require('./registroProducto');

console.log('Prueba 1: El producto no se reistra con campos vacíos');
describe("Validacion de producto", () => {
    it("No permite campos vacíos", () => {
        const producto = {
            nombre_producto: "",
            precio_venta: 0,
            descripcion_producto: "",
            categoria_producto: "",
            stock: 0
        };
        const resultado = registroProducto(producto);
        expect(resultado.valido).toBe(false);
        expect(resultado.mensaje).toBe("Todos los campos son obligatorios");
    });

    console.log('Prueba 2: El precio del producto no puede ser negativo');
    it("Debe rechazar precios negativos", () => {
        const producto = {
            nombre_producto: "Martillo",
            precio_venta: -10,
            descripcion_producto: "Descripción del Martillo",
            categoria_producto: "1",
            stock: 10
        };
        const resultado = registroProducto(producto);
        expect(resultado.valido).toBe(false);
        expect(resultado.mensaje).toBe("El precio debe ser un número positivo");
    });

    console.log('Prueba 3: El stock del producto debe ser mayor a cero');
    it("No permite stock negativo", () => {
        const producto = {
            nombre_producto: "Martillo",
            precio_venta: 10,
            descripcion_producto: "Descripción del Martillo",
            categoria_producto: "1",
            stock: -5
        };
        const resultado = registroProducto(producto);
        expect(resultado.valido).toBe(false);
        expect(resultado.mensaje).toBe("El stock debe ser un número no negativo");
    });

    console.log('Prueba 4: Descripcion del producto extensa');
    it("No permite descripciones mayores a 255 caracteres", () => {
        const producto = {
            nombre_producto: "Martillo",
            precio_venta: 10,
            descripcion_producto: "a".repeat(256), // 256 caracteres
            categoria_producto: "1",
            stock: 10
        };
        const resultado = registroProducto(producto);
        expect(resultado.valido).toBe(false);
        expect(resultado.mensaje).toBe("La descripción no puede exceder los 255 caracteres");
    });

    console.log('Prueba 5: El producto se registra correctamente');
    it("Agregar producto válido", () => {
        const producto = {
            nombre_producto: "Martillo",
            precio_venta: 10,
            descripcion_producto: "Descripción del Martillo",
            categoria_producto: "1",
            stock: 10
        };
        const resultado = registroProducto(producto);
        expect(resultado.valido).toBe(true);
    });
});
