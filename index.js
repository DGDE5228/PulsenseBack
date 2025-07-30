require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const http = require('http');             // 👈 Agregado
const WebSocket = require('ws');          // 👈 Agregado
const Usuario = require('./models/Usuario');

const app = express();
const server = http.createServer(app);     // 👈 Cambiado: usamos http.createServer
const wss = new WebSocket.Server({ server }); // 👈 Inicia WebSocket sobre el mismo server

const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI;

// 🎯 WebSocket logic
wss.on('connection', (ws) => {
  console.log('🔌 Cliente WebSocket conectado');

  ws.on('message', (msg) => {
    console.log('📩 Mensaje recibido:', msg);
    ws.send('📤 Eco desde servidor: ' + msg);
  });

  ws.on('close', () => {
    console.log('❎ Cliente WebSocket desconectado');
  });
});

app.use(cors({
  origin: 'https://pulsense.onrender.com'
}));

app.use(bodyParser.json());

app.use((req, res, next) => {
  console.log(`🔍 Ruta recibida: ${req.method} ${req.url}`);
  next();
});

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ Conectado a MongoDB Atlas'))
.catch(err => console.error('❌ Error conectando a MongoDB:', err));

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

app.post('/login', async (req, res) => {
  console.log('📥 Petición recibida en /login');
  const { username, password } = req.body;
  console.log('🔑 Credenciales recibidas:', username, password);

  try {
    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Faltan datos' });
    }
    const user = await Usuario.findOne({ username });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Usuario no encontrado' });
    }
    if (user.password !== password) {
      return res.status(401).json({ success: false, message: 'Contraseña incorrecta' });
    }
    return res.status(200).json({ success: true, message: 'Login exitoso', user });
  } catch (err) {
    console.error('❌ Error en /login:', err);
    return res.status(500).json({ success: false, message: 'Error del servidor al iniciar sesión' });
  }
});

// Servir frontend
app.use(express.static(path.join(__dirname, 'www')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'www', 'index.html'));
});

// 🔥 Inicia servidor HTTP + WebSocket
server.listen(PORT, () => {
  console.log(`🚀 Backend disponible en https://pulsenseback.onrender.com`);
});
