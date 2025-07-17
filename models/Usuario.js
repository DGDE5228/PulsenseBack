const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: String,
  password: String
}, { collection: 'users' }); // ← esto es importante si tu colección no es 'users'

module.exports = mongoose.model('User', UserSchema);
