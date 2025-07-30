require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const http = require('http');
const WebSocket = require('ws');
const Usuario = require('./models/Usuario');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI;

// WebSocket logic
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

// Rutas API
app.post('/register', async (req, res) => {
  // ... código existente ...
});

app.post('/login', async (req, res) => {
  // ... código existente ...
});

// Servir frontend estático
app.use(express.static(path.join(__dirname, 'www')));

// Catch-all SPA (al final)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'www', 'index.html'));
});

// Iniciar servidor HTTP + WebSocket
server.listen(PORT, () => {
  console.log(`🚀 Backend disponible en https://pulsenseback.onrender.com`);
});
