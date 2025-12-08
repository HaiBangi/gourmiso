import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function recalculateAllRatings() {
  console.log('🔄 Recalcul de toutes les notes des recettes...\n');

  try {
    const recipes = await prisma.recipe.findMany({
      include: {
        comments: {
          where: {
            rating: { not: null }
          },
          select: { rating: true }
        }
      }
    });

    let updatedCount = 0;
    let noCommentsCount = 0;

    for (const recipe of recipes) {
      const ratings = recipe.comments
        .map(c => c.rating)
        .filter((r): r is number => r !== null);

      if (ratings.length > 0) {
        const average = ratings.reduce((sum, r) => sum + r, 0) / ratings.length;
        const roundedAverage = Math.round(average);

        await prisma.recipe.update({
          where: { id: recipe.id },
          data: { rating: roundedAverage }
        });

        console.log(`✓ ${recipe.name}: ${ratings.length} commentaire(s) → Note: ${roundedAverage}/5`);
        updatedCount++;
      } else {
        if (recipe.rating !== 0) {
          await prisma.recipe.update({
            where: { id: recipe.id },
            data: { rating: 0 }
          });
          console.log(`⚠ ${recipe.name}: Aucun commentaire → Note remise à 0`);
          noCommentsCount++;
        }
      }
    }

    console.log(`\n✅ Recalcul terminé !`);
    console.log(`   - ${updatedCount} recettes avec notes recalculées`);
    console.log(`   - ${noCommentsCount} recettes sans commentaires remises à 0`);
    console.log(`   - ${recipes.length - updatedCount - noCommentsCount} recettes déjà à 0`);

  } catch (error) {
    console.error('❌ Erreur:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

recalculateAllRatings()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
