const mongoose = require('mongoose');
const bookRepository = require('../repositories/bookRepository');

// Opretter fejl med en HTTP-status, som app.js kan bruge i fejlhandleren.
function createError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

async function getBooks() {
  return bookRepository.findAll();
}

// Validerer titel og forfatter, før bogen gemmes.
async function createBook(book) {
  if (!book || typeof book.title !== 'string' || !book.title.trim()) {
    throw createError('Bogtitel er obligatorisk.', 400);
  }

  if (!book.author || typeof book.author !== 'string' || !book.author.trim()) {
    throw createError('Forfatter er obligatorisk.', 400);
  }

  return bookRepository.create({
    title: book.title.trim(),
    author: book.author.trim()
  });
}

// Kontrollerer input og sikrer, at kun ledige bøger kan lånes.
async function borrowBook(id, studentName) {
  if (!studentName || typeof studentName !== 'string' || !studentName.trim()) {
    throw createError('Elevnavn er obligatorisk.', 400);
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw createError('Bogen blev ikke fundet.', 404);
  }

  const book = await bookRepository.findById(id);
  if (!book) {
    throw createError('Bogen blev ikke fundet.', 404);
  }

  const borrowedBook = await bookRepository.borrowById(id, studentName.trim());
  if (!borrowedBook) {
    throw createError('Bogen er allerede udlånt.', 409);
  }

  return borrowedBook;
}

module.exports = {
  getBooks,
  createBook,
  borrowBook
};