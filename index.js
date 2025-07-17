require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const Usuario = require('./models/Usuario');
const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI;

// 🧩 Middlewares
app.use(cors());
app.use(bodyParser.json());

// 🕵️ Log de rutas (debug)
app.use((req, res, next) => {
  console.log(`🔍 Ruta recibida: ${req.method} ${req.url}`);
  next();
});

// 🔌 Conexión a MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ Conectado a MongoDB Atlas'))
.catch(err => console.error('❌ Error conectando a MongoDB:', err));

// ✅ Ruta para registrar usuario
app.post('/register', async (req, res) => {
  const { username, password } = req.body;

  try {
    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Faltan datos' });
    }

    const existingUser = await Usuario.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'El usuario ya existe' });
    }

    const newUser = new Usuario({ username, password });
    await newUser.save();

    res.status(201).json({ success: true, message: 'Usuario registrado exitosamente' });
  } catch (err) {
    console.error('❌ Error en /register:', err);
    res.status(500).json({ success: false, message: 'Error del servidor al registrar' });
  }
});

// ✅ Ruta de login
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Faltan datos' });
    }

    const user = await Usuario.findOne({ username, password });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Credenciales incorrectas' });
    }

    // ✅ Siempre devolver objeto bien formado
    return res.json({ success: true, message: 'Login exitoso' });

  } catch (err) {
    console.error('❌ Error en /login:', err);
    return res.status(500).json({ success: false, message: 'Error del servidor al iniciar sesión' });
  }
});


//  Esta línea sirve archivos estáticos (Angular/Ionic build)
app.use(express.static(path.join(__dirname, 'www')));

//  Esto sirve index.html en cualquier ruta no encontrada (SPA support)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'www', 'index.html'));
});
// ▶️ Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
