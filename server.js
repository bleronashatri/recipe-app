import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import * as recipeService from './recipeService.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// GET all recipes
app.get('/api/recipes', (req, res) => {
  res.json(recipeService.getAll());
});

// GET single recipe
app.get('/api/recipes/:id', (req, res) => {
  const recipe = recipeService.getById(req.params.id);
  if (!recipe) return res.status(404).json({ error: 'Recept hittades inte' });
  res.json(recipe);
});

// POST create recipe
app.post('/api/recipes', (req, res) => {
  const { title, description, ingredients, servings, cookTime } = req.body;
  if (!title || !description || !ingredients || !servings || !cookTime) {
    return res.status(400).json({ error: 'Alla fält är obligatoriska' });
  }
  const recipe = recipeService.create({
    title,
    description,
    ingredients,
    servings: Number(servings),
    cookTime: Number(cookTime),
  });
  res.status(201).json(recipe);
});

// PUT update recipe
app.put('/api/recipes/:id', (req, res) => {
  const recipe = recipeService.update(req.params.id, req.body);
  if (!recipe) return res.status(404).json({ error: 'Recept hittades inte' });
  res.json(recipe);
});

// DELETE recipe
app.delete('/api/recipes/:id', (req, res) => {
  const deleted = recipeService.remove(req.params.id);
  if (!deleted) return res.status(404).json({ error: 'Recept hittades inte' });
  res.status(204).send();
});

const PORT = process.env.PORT || 3000;

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}
