/**
 * Affiche un résumé des groupes d'ingrédients créés
 */

import { config } from "dotenv";
config({ path: ".env.local" });

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function showMigrationResults() {
  console.log("📊 Résumé de la migration des groupes d'ingrédients\n");
  console.log("=".repeat(80));

  const recipes = await prisma.recipe.findMany({
    include: {
      ingredientGroups: {
        include: {
          ingredients: true,
        },
        orderBy: { order: "asc" },
      },
    },
    orderBy: { name: "asc" },
  });

  const recipesWithGroups = recipes.filter((r) => r.ingredientGroups.length > 0);
  const recipesWithoutGroups = recipes.filter((r) => r.ingredientGroups.length === 0);

  console.log(`\n✅ ${recipesWithGroups.length} recettes avec groupes d'ingrédients`);
  console.log(`⏭️  ${recipesWithoutGroups.length} recettes sans groupes (ingrédients simples)`);
  console.log("\n" + "=".repeat(80));

  console.log("\n📝 Détails des recettes avec groupes:\n");

  for (const recipe of recipesWithGroups) {
    console.log(`\n🍽️  ${recipe.name}`);
    console.log(`   ${recipe.ingredientGroups.length} groupe(s):`);

    for (const group of recipe.ingredientGroups) {
      console.log(`   📦 ${group.name} (${group.ingredients.length} ingrédients)`);
      for (const ing of group.ingredients) {
        const qty = ing.quantity ? `${ing.quantity}${ing.unit ? " " + ing.unit : ""}` : "";
        console.log(`      - ${qty} ${ing.name}`.trim());
      }
    }
  }

  await prisma.$disconnect();
}

showMigrationResults()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Erreur:", error);
    process.exit(1);
  });
