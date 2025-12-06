import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();


async function main() {
  console.log("🍜 Ajout des recettes vietnamiennes...\n");

  for (const recipe of recipes) {
    const { ingredients, steps, ...recipeData } = recipe;

    const created = await prisma.recipe.create({
      data: {
        ...recipeData,
        ingredients: { create: ingredients },
        steps: { create: steps },
      },
    });

    console.log(`✅ Recette créée: ${created.name} (ID: ${created.id})`);
  }

  console.log("\n🎉 Toutes les recettes ont été ajoutées !");
}

main()
  .catch((e) => {
    console.error("❌ Erreur:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

