import { describe, it, expect, beforeEach } from 'vitest';
import { getAll, getById, create, update, remove, reset } from '../../recipeService.js';

beforeEach(() => {
  reset();
});

describe('getAll', () => {
  it('returns all seed recipes', () => {
    const recipes = getAll();
    expect(recipes).toHaveLength(3);
  });

  it('returns a new array (not the internal reference)', () => {
    const a = getAll();
    const b = getAll();
    expect(a).not.toBe(b);
  });
});

describe('getById', () => {
  it('returns the correct recipe by id', () => {
    const recipe = getById(1);
    expect(recipe).not.toBeNull();
    expect(recipe.title).toBe('Pasta Carbonara');
  });

  it('returns null for a non-existent id', () => {
    expect(getById(999)).toBeNull();
  });
});

describe('create', () => {
  it('adds a new recipe and returns it with an id', () => {
    const data = {
      title: 'Pannkakor',
      description: 'Fluffiga pannkakor',
      ingredients: 'mjöl, mjölk, ägg',
      servings: 4,
      cookTime: 20,
    };
    const recipe = create(data);
    expect(recipe.id).toBeDefined();
    expect(recipe.title).toBe('Pannkakor');
  });

  it('increases total recipe count', () => {
    create({ title: 'X', description: 'Y', ingredients: 'Z', servings: 1, cookTime: 1 });
    expect(getAll()).toHaveLength(4);
  });
});

describe('update', () => {
  it('updates an existing recipe and returns it', () => {
    const updated = update(1, { servings: 8 });
    expect(updated.servings).toBe(8);
    expect(updated.title).toBe('Pasta Carbonara');
  });

  it('returns null for a non-existent id', () => {
    expect(update(999, { title: 'Ghost' })).toBeNull();
  });
});

describe('remove', () => {
  it('removes a recipe and returns true', () => {
    const result = remove(1);
    expect(result).toBe(true);
    expect(getById(1)).toBeNull();
  });

  it('returns false for a non-existent id', () => {
    expect(remove(999)).toBe(false);
  });

  it('decreases total recipe count', () => {
    remove(1);
    expect(getAll()).toHaveLength(2);
  });
});
