# Recepthanterare

En fullstack-webbapplikation för att hantera recept. REST API byggt med Node.js/Express och ett vanilla JS-gränssnitt.

## Beskrivning

Recepthanteraren låter användaren skapa, läsa, uppdatera och ta bort recept. Varje recept har titel, beskrivning, ingredienser, antal portioner och tillagningstid. Data lagras in-memory och återställs vid omstart.

## Kom igång

**Krav:** Node.js 20+

```bash
# Klona repot
git clone <repo-url>
cd recipe-app

# Installera beroenden
npm install

# Starta servern
npm start
```

Öppna sedan [http://localhost:3000](http://localhost:3000) i webbläsaren.

## API-endpoints

| Metod  | Endpoint            | Beskrivning                  |
|--------|---------------------|------------------------------|
| GET    | /api/recipes        | Hämta alla recept            |
| GET    | /api/recipes/:id    | Hämta ett recept             |
| POST   | /api/recipes        | Skapa nytt recept            |
| PUT    | /api/recipes/:id    | Uppdatera ett recept         |
| DELETE | /api/recipes/:id    | Ta bort ett recept           |

### Exempel — skapa recept

```bash
curl -X POST http://localhost:3000/api/recipes \
  -H "Content-Type: application/json" \
  -d '{"title":"Pannkakor","description":"Fluffiga pannkakor","ingredients":"mjöl, mjölk, ägg","servings":4,"cookTime":20}'
```

## Kör tester

```bash
# Enhetstester (Vitest)
npm run test:unit

# API-tester (Newman) — kräver att servern körs
npm start &
npm run test:api

# E2E-tester (Playwright) — startar servern automatiskt
npm run test:e2e

# Installera Playwright-webbläsare (första gången)
npx playwright install chromium
```

## Resursfält

Ett recept (`Recipe`) har följande fält:

| Fält         | Typ    | Beskrivning               |
|--------------|--------|---------------------------|
| id           | number | Auto-genererat ID         |
| title        | string | Receptets namn            |
| description  | string | Kort beskrivning          |
| ingredients  | string | Kommaseparerade ingredienser |
| servings     | number | Antal portioner           |
| cookTime     | number | Tillagningstid i minuter  |
