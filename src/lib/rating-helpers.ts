/**
 * Rating Helper - Gestion centralisée et optimisée des notes de recettes
 * 
 * Utilise ratingSum et ratingCount pour éviter les calculs AVG() coûteux
 * et garantir la cohérence des données.
 */

import { db } from "./db";

/**
 * Mettre à jour le rating d'une recette après ajout d'un commentaire noté
 * @param recipeId - ID de la recette
 * @param newRating - Nouvelle note à ajouter (0-10)
 */
export async function addRatingToRecipe(recipeId: number, newRating: number): Promise<void> {
  await db.recipe.update({
    where: { id: recipeId },
    data: {
      ratingSum: { increment: newRating },
      ratingCount: { increment: 1 },
      rating: {
        set: await calculateNewAverageAfterAdd(recipeId, newRating),
      },
    },
  });
}

/**
 * Mettre à jour le rating d'une recette après modification d'un commentaire noté
 * @param recipeId - ID de la recette
 * @param oldRating - Ancienne note
 * @param newRating - Nouvelle note
 */
export async function updateRatingOnRecipe(
  recipeId: number,
  oldRating: number,
  newRating: number
): Promise<void> {
  const recipe = await db.recipe.findUnique({
    where: { id: recipeId },
    select: { ratingSum: true, ratingCount: true },
  });

  if (!recipe || recipe.ratingCount === 0) return;

  const newSum = recipe.ratingSum - oldRating + newRating;
  const newAverage = newSum / recipe.ratingCount;

  await db.recipe.update({
    where: { id: recipeId },
    data: {
      ratingSum: newSum,
      rating: Math.round(newAverage * 10) / 10, // Arrondir à 1 décimale
    },
  });
}

/**
 * Mettre à jour le rating d'une recette après suppression d'un commentaire noté
 * @param recipeId - ID de la recette
 * @param removedRating - Note à retirer
 */
export async function removeRatingFromRecipe(recipeId: number, removedRating: number): Promise<void> {
  const recipe = await db.recipe.findUnique({
    where: { id: recipeId },
    select: { ratingSum: true, ratingCount: true },
  });

  if (!recipe || recipe.ratingCount === 0) return;

  const newCount = recipe.ratingCount - 1;
  const newSum = recipe.ratingSum - removedRating;
  const newAverage = newCount > 0 ? newSum / newCount : 0;

  await db.recipe.update({
    where: { id: recipeId },
    data: {
      ratingSum: Math.max(0, newSum),
      ratingCount: Math.max(0, newCount),
      rating: Math.round(newAverage * 10) / 10,
    },
  });
}

/**
 * Recalculer complètement le rating d'une recette depuis les commentaires
 * Utile pour corriger des incohérences ou après une migration
 * @param recipeId - ID de la recette
 */
export async function recalculateRecipeRating(recipeId: number): Promise<void> {
  const comments = await db.comment.findMany({
    where: {
      recipeId,
      rating: { not: null },
      deletedAt: null, // Ignorer les commentaires soft-deleted
    },
    select: { rating: true },
  });

  const validRatings = comments.filter((c) => c.rating !== null).map((c) => c.rating as number);
  const ratingCount = validRatings.length;
  const ratingSum = validRatings.reduce((sum, r) => sum + r, 0);
  const rating = ratingCount > 0 ? ratingSum / ratingCount : 0;

  await db.recipe.update({
    where: { id: recipeId },
    data: {
      ratingCount,
      ratingSum,
      rating: Math.round(rating * 10) / 10,
    },
  });
}

/**
 * Recalculer les ratings de toutes les recettes
 * À utiliser uniquement lors de migrations ou corrections massives
 */
export async function recalculateAllRecipeRatings(): Promise<{ updated: number }> {
  const recipes = await db.recipe.findMany({
    where: { deletedAt: null },
    select: { id: true },
  });

  let updated = 0;
  for (const recipe of recipes) {
    await recalculateRecipeRating(recipe.id);
    updated++;
  }

  return { updated };
}

// Helper interne pour calculer la nouvelle moyenne après ajout
async function calculateNewAverageAfterAdd(recipeId: number, newRating: number): Promise<number> {
  const recipe = await db.recipe.findUnique({
    where: { id: recipeId },
    select: { ratingSum: true, ratingCount: true },
  });

  if (!recipe) return newRating;

  const newSum = recipe.ratingSum + newRating;
  const newCount = recipe.ratingCount + 1;
  return Math.round((newSum / newCount) * 10) / 10;
}
