import { test, expect } from '@playwright/test';

test('shows recipe list on page load', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toContainText('Recepthanterare');
  await expect(page.locator('.recipe-card').first()).toBeVisible();
  await expect(page.locator('text=Pasta Carbonara')).toBeVisible();
});

test('can add a new recipe', async ({ page }) => {
  const title = `Testrecept ${Date.now()}`;
  await page.goto('/');

  await page.fill('#title', title);
  await page.fill('#description', 'En beskrivning för testet');
  await page.fill('#ingredients', 'ingrediens1, ingrediens2');
  await page.fill('#servings', '2');
  await page.fill('#cookTime', '10');
  await page.click('#submit-btn');

  await expect(page.locator(`text=${title}`)).toBeVisible();
});

test('can delete a recipe', async ({ page }) => {
  const title = `Radera mig ${Date.now()}`;
  await page.goto('/');

  // Skapa ett recept att radera
  await page.fill('#title', title);
  await page.fill('#description', 'Ska raderas');
  await page.fill('#ingredients', 'x, y');
  await page.fill('#servings', '1');
  await page.fill('#cookTime', '5');
  await page.click('#submit-btn');
  await expect(page.locator(`text=${title}`)).toBeVisible();

  // Radera det
  const card = page.locator(`.recipe-card:has-text("${title}")`);
  await card.locator('button:has-text("Delete")').click();

  await expect(page.locator(`text=${title}`)).not.toBeVisible();
});

test('can edit a recipe', async ({ page }) => {
  const originalTitle = `Redigera mig ${Date.now()}`;
  const updatedTitle = `${originalTitle} UPPDATERAD`;
  await page.goto('/');

  // Skapa ett recept
  await page.fill('#title', originalTitle);
  await page.fill('#description', 'Ska redigeras');
  await page.fill('#ingredients', 'a, b');
  await page.fill('#servings', '3');
  await page.fill('#cookTime', '20');
  await page.click('#submit-btn');
  await expect(page.locator(`text=${originalTitle}`)).toBeVisible();

  // Klicka Edit
  const card = page.locator(`.recipe-card:has-text("${originalTitle}")`);
  await card.locator('button:has-text("Edit")').click();

  // Vänta tills formuläret är i redigeringsläge innan titeln ändras
  await expect(page.locator('#submit-btn')).toHaveText('Spara');
  await page.fill('#title', updatedTitle);
  await page.click('#submit-btn');

  await expect(page.locator(`text=${updatedTitle}`)).toBeVisible();
  await expect(page.locator(`text=${originalTitle}`)).not.toBeVisible();
});
