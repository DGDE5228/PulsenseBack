require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path'); // <-- agregar path
const Usuario = require('./models/Usuario');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Variables de entorno
const PORT = process.env.PORT;
const MONGODB_URI = process.env.MONGODB_URI;

// Conexión a MongoDB
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Conectado a MongoDB Atlas'))
.catch(err => console.error('Error conectando a MongoDB:', err));

// Ruta de login
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await Usuario.findOne({ username, password });

  if (user) {
    res.json({ success: true, message: 'Login exitoso' });
  } else {
    res.status(401).json({ success: false, message: 'Credenciales incorrectas' });
  }
});
app.use((req, res, next) => {
  console.log(`🔍 Ruta recibida: ${req.method} ${req.url}`);
  next();
});

// Servir archivos estáticos del frontend Ionic (carpeta www)
app.use(express.static(path.join(__dirname, 'www')));

// Para cualquier ruta que no sea /login (o API), devolver index.html para que funcione el frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'www', 'index.html'));
});

// Solo un app.listen, el correcto con la variable PORT
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
