const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: String,
  password: String
}, { collection: 'users' });

module.exports = mongoose.model('User', UserSchema, 'users');

