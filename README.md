# Hogwarts – Det Magiske Bibliotek

### Kom i gang

Før du overhoved kan kører programmet skal du:
lave en mongoDB der heder hogwarts_bibliotek,
med en collection der heder books.

Kør derefter

npm install
node src/app.js

Åbn derefter http://localhost:3000.

Ved opstart oprettes tre startbøger automatisk, hvis de ikke findes.

### API-endpoints

Alle endpoints ligger under /api/books.

GET	/api/books	Hent alle bøger (sorteret efter titel)	200
POST	/api/books	Opret bog. Body: { title, author }	201, 400 ved manglende titel/forfatter
POST	/api/books/:id/borrow	Lån en bog. Body: { studentName }	200, 400 mangler navn, 404 ukendt bog, 409 allerede udlånt

Fejl returneres som { "error": "læsbar besked" }.

### Arkitektur

Projektet er delt på lag, og hvert lag kender kun til laget under sig:

Routes → Controller → Service → Repository → Model (MongoDB)
Lag	Mappe	Ansvar
Routes	src/routes	Kobler URL og HTTP-metode til controller
Controller	src/controllers	Læser request og sender svar med statuskode
Service	src/services	Forretningsregler og validering
Repository	src/repositories	Al databaseadgang (inkl. seeding af startbøger)
Model	src/models	Mongoose-schema for Book
Frontend	src/public	index.html, create.html, public.js, style.css

Fejl kastes i servicelaget med en statuskode og håndteres ét sted i en fælles fejlhandler i src/app.js.

### Tests

Test og Verificerer
GET /api/books	Returnerer bøger med status 200
POST /api/books/:id/borrow (ledig bog)	Bogen lånes, status 200, borrowedBy er sat
POST /api/books/:id/borrow (optaget bog)	Status 409 og beskeden "Bogen er allerede udlånt."
Ugyldigt input	Status 400 med læsbar fejl, og serveren svarer fortsat bagefter

Læring fra code review
Læring fra code review

Skriv her én konkret ting, du lærte af reviewet – hvad blev påpeget, hvad ændrede du, og hvorfor er det bedre?
