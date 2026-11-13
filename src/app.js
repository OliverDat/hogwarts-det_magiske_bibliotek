require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const bookRoutes = require('./routes/bookRoutes');
const bookRepository = require('./repositories/bookRepository');
const path = require("path");

const app = express();
const port = process.env.PORT || 3000;
const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hogwarts_bibliotek';

// Gør frontend-filerne i src/public tilgængelige fra browseren.
app.use(express.static(path.join(__dirname, 'public')));

// Gør det muligt at modtage JSON-data fra POST-forespørgsler.
app.use(express.json());

// Alle bog-endpoints starter med /api/books.
app.use('/api/books', bookRoutes);

// Fælles fejlhandler for alle routes og services.
app.use((error, req, res, next) => {
  console.error(error);
  const statusCode = error.statusCode || (error.name === 'ValidationError' ? 400 : 500);
  const message = statusCode === 500
    ? 'Der opstod en intern serverfejl.'
    : error.message;
  res.status(statusCode).json({ error: message });
});

async function startServer() {
  // Serveren starter først, når databasen er tilgængelig.
  await mongoose.connect(mongoUri);

  // Opretter de faste startbøger, hvis de ikke allerede findes.
  await bookRepository.seedInitialBooks();

  app.listen(port, () => {
    console.log(`Serveren kører på http://localhost:${port}.`);
  });
}

// Tests kan importere app uden automatisk at starte serveren.
if (require.main === module) {
  startServer().catch((error) => {
    console.error('Serveren kunne ikke starte:', error.message);
    process.exitCode = 1;
  });
}

module.exports = app;