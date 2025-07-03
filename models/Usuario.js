const mongoose = require('mongoose');

const usuarioSchema = new mongoose.Schema({
  username: String,
  password: String,
});

module.exports = mongoose.model('Usuario', usuarioSchema);
