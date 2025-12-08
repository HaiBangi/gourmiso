import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrateRatings() {
  console.log('🔄 Début de la migration des notes...\n');

  try {
    // 1. Convertir les notes des recettes de 1-10 à 1-5
    console.log('📊 Conversion des notes des recettes (1-10 → 1-5)...');
    const recipes = await prisma.recipe.findMany({
      select: { id: true, rating: true, name: true }
    });

    for (const recipe of recipes) {
      if (recipe.rating > 0) {
        // Convertir de 1-10 à 1-5
        const newRating = Math.round((recipe.rating / 10) * 5);
        await prisma.recipe.update({
          where: { id: recipe.id },
          data: { rating: newRating }
        });
        console.log(`  ✓ "${recipe.name}": ${recipe.rating}/10 → ${newRating}/5`);
      }
    }

    // 2. Calculer la moyenne des notes des commentaires pour chaque recette
    console.log('\n📝 Calcul de la moyenne des notes des commentaires...');
    const recipesWithComments = await prisma.recipe.findMany({
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
    for (const recipe of recipesWithComments) {
      if (recipe.comments.length > 0) {
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
          
          console.log(`  ✓ "${recipe.name}": ${ratings.length} commentaire(s), moyenne = ${roundedAverage}/5`);
          updatedCount++;
        }
      }
    }

    console.log(`\n✅ Migration terminée avec succès !`);
    console.log(`   - ${recipes.length} recettes mises à jour (1-10 → 1-5)`);
    console.log(`   - ${updatedCount} recettes ont leur note recalculée depuis les commentaires`);

  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

migrateRatings()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
