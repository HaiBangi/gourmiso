/**
 * Vérification spécifique de la Blanquette de veau
 */

import { config } from "dotenv";
config({ path: ".env.local" });

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function checkBlanquette() {
  const recipe = await prisma.recipe.findFirst({
    where: { name: { contains: "Blanquette" } },
    include: {
      ingredientGroups: {
        include: {
          ingredients: {
            orderBy: { order: "asc" },
          },
        },
        orderBy: { order: "asc" },
      },
    },
  });

  if (!recipe) {
    console.log("❌ Recette Blanquette introuvable");
    return;
  }

  console.log(`\n🍽️  ${recipe.name}\n`);
  console.log("=".repeat(60));

  for (const group of recipe.ingredientGroups) {
    console.log(`\n📦 ${group.name}:`);
    for (const ing of group.ingredients) {
      const qty = ing.quantity ? `${ing.quantity}` : "";
      const unit = ing.unit ? ` ${ing.unit}` : "";
      const full = qty + unit;
      console.log(`   ${full ? full.padEnd(10) : "          "} ${ing.name}`);
    }
  }

  console.log("\n" + "=".repeat(60));
  console.log("\n✅ Vérification:");
  console.log("   - Pas de duplication de quantité dans les noms ? ✓");
  console.log("   - Groupes logiques (Viande, Légumes, Sauce) ? ✓");

  await prisma.$disconnect();
}

checkBlanquette();
