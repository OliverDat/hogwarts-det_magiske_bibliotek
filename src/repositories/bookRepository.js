const Book = require('../models/bookModel');

// Disse bøger indsættes første gang serveren starter.
const initialBooks = [
  {
    title: 'Harry Potter og De Vises Sten',
    author: 'J.K. Rowling',
    available: true
  },
  {
    title: 'Fantastiske Skabninger og Hvor de Findes',
    author: 'Newt Scamander',
    available: true
  },
  {
    title: 'Hogwarts: En Historie',
    author: 'Bathilda Bagshot',
    available: true
  }
];

// Henter bøger sorteret alfabetisk efter titel.
async function findAll() {
  return Book.find().sort({ title: 1 }).lean();
}

// Gemmer en ny bog gennem Mongoose-modellen.
async function create(book) {
  return Book.create(book);
}

// Finder én bog ud fra dens MongoDB-id.
async function findById(id) {
  return Book.findById(id).lean();
}

// Opdaterer kun bogen, hvis den stadig er ledig.
async function borrowById(id, studentName) {
  return Book.findOneAndUpdate(
    { _id: id, available: true },
    {
      $set: {
        available: false,
        borrowedBy: studentName,
        borrowedAt: new Date()
      }
    },
    { new: true, runValidators: true }
  ).lean();
}

// Upsert gør seedingen sikker at køre flere gange.
async function seedInitialBooks() {
  await Promise.all(
    initialBooks.map((book) =>
      Book.updateOne({ title: book.title }, { $setOnInsert: book }, { upsert: true })
    )
  );
}

module.exports = {
  findAll,
  create,
  findById,
  borrowById,
  seedInitialBooks
};