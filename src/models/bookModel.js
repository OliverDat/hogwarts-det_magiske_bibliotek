const mongoose = require('mongoose');

// Schemaet beskriver felterne og valideringsreglerne for en bog i MongoDB.
const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    author: {
      type: String,
      required: true,
      trim: true
    },
    available: {
      type: Boolean,
      default: true
    },
    borrowedBy: {
      type: String,
      default: null,
      trim: true
    },
    borrowedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Book', bookSchema);