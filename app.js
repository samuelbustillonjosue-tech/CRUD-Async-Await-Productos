const express = require('express');
const fs = require('fs/promises');
const path = require('path');

const app = express();

app.use(express.json());

// Funcion para leer archivos JSON
async function redJson(ruta) {
    const rutaCompleta = path.join(__dirname, ruta);
    const texto = await fs.readFile(rutaCompleta, 'utf8');
    return JSON.parse(texto);
}

// Funcion para escribir archivos JSON
async function writeJson(ruta, datos) {
    const rutaCompleta = path.join(__dirname, ruta);
    await fs.writeFile(rutaCompleta, JSON.stringify(datos, null, 2));
}

//FABRICANTES (BONO)

// POST: registrar un fabricante nuevo
app.post('/fabricantes', async (req, res) => {
    const ruta = 'data/fabricantes.json';
    const fabricantes = await redJson(ruta);
    const datos = req.body || {};
    const { nombre } = datos;

    if (!nombre || typeof nombre !== 'string' || nombre.trim() === '') {
        return res.status(400).json({
            status: 400,
            message: 'El nombre del fabricante es obligatorio'
        });
    }

    // El nuevo ID es el mayor ID existente + 1
    const nuevoId = fabricantes.length > 0
        ? Math.max(...fabricantes.map(fabricante => fabricante.id)) + 1
        : 1;

    const nuevoFabricante = {
        id: nuevoId,
        ...datos,
        nombre: nombre.trim()
    };
    nuevoFabricante.id = nuevoId; // el ID siempre lo asigna el servidor

    fabricantes.push(nuevoFabricante);
    await writeJson(ruta, fabricantes);

    res.status(201).json({
        status: 201,
        message: 'Fabricante registrado correctamente',
        data: nuevoFabricante
    });
});

// PUT: modificar los datos de un fabricante por su ID
app.put('/fabricantes/:id', async (req, res) => {
    const ruta = 'data/fabricantes.json';
    const fabricantes = await redJson(ruta);
    const id = Number(req.params.id);

    const indice = fabricantes.findIndex(fabricante => fabricante.id === id);

    if (indice === -1) {
        return res.status(404).json({
            status: 404,
            message: 'Fabricante no encontrado'
        });
    }

    const datos = req.body || {};
    const { nombre } = datos;

    if (nombre !== undefined && (typeof nombre !== 'string' || nombre.trim() === '')) {
        return res.status(400).json({
            status: 400,
            message: 'El nombre del fabricante no puede estar vacío'
        });
    }

    fabricantes[indice] = {
        ...fabricantes[indice],
        ...datos,
        id // el ID no se puede cambiar
    };

    if (nombre !== undefined) {
        fabricantes[indice].nombre = nombre.trim();
    }

    await writeJson(ruta, fabricantes);

    res.status(200).json({
        status: 200,
        message: 'Fabricante actualizado correctamente',
        data: fabricantes[indice]
    });
});

// PUT: actualizar un producto por su ID
app.put('/productos/:id', async (req, res) => {
    const ruta = 'data/productos.json';
    const productos = await redJson(ruta);
    const id = Number(req.params.id);

    const indice = productos.findIndex(producto => producto.id === id);

    if (indice === -1) {
        return res.status(404).json({
            status: 404,
            message: 'Producto no encontrado'
        });
    }

     productos[indice] = {
        ...productos[indice],
        ...req.body
    };

    await writeJson(ruta, productos);

    res.status(200).json({
        status: 200,
        message: 'Producto actualizado correctamente',
        data: productos[indice]
    });
});

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});