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

app.use(cors());
app.use(bodyParser.json());

// Log de todas las rutas recibidas (debug)
app.use((req, res, next) => {
  console.log(`🔍 Ruta recibida: ${req.method} ${req.url}`);
  next();
});

// Conexión a MongoDB
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ Conectado a MongoDB Atlas'))
.catch(err => console.error('❌ Error conectando a MongoDB:', err));

// Ruta de login
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await Usuario.findOne({ username, password });
    if (user) {
      res.json({ success: true, message: 'Login exitoso' });
    } else {
      res.status(401).json({ success: false, message: 'Credenciales incorrectas' });
    }
  } catch (err) {
    console.error('❌ Error en login:', err);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

// Si tienes frontend embebido (como archivos Ionic en "www")
//* const wwwPath = path.join(__dirname, 'www');
//if (require('fs').existsSync(wwwPath)) {
 // app.use(express.static(wwwPath));
 // app.get('*', (req, res) => {
 //   res.sendFile(path.join(wwwPath, 'index.html'));
 // });
//}

// Arrancar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
