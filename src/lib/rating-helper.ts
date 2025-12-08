import { db } from "./db";

/**
 * Recalcule la note moyenne d'une recette basée sur les commentaires
 * @param recipeId - ID de la recette
 * @returns La nouvelle note moyenne (0-10 avec décimales) ou 0 si aucun commentaire avec note
 */
export async function updateRecipeRating(recipeId: number): Promise<number> {
  const comments = await db.comment.findMany({
    where: {
      recipeId,
      rating: { not: null }
    },
    select: {
      rating: true
    }
  });

  if (comments.length === 0) {
    // Aucun commentaire avec note, remettre à 0
    await db.recipe.update({
      where: { id: recipeId },
      data: { rating: 0 }
    });
    return 0;
  }

  // Calculer la moyenne avec 1 décimale
  const ratings = comments.map(c => c.rating).filter((r): r is number => r !== null);
  const average = ratings.reduce((sum, r) => sum + r, 0) / ratings.length;
  const roundedAverage = Math.round(average * 10) / 10; // Arrondir à 1 décimale

  // Mettre à jour la recette
  await db.recipe.update({
    where: { id: recipeId },
    data: { rating: roundedAverage }
  });

  return roundedAverage;
}
