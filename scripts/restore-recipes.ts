import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const userId = "cmitb2one00005u8u2h28x48k"; // Michel's account

const recipes = [
  {
    name: "Blanquette de veau",
    description: "Un grand classique de la cuisine française, une blanquette de veau onctueuse et réconfortante avec sa sauce crémeuse aux champignons.",
    category: "MAIN_DISH",
    author: "Michel",
    imageUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?w=800",
    preparationTime: 30,
    cookingTime: 120,
    rating: 9,
    servings: 6,
    userId,
    ingredients: [
      { name: "Épaule de veau", quantity: 1.2, unit: "kg" },
      { name: "Carottes", quantity: 4, unit: "pièces" },
      { name: "Oignons", quantity: 2, unit: "pièces" },
      { name: "Champignons de Paris", quantity: 250, unit: "g" },
      { name: "Bouquet garni", quantity: 1, unit: "pièce" },
      { name: "Crème fraîche", quantity: 200, unit: "ml" },
      { name: "Jaunes d'œufs", quantity: 2, unit: "pièces" },
      { name: "Beurre", quantity: 50, unit: "g" },
      { name: "Farine", quantity: 40, unit: "g" },
      { name: "Jus de citron", quantity: 1, unit: "c. à soupe" },
    ],
    steps: [
      { order: 1, text: "Couper le veau en gros cubes et les mettre dans une grande casserole. Couvrir d'eau froide et porter à ébullition." },
      { order: 2, text: "Écumer soigneusement, puis ajouter les carottes coupées en rondelles, les oignons et le bouquet garni." },
      { order: 3, text: "Laisser mijoter à feu doux pendant 1h30 à 2h jusqu'à ce que la viande soit tendre." },
      { order: 4, text: "Pendant ce temps, faire revenir les champignons dans du beurre et réserver." },
      { order: 5, text: "Préparer un roux avec le beurre et la farine, puis mouiller avec le bouillon de cuisson filtré." },
      { order: 6, text: "Mélanger les jaunes d'œufs avec la crème et le jus de citron. Incorporer hors du feu à la sauce." },
      { order: 7, text: "Ajouter la viande et les champignons à la sauce. Servir avec du riz." },
    ],
  },
  {
    name: "Hauts de cuisse au four",
    description: "Des hauts de cuisse de poulet dorés et croustillants, marinés aux herbes et cuits au four pour un repas simple et délicieux.",
    category: "MAIN_DISH",
    author: "Michel",
    imageUrl: "https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=800",
    preparationTime: 15,
    cookingTime: 45,
    rating: 8,
    servings: 4,
    userId,
    ingredients: [
      { name: "Hauts de cuisse de poulet", quantity: 8, unit: "pièces" },
      { name: "Huile d'olive", quantity: 3, unit: "c. à soupe" },
      { name: "Ail", quantity: 4, unit: "gousses" },
      { name: "Thym frais", quantity: 4, unit: "branches" },
      { name: "Romarin", quantity: 2, unit: "branches" },
      { name: "Paprika", quantity: 1, unit: "c. à café" },
      { name: "Sel et poivre", quantity: null, unit: null },
      { name: "Citron", quantity: 1, unit: "pièce" },
    ],
    steps: [
      { order: 1, text: "Préchauffer le four à 200°C." },
      { order: 2, text: "Mélanger l'huile d'olive, l'ail émincé, le paprika, le sel et le poivre dans un bol." },
      { order: 3, text: "Badigeonner les hauts de cuisse avec ce mélange et les disposer dans un plat allant au four." },
      { order: 4, text: "Ajouter les branches de thym et de romarin, ainsi que des quartiers de citron." },
      { order: 5, text: "Enfourner pendant 40-45 minutes jusqu'à ce que la peau soit dorée et croustillante." },
      { order: 6, text: "Servir chaud avec des pommes de terre rôties ou une salade verte." },
    ],
  },
  {
    name: "Omelette aux fines herbes",
    description: "Une omelette classique et moelleuse, parfumée aux fines herbes fraîches. Simple mais délicieuse.",
    category: "MAIN_DISH",
    author: "Michel",
    imageUrl: "https://images.unsplash.com/photo-1510693206972-df098062cb71?w=800",
    preparationTime: 5,
    cookingTime: 5,
    rating: 7,
    servings: 2,
    userId,
    ingredients: [
      { name: "Œufs", quantity: 4, unit: "pièces" },
      { name: "Beurre", quantity: 20, unit: "g" },
      { name: "Ciboulette", quantity: 2, unit: "c. à soupe" },
      { name: "Persil", quantity: 1, unit: "c. à soupe" },
      { name: "Cerfeuil", quantity: 1, unit: "c. à soupe" },
      { name: "Sel et poivre", quantity: null, unit: null },
      { name: "Crème fraîche (optionnel)", quantity: 1, unit: "c. à soupe" },
    ],
    steps: [
      { order: 1, text: "Battre les œufs dans un bol avec une pincée de sel et de poivre." },
      { order: 2, text: "Ciseler finement les herbes fraîches et les incorporer aux œufs." },
      { order: 3, text: "Faire fondre le beurre dans une poêle antiadhésive à feu moyen." },
      { order: 4, text: "Verser les œufs et remuer doucement avec une spatule pendant 30 secondes." },
      { order: 5, text: "Laisser cuire sans remuer jusqu'à ce que le dessous soit pris mais le dessus encore baveux." },
      { order: 6, text: "Plier l'omelette en deux et la faire glisser sur une assiette. Servir immédiatement." },
    ],
  },
];

async function main() {
  console.log("🍳 Restauration des recettes...");

  for (const recipe of recipes) {
    const { ingredients, steps, ...recipeData } = recipe;

    const created = await prisma.recipe.create({
      data: {
        ...recipeData,
        ingredients: {
          create: ingredients,
        },
        steps: {
          create: steps,
        },
      },
    });

    console.log(`✅ Recette créée: ${recipe.name} (ID: ${created.id})`);
  }

  console.log("🎉 Restauration terminée!");
}

main()
  .catch((e) => {
    console.error("❌ Erreur:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

