const assert = require('node:assert/strict');
const http = require('node:http');
const test = require('node:test');

const app = require('../src/app');
const bookRepository = require('../src/repositories/bookRepository');

// Fast testdata, så testene ikke behøver at bruge en rigtig MongoDB.
const availableBook = {
  _id: '507f1f77bcf86cd799439011',
  title: 'Harry Potter og De Vises Sten',
  author: 'J.K. Rowling',
  available: true
};

// Starter app'en på en ledig port og returnerer en helper til HTTP-kald.
function startTestServer() {
  return new Promise((resolve) => {
    const server = http.createServer(app);
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address();
      resolve({
        server,
        request: (path, options) => fetch(`http://127.0.0.1:${port}${path}`, options)
      });
    });
  });
}

// Lukker den midlertidige testserver efter hver test.
function stopTestServer(server) {
  return new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
}

// Udskifter repository-metoder midlertidigt med kontrollerede testdata.
async function withTestServer(repositoryMethods, callback) {
  const originals = new Map();
  for (const [methodName, implementation] of Object.entries(repositoryMethods)) {
    originals.set(methodName, bookRepository[methodName]);
    bookRepository[methodName] = implementation;
  }

  const { server, request } = await startTestServer();
  try {
    await callback(request);
  } finally {
    await stopTestServer(server);
    for (const [methodName, original] of originals) {
      bookRepository[methodName] = original;
    }
  }
}

test('GET /api/books henter bøger med status 200', async () => {
  await withTestServer(
    {
      findAll: async () => [availableBook]
    },
    async (request) => {
      const response = await request('/api/books');

      assert.equal(response.status, 200);
      assert.deepEqual(await response.json(), [availableBook]);
    }
  );
});

test('POST /api/books/:id/borrow låner en ledig bog med status 200', async () => {
  const borrowedBook = {
    ...availableBook,
    available: false,
    borrowedBy: 'Harry Potter'
  };

  await withTestServer(
    {
      findById: async () => availableBook,
      borrowById: async (id, studentName) => ({
        ...borrowedBook,
        _id: id,
        borrowedBy: studentName
      })
    },
    async (request) => {
      const response = await request(`/api/books/${availableBook._id}/borrow`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ studentName: 'Harry Potter' })
      });

      assert.equal(response.status, 200);
      assert.equal((await response.json()).borrowedBy, 'Harry Potter');
    }
  );
});

test('POST /api/books/:id/borrow afviser en optaget bog med status 409', async () => {
  await withTestServer(
    {
      findById: async () => ({ ...availableBook, available: false }),
      borrowById: async () => null
    },
    async (request) => {
      const response = await request(`/api/books/${availableBook._id}/borrow`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ studentName: 'Ron Weasley' })
      });

      assert.equal(response.status, 409);
      assert.deepEqual(await response.json(), { error: 'Bogen er allerede udlånt.' });
    }
  );
});

test('en brugerfejl giver en læsbar 400-fejl, og serveren svarer fortsat', async () => {
  await withTestServer(
    {
      findAll: async () => []
    },
    async (request) => {
      const invalidResponse = await request(`/api/books/${availableBook._id}/borrow`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({})
      });

      assert.equal(invalidResponse.status, 400);
      assert.deepEqual(await invalidResponse.json(), { error: 'Elevnavn er obligatorisk.' });

      const nextResponse = await request('/api/books');
      assert.equal(nextResponse.status, 200);
      assert.deepEqual(await nextResponse.json(), []);
    }
  );
});