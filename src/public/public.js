const API_URL = '/api/books';

const bookList = document.getElementById('book-list');
const createBookForm = document.getElementById('create-book-form');
const borrowingForm = document.getElementById('borrowing-form');
const bookSelect = document.getElementById('bookId');
const message = document.getElementById('message');

// Viser en succes- eller fejlbesked på den aktuelle side.
function showMessage(text, isError = false) {
    if (!message) {
        return;
    }

    message.textContent = text;
    message.className = isError ? 'error' : 'success';
}

// Henter bøger og opdaterer både boglisten og dropdown-menuen.
async function getBooks() {
    try {
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error('Kunne ikke hente bøger.');
        }

        const books = await response.json();

        if (bookList) {
            bookList.innerHTML = '';

            if (books.length === 0) {
                bookList.textContent = 'Der er ingen bøger i biblioteket endnu.';
                return;
            }

            books.forEach((book) => {
                const bookCard = document.createElement('article');
                bookCard.className = 'book-card';

                const title = document.createElement('h3');
                title.textContent = book.title;

                const author = document.createElement('p');
                author.textContent = `Forfatter: ${book.author}`;

                const status = document.createElement('p');
                status.textContent = book.available
                    ? 'Status: Ledig'
                    : `Status: Udlånt til ${book.borrowedBy}`;

                bookCard.append(title, author, status);

                if (book.available) {
                    const borrowButton = document.createElement('button');
                    borrowButton.textContent = 'Lån bog';

                    borrowButton.addEventListener('click', () => {
                        borrowBook(book._id);
                    });

                    bookCard.appendChild(borrowButton);
                }

                bookList.appendChild(bookCard);
            });
        }

        if (bookSelect) {
            bookSelect.innerHTML = '<option value="">Vælg en bog</option>';

            books
                .filter((book) => book.available)
                .forEach((book) => {
                    const option = document.createElement('option');
                    option.value = book._id;
                    option.textContent = `${book.title} - ${book.author}`;
                    bookSelect.appendChild(option);
                });
        }
    } catch (error) {
        showMessage(error.message, true);
        console.error(error);
    }
}

// Sender formularens titel og forfatter til API'et.
async function createBook(event) {
    event.preventDefault();

    const title = document.getElementById('title').value.trim();
    const author = document.getElementById('author').value.trim();

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ title, author })
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || 'Kunne ikke oprette bogen.');
        }

        showMessage('Bogen blev oprettet.');

        createBookForm.reset();

        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    } catch (error) {
        showMessage(error.message, true);
        console.error(error);
    }
}

// Låner en bog via knappen på bogkortet.
async function borrowBook(bookId) {
    const studentName = window.prompt('Skriv dit navn:');

    if (!studentName || !studentName.trim()) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/${bookId}/borrow`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                studentName: studentName.trim()
            })
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || 'Kunne ikke låne bogen.');
        }

        showMessage('Bogen er nu lånt.');
        await getBooks();
    } catch (error) {
        showMessage(error.message, true);
        console.error(error);
    }
}

// Låner en bog via den separate låneformular.
async function borrowFromForm(event) {
    event.preventDefault();

    const selectedBookId = bookSelect.value;
    const studentName = document.getElementById('studentName').value.trim();

    if (!selectedBookId || !studentName) {
        showMessage('Vælg en bog og skriv dit navn.', true);
        return;
    }

    try {
        const response = await fetch(`${API_URL}/${selectedBookId}/borrow`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                studentName
            })
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || 'Kunne ikke låne bogen.');
        }

        showMessage('Bogen er nu lånt.');
        borrowingForm.reset();
        await getBooks();
    } catch (error) {
        showMessage(error.message, true);
        console.error(error);
    }
}

// Registrer kun listeners på sider, hvor de tilhørende formularer findes.
if (createBookForm) {
    createBookForm.addEventListener('submit', createBook);
}

if (borrowingForm) {
    borrowingForm.addEventListener('submit', borrowFromForm);
}

getBooks();