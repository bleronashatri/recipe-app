# Rapport — DevSecOps: Kontinuerlig utveckling och automatiserad testning

## Applikationsbeskrivning

Applikationen är en recepthanterare där användaren kan skapa, läsa, uppdatera och ta bort recept via ett webbgränssnitt. Projektet löser ett vardagligt problem: att samla och organisera recept på ett strukturerat sätt.

Huvudresursen är `Recipe`, med följande fält utöver ID:

| Fält | Typ | Beskrivning |
|---|---|---|
| `title` | string | Receptets namn |
| `description` | string | Kort beskrivning av rätten |
| `ingredients` | string | Kommaseparerade ingredienser |
| `servings` | number | Antal portioner |
| `cookTime` | number | Tillagningstid i minuter |

**Backend** är byggt med Node.js och Express. Data lagras in-memory med fördefinierad seed-data som laddas vid uppstart. Valet att inte använda en riktig databas gjordes medvetet för att hålla applikationen enkel att köra lokalt och i CI utan externa beroenden.

**Frontend** är en single-page application skriven i vanilla JavaScript, servad som en statisk fil från Express. Användaren kan utföra alla fyra CRUD-operationer direkt i gränssnittet, och felmeddelanden visas om ett anrop mot API:et misslyckas.

REST API:et exponerar följande endpoints:

| Metod | Endpoint | Statuskod |
|---|---|---|
| GET | `/api/recipes` | 200 |
| GET | `/api/recipes/:id` | 200 / 404 |
| POST | `/api/recipes` | 201 / 400 |
| PUT | `/api/recipes/:id` | 200 / 404 |
| DELETE | `/api/recipes/:id` | 204 / 404 |

---

## Testning

Tre typer av tester implementerades, en per nivå i testpyramiden.

### Enhetstester — Vitest

Enhetstesterna testar `recipeService.js` som innehåller all affärslogik och datahantering. Modulen är medvetet separerad från Express-routerna så att logiken går att testa utan att starta en HTTP-server.

Totalt 11 tester fördelade på:

- `getAll` — kontrollerar att alla recept returneras och att en ny array returneras (inte en intern referens)
- `getById` — hittar rätt recept på ID, returnerar null för okänt ID
- `create` — skapar recept med korrekt data och ökar totalt antal
- `update` — uppdaterar fält utan att skriva över övriga, returnerar null för okänt ID
- `remove` — tar bort recept och returnerar korrekt boolean, minskar totalt antal

Varje testsvit använder `beforeEach(() => reset())` för att återställa in-memory-datan till seed-tillståndet, vilket gör testerna oberoende av varandra.

### API-tester — Newman (Postman)

Newman-testerna skickar riktiga HTTP-anrop mot servern som körs lokalt och verifierar att API:et svarar korrekt på alla endpoints.

Totalt 7 tester:

- `GET /api/recipes` — statuskod 200, svar är en array med minst ett element
- `GET /api/recipes/1` — statuskod 200, alla förväntade fält finns i svaret
- `GET /api/recipes/99999` — statuskod 404, felmeddelande returneras
- `POST /api/recipes` — statuskod 201, ID tilldelas, titel matchar skickad data
- `POST /api/recipes` (saknade fält) — statuskod 400, felmeddelande returneras
- `PUT /api/recipes/2` — statuskod 200, uppdaterat fält reflekteras i svaret
- `DELETE /api/recipes/:createdId` — statuskod 204

POST-testet sparar det skapade receptets ID i en collection-variabel (`createdId`) som DELETE-testet sedan använder. Det gör att testerna städar upp efter sig och inte skräpar ner datan.

### End-to-end-tester — Playwright

E2E-testerna kör en riktig webbläsare (Chromium) mot applikationen och simulerar faktiska användarinteraktioner.

Totalt 4 tester:

1. **Sidladdning** — kontrollerar att rubriken visas och att receptkort renderas
2. **Skapa recept** — fyller i formuläret och verifierar att det nya receptet syns i listan
3. **Radera recept** — skapar ett recept, raderar det, verifierar att det försvinner
4. **Redigera recept** — skapar ett recept, klickar Edit, byter titel, sparar, verifierar att ny titel syns

Varje test som behöver ett specifikt recept skapar det själv med en tidsstämpel i titeln (`Date.now()`), vilket gör testerna oberoende av varandra och av den data Newman eventuellt har modifierat.

Playwright konfigureras med `reuseExistingServer: true`, vilket innebär att om servern redan körs (som i CI-pipelinen) så startar Playwright ingen ny instans.

---

## Testtäckning och testbarhet

### Vad täcks väl

Affärslogiken i `recipeService.js` täcks grundligt av enhetstesterna — alla exporterade funktioner testas, inklusive felfall. API-testerna täcker samtliga endpoints och verifierar både lyckade anrop och felhantering (400, 404). E2E-testerna täcker de viktigaste användarflödena.

### Vad täcks inte

Express-routerna i `server.js` testas inte direkt med enhetstester. De testas indirekt via Newman och Playwright, men exakt hur routehanterarna mappar anrop till service-funktioner verifieras aldrig isolerat. Om en route innehöll buggig logik utanför service-lagret (t.ex. felaktig statuskod) skulle det inte fångas av enhetstesterna.

Frontendkoden (JavaScript i `index.html`) har inga direkta enhetstester. Logiken för `escapeHtml`, formulärhantering och API-anrop täcks implicit via E2E-testerna, men inte isolerat.

### Vad skulle behövas för full testbarhet

- **Supertest** (eller liknande) skulle möjliggöra enhetstestning av Express-routerna utan att starta en riktig server, vilket skulle täppa till gapet mellan service-lagret och HTTP-lagret.
- Frontendlogiken skulle kunna extraheras till separata `.js`-filer och testas med Vitest + jsdom.
- Vid en riktig databas (t.ex. PostgreSQL) skulle man behöva en separat testdatabas eller ett mock-bibliotek för att undvika att tester påverkar produktionsdata.

Applikationens nuvarande arkitektur — med tydligt separerad affärslogik i `recipeService.js` — gör att den viktigaste koden redan är lätt att testa. Testbarheten är god på backend-sidan.

---

## Pipeline

GitHub Actions-workflowen triggras på alla pushar och pull requests, oavsett branch.

### Steg i ordning

```
checkout → setup Node 20 → npm install
  → unit tests (Vitest)
  → start server i bakgrunden
  → wait-on (väntar tills port 3000 svarar)
  → API tests (Newman)
  → install Playwright browsers (Chromium)
  → E2E tests (Playwright)
```

### Logik och gates

Varje steg är ett implicit gate — om ett steg misslyckas (exit code ≠ 0) avbryts pipelinen och hela jobbet markeras som rött. Det innebär att:

- Enhetstester måste passera innan servern startas
- API-tester måste passera innan E2E-tester körs

Servern startas med `node server.js &` (bakgrundsprocess) och `wait-on` används för att vänta tills servern faktiskt svarar på HTTP innan Newman-testerna körs. Utan `wait-on` skulle API-testerna kunna köra innan servern är redo och ge falska fel.

Playwright konfigureras med `reuseExistingServer: true`, vilket gör att den befintliga serverprocessen återanvänds i stället för att en ny startas.

### Svårigheter och luckor

**Delat serverstate mellan testtyper.** Newman POST-testet skapar ett nytt recept och PUT-testet ändrar ett existerande. Eftersom datan lagras in-memory och servern körs som en enda process under hela pipelinen påverkas E2E-testernas startläge. Problemet löstes genom att E2E-testerna skapar egna recept med unika titlar och inte antar något om listans exakta innehåll.

**Ingen parallellisering.** Alla tre testtyper körs sekventiellt. För ett större projekt hade man kunnat köra unit-testerna parallellt med att servern startas, men för det här projektets storlek är det inte nödvändigt.

**Ingen kodkvalitetskontroll.** Pipelinen kör inga linting-verktyg (t.ex. ESLint). Det är en medveten besparing för att hålla G-kraven, men det hade stärkt kodkvaliteten.

**Ingen säkerhetsskanning.** `npm audit` körs inte i pipelinen. Det är en av VG-kraven och saknas här.

---

## Reflektion

Det som överraskade mig mest under arbetet var hur stor skillnad arkitekturval gör för testbarheten. Att separera `recipeService.js` från `server.js` var ett litet beslut som gjorde enhetstestningen dramatiskt enklare — i stället för att behöva mocka Express fick jag testbara rena funktioner direkt.

E2E-testerna var roligare att skriva än väntat. Playwright är intuitivt och felen man får när ett test misslyckas är tydliga. Att använda `Date.now()` i testdata för att undvika kollisioner mellan tester var en enkel lösning som fungerade väl.

Den svåraste delen var att förstå hur testernas ordning och delat serverstate interagerar i CI. Det är lätt att tester fungerar lokalt men misslyckas i CI om man inte tänker på att miljön är annorlunda — ny process, ingen tidigare state, och alla steg körs i strikt sekvens.

Kursen gav mig en grundläggande förståelse för varför automatiserade tester och CI/CD finns. Innan kursen såg jag tester som "extra arbete" — nu förstår jag att de är det som gör det möjligt att röra sig snabbt utan att vara rädd för regressioner.

Framöver skulle jag vilja lära mig mer om:
- Containerisering med Docker för att reproducera exakta miljöer i CI
- Testning mot riktiga databaser med automatisk setup/teardown
- Code coverage-rapporter och vad en rimlig täckningsgräns är i praktiken
