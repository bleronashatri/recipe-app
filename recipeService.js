let recipes = [
  {
    id: 1,
    title: 'Pasta Carbonara',
    description: 'Klassisk italiensk pastarat med krämig ägg- och baconssås.',
    ingredients: 'pasta, ägg, bacon, parmesan, svartpeppar',
    servings: 4,
    cookTime: 25,
  },
  {
    id: 2,
    title: 'Chicken Tikka Masala',
    description: 'Krämig indisk curry med saftig kyckling i tomatsås.',
    ingredients: 'kyckling, tomater, grädde, lök, kryddor',
    servings: 6,
    cookTime: 45,
  },
  {
    id: 3,
    title: 'Avokadotoast',
    description: 'Enkel och nyttig frukost med mosad avokado på rostat bröd.',
    ingredients: 'bröd, avokado, citron, salt, chiliflingor',
    servings: 1,
    cookTime: 5,
  },
];

let nextId = 4;

const seedData = () => [
  {
    id: 1,
    title: 'Pasta Carbonara',
    description: 'Klassisk italiensk pastarat med krämig ägg- och baconssås.',
    ingredients: 'pasta, ägg, bacon, parmesan, svartpeppar',
    servings: 4,
    cookTime: 25,
  },
  {
    id: 2,
    title: 'Chicken Tikka Masala',
    description: 'Krämig indisk curry med saftig kyckling i tomatsås.',
    ingredients: 'kyckling, tomater, grädde, lök, kryddor',
    servings: 6,
    cookTime: 45,
  },
  {
    id: 3,
    title: 'Avokadotoast',
    description: 'Enkel och nyttig frukost med mosad avokado på rostat bröd.',
    ingredients: 'bröd, avokado, citron, salt, chiliflingor',
    servings: 1,
    cookTime: 5,
  },
];

export function getAll() {
  return [...recipes];
}

export function getById(id) {
  return recipes.find((r) => r.id === Number(id)) || null;
}

export function create(data) {
  const recipe = { id: nextId++, ...data };
  recipes.push(recipe);
  return recipe;
}

export function update(id, data) {
  const index = recipes.findIndex((r) => r.id === Number(id));
  if (index === -1) return null;
  recipes[index] = { ...recipes[index], ...data };
  return recipes[index];
}

export function remove(id) {
  const index = recipes.findIndex((r) => r.id === Number(id));
  if (index === -1) return false;
  recipes.splice(index, 1);
  return true;
}

export function reset() {
  recipes = seedData();
  nextId = 4;
}
