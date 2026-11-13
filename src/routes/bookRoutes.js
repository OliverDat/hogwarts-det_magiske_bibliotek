const express = require('express');
const bookController = require('../controllers/bookController');

const router = express.Router();

// Hent alle bøger.
router.get('/', bookController.getBooks);

// Opret en ny bog.
router.post('/', bookController.createBook);

// Lån bogen med det angivne MongoDB-id.
router.post('/:id/borrow', bookController.borrowBook);

module.exports = router;