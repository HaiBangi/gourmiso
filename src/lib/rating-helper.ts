import { db } from "./db";

/**
 * Recalcule la note moyenne d'une recette basée sur les commentaires
 * Utilise ratingSum et ratingCount pour éviter les calculs AVG() coûteux
 * @param recipeId - ID de la recette
 * @returns La nouvelle note moyenne (0-10 avec décimales) ou 0 si aucun commentaire avec note
 */
export async function updateRecipeRating(recipeId: number): Promise<number> {
  const comments = await db.comment.findMany({
    where: {
      recipeId,
      rating: { not: null },
      deletedAt: null, // Exclure les commentaires soft-deleted
    },
    select: {
      rating: true
    }
  });

  const ratings = comments.map(c => c.rating).filter((r): r is number => r !== null);
  const ratingCount = ratings.length;
  const ratingSum = ratings.reduce((sum, r) => sum + r, 0);
  const rating = ratingCount > 0 ? Math.round((ratingSum / ratingCount) * 10) / 10 : 0;

  // Mettre à jour la recette avec les valeurs calculées
  await db.recipe.update({
    where: { id: recipeId },
    data: {
      rating,
      ratingCount,
      ratingSum,
    }
  });

  return rating;
}
