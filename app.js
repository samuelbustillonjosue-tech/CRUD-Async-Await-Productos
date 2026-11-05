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

//FABRICANTES (BONO)

// DELETE
app.delete('/fabricantes/:id', async (req, res) => {
    const ruta = 'data/fabricantes.json';
    const fabricantes = await redJson(ruta);
    const id = Number(req.params.id);

    const filtroFabricantes = fabricantes.filter(fabricante => fabricante.id !== id);

    if (filtroFabricantes.length !== fabricantes.length) {
        await writeJson(ruta, filtroFabricantes);
        res.status(200).json({status: 200, message: 'Fabricante eliminado con exito'});
    } else {
        res.status(404).json({status: 404, message: 'Fabricante no encontrado'});
    }
});

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});