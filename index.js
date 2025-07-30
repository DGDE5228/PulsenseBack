require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const http = require('http');
const WebSocket = require('ws');
const User = require('./models/User');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI;

// Conexión a MongoDB
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('✅ Conectado a MongoDB'))
  .catch(err => console.error('❌ Error al conectar a MongoDB:', err));

// WebSocket
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

// CORS
app.use(cors({
  origin: 'https://pulsense.onrender.com'
}));

// Body Parser
app.use(bodyParser.json());

// Registro
app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Campos requeridos' });
  }

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'Usuario ya existe' });
    }

    const nuevoUsuario = new User({ username, password });
    await nuevoUsuario.save();

    res.status(201).json({ success: true, message: 'Usuario registrado' });
  } catch (error) {
    console.error('❌ Error al registrar:', error);
    res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
});


// Login
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Campos requeridos' });
  }

  try {
    const user = await User.findOne({ username });

    if (!user || user.password !== password) {
      return res.status(401).json({ success: false, message: 'Credenciales incorrectas' });
    }

    res.status(200).json({ success: true, message: 'Inicio de sesión exitoso' });
  } catch (error) {
    console.error('❌ Error en login:', error);
    res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
});


// Servir frontend (si aplica)
app.use(express.static(path.join(__dirname, 'www')));

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'www', 'index.html'));
});

// Iniciar servidor
server.listen(PORT, () => {
  console.log(`🚀 Backend disponible en https://pulsenseback.onrender.com`);
});
