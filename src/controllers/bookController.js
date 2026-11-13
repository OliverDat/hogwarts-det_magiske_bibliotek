const bookService = require('../services/bookService');

// Controlleren modtager HTTP-forespørgslen og sender service-resultatet tilbage.
async function getBooks(req, res, next) {
  try {
    const books = await bookService.getBooks();
    res.status(200).json(books);
  } catch (error) {
    next(error);
  }
}

// Sender data fra request-body videre til service-laget.
async function createBook(req, res, next) {
  try {
    const book = await bookService.createBook(req.body);
    res.status(201).json(book);
  } catch (error) {
    next(error);
  }
}

// Sender bogens id og elevens navn videre til service-laget.
async function borrowBook(req, res, next) {
  try {
    const book = await bookService.borrowBook(req.params.id, req.body && req.body.studentName);
    res.status(200).json(book);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getBooks,
  createBook,
  borrowBook
};