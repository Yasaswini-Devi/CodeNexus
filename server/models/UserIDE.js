const mongoose = require('mongoose');

const FileSchema = new mongoose.Schema({
  id: String,
  name: String,
  isFolder: Boolean,
  content: { type: String, default: "" },
  language: String,
});

// Allow recursive structure for folders
FileSchema.add({
  items: [FileSchema] // Validates recursive children
});

const UserIDESchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  files: [FileSchema] // The root array of files/folders
});

module.exports = mongoose.model('UserIDE', UserIDESchema);