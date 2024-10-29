const express = require('express');
const path = require('path');
const { db } = require('./firebase-config'); // Importa la configuración de Firebase

const app = express();
const port = 8092;

// Middleware para parsear JSON
app.use(express.json());

// Servir archivos estáticos
app.use(express.static(path.join(__dirname)));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html')); // Sirve el archivo HTML
});

// Obtener la lista de registros de salud
app.get('/lista-salud', async (req, res) => {
    try {
        const registros = await db.collection('salud').get();
        const items = registros.docs.map(doc => ({ id: doc.id, ...doc.data() })); // Incluye ID del documento
        res.status(200).json({ data: { items } });
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener los registros de salud', error: error.message });
    }
});

// Agregar un nuevo registro de salud
app.post('/agregar-salud', async (req, res) => {
    try {
        const nuevoRegistro = req.body;
        const existing = await db.collection('salud').doc(nuevoRegistro.id).get();
        if (existing.exists) {
            return res.status(400).json({ message: 'ID personalizado ya existe' });
        }
        await db.collection('salud').doc(nuevoRegistro.id).set(nuevoRegistro);
        res.status(201).json(nuevoRegistro);
    } catch (error) {
        res.status(500).json({ message: 'Error al agregar el registro de salud', error: error.message });
    }
});

// Obtener los detalles de un registro de salud
app.get('/detalle-salud/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const registroRef = db.collection('salud').doc(id);
        const registro = await registroRef.get();
        if (!registro.exists) {
            return res.status(404).json({ message: 'Registro no encontrado' });
        }
        res.status(200).json(registro.data());
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener el registro de salud', error: error.message });
    }
});

// Eliminar un registro de salud
app.delete('/eliminar-salud/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const registroRef = db.collection('salud').doc(id);
        const registro = await registroRef.get();
        if (!registro.exists) {
            return res.status(404).json({ message: 'Registro no encontrado' });
        }
        await registroRef.delete();
        res.status(200).json({ message: 'Registro eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar el registro de salud', error: error.message });
    }
});

app.listen(port, () => {
  console.log('Microservicio Salud escuchando en localhost:' + port);
});
