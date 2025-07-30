require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const http = require('http');
const WebSocket = require('ws'); // <--- Agrega esto
const User = require('./models/Usuario');

const app = express();
const server = http.createServer(app); // ya lo tienes

// 🔌 WebSocket Server
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  console.log('🔌 Cliente WebSocket conectado');

  ws.on('message', (message) => {
    console.log('📩 Mensaje recibido:', message);

    // Opcional: puedes retransmitir el mensaje a todos los clientes conectados
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(`Echo: ${message}`);
      }
    });
  });

  ws.on('close', () => {
    console.log('🔌 Cliente WebSocket desconectado');
  });
});

// Configuración
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI;

const corsOptions = {
  origin: [
    'https://pulsense.onrender.com',
    'capacitor://localhost',
    'http://localhost:8100'
  ],
  methods: ['GET', 'POST'],
  credentials: false
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(bodyParser.json());

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('✅ Conectado a MongoDB'))
  .catch(err => console.error('❌ Error al conectar a MongoDB:', err));

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

// Servir frontend
app.use(express.static(path.join(__dirname, 'www')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'www', 'index.html'));
});

// Iniciar servidor
server.listen(PORT, () => {
  console.log(`🟢 Backend corriendo en https://pulsenseback.onrender.com`);
});
