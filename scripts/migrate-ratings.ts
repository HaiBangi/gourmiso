/**
 * Script de migration pour initialiser ratingSum et ratingCount
 * 
 * À exécuter une seule fois après la migration du schéma :
 * npx tsx scripts/migrate-ratings.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function migrateRatings() {
  console.log("🔄 Migration des ratings...\n");

  // Récupérer toutes les recettes
  const recipes = await prisma.recipe.findMany({
    where: { deletedAt: null },
    select: { id: true, name: true },
  });

  console.log(`📊 ${recipes.length} recettes à migrer\n`);

  let updated = 0;
  let skipped = 0;

  for (const recipe of recipes) {
    // Récupérer les commentaires avec rating
    const comments = await prisma.comment.findMany({
      where: {
        recipeId: recipe.id,
        rating: { not: null },
        deletedAt: null,
      },
      select: { rating: true },
    });

    const ratings = comments.map((c) => c.rating).filter((r): r is number => r !== null);
    const ratingCount = ratings.length;
    const ratingSum = ratings.reduce((sum, r) => sum + r, 0);
    const rating = ratingCount > 0 ? Math.round((ratingSum / ratingCount) * 10) / 10 : 0;

    // Mettre à jour la recette
    await prisma.recipe.update({
      where: { id: recipe.id },
      data: {
        rating,
        ratingCount,
        ratingSum,
      },
    });

    if (ratingCount > 0) {
      console.log(`✅ ${recipe.name}: ${ratingCount} notes, moyenne ${rating}`);
      updated++;
    } else {
      skipped++;
    }
  }

  console.log(`\n🎉 Migration terminée!`);
  console.log(`   - ${updated} recettes avec ratings migrées`);
  console.log(`   - ${skipped} recettes sans ratings\n`);
}

migrateRatings()
  .catch((e) => {
    console.error("❌ Erreur lors de la migration:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
