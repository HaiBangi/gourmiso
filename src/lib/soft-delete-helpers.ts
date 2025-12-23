/**
 * Soft Delete Helper - Gestion centralisée de la suppression douce
 * 
 * Permet la restauration des données et la conformité RGPD.
 * Les entités ne sont pas réellement supprimées, juste marquées avec deletedAt.
 */

import { db } from "./db";

// ==================== RECIPE ====================

/**
 * Soft delete une recette
 */
export async function softDeleteRecipe(recipeId: number): Promise<void> {
  await db.recipe.update({
    where: { id: recipeId },
    data: { deletedAt: new Date() },
  });
}

/**
 * Restaurer une recette soft-deleted
 */
export async function restoreRecipe(recipeId: number): Promise<void> {
  await db.recipe.update({
    where: { id: recipeId },
    data: { deletedAt: null },
  });
}

/**
 * Supprimer définitivement une recette (hard delete)
 * À utiliser uniquement par les admins pour purger les anciennes données
 */
export async function hardDeleteRecipe(recipeId: number): Promise<void> {
  await db.recipe.delete({
    where: { id: recipeId },
  });
}

/**
 * Lister les recettes supprimées (pour restauration admin)
 */
export async function listDeletedRecipes(limit = 50) {
  return db.recipe.findMany({
    where: { deletedAt: { not: null } },
    orderBy: { deletedAt: "desc" },
    take: limit,
    select: {
      id: true,
      name: true,
      category: true,
      deletedAt: true,
      user: { select: { pseudo: true, email: true } },
    },
  });
}

// ==================== COMMENT ====================

/**
 * Soft delete un commentaire
 */
export async function softDeleteComment(commentId: number): Promise<void> {
  await db.comment.update({
    where: { id: commentId },
    data: { deletedAt: new Date() },
  });
}

/**
 * Restaurer un commentaire soft-deleted
 */
export async function restoreComment(commentId: number): Promise<void> {
  await db.comment.update({
    where: { id: commentId },
    data: { deletedAt: null },
  });
}

/**
 * Hard delete un commentaire
 */
export async function hardDeleteComment(commentId: number): Promise<void> {
  await db.comment.delete({
    where: { id: commentId },
  });
}

// ==================== WEEKLY MEAL PLAN ====================

/**
 * Soft delete un menu hebdomadaire
 */
export async function softDeleteMealPlan(planId: number): Promise<void> {
  await db.weeklyMealPlan.update({
    where: { id: planId },
    data: { deletedAt: new Date() },
  });
}

/**
 * Restaurer un menu hebdomadaire soft-deleted
 */
export async function restoreMealPlan(planId: number): Promise<void> {
  await db.weeklyMealPlan.update({
    where: { id: planId },
    data: { deletedAt: null },
  });
}

/**
 * Lister les menus supprimés d'un utilisateur
 */
export async function listDeletedMealPlans(userId: string, limit = 20) {
  return db.weeklyMealPlan.findMany({
    where: {
      userId,
      deletedAt: { not: null },
    },
    orderBy: { deletedAt: "desc" },
    take: limit,
    select: {
      id: true,
      name: true,
      weekStart: true,
      deletedAt: true,
    },
  });
}

// ==================== USER (RGPD) ====================

/**
 * Soft delete un utilisateur (RGPD - droit à l'oubli)
 * Anonymise également les données personnelles
 */
export async function softDeleteUser(userId: string): Promise<void> {
  await db.user.update({
    where: { id: userId },
    data: {
      deletedAt: new Date(),
      // Anonymisation des données personnelles
      name: "[Utilisateur supprimé]",
      pseudo: "Anonyme",
      image: null,
      // On garde l'email pour éviter les doublons mais on peut le hasher si nécessaire
    },
  });
}

/**
 * Restaurer un utilisateur soft-deleted (rare, mais utile pour admin)
 */
export async function restoreUser(userId: string): Promise<void> {
  await db.user.update({
    where: { id: userId },
    data: { deletedAt: null },
  });
}

// ==================== PURGE (ADMIN ONLY) ====================

/**
 * Purger les données soft-deleted de plus de X jours
 * À utiliser via un cron job ou manuellement par admin
 */
export async function purgeOldDeletedData(daysOld = 90): Promise<{
  recipes: number;
  comments: number;
  mealPlans: number;
}> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  // Supprimer les recettes soft-deleted depuis plus de X jours
  const deletedRecipes = await db.recipe.deleteMany({
    where: {
      deletedAt: {
        not: null,
        lt: cutoffDate,
      },
    },
  });

  // Supprimer les commentaires soft-deleted depuis plus de X jours
  const deletedComments = await db.comment.deleteMany({
    where: {
      deletedAt: {
        not: null,
        lt: cutoffDate,
      },
    },
  });

  // Supprimer les menus soft-deleted depuis plus de X jours
  const deletedMealPlans = await db.weeklyMealPlan.deleteMany({
    where: {
      deletedAt: {
        not: null,
        lt: cutoffDate,
      },
    },
  });

  return {
    recipes: deletedRecipes.count,
    comments: deletedComments.count,
    mealPlans: deletedMealPlans.count,
  };
}

/**
 * Obtenir des statistiques sur les données soft-deleted
 */
export async function getDeletedDataStats(): Promise<{
  recipes: number;
  comments: number;
  mealPlans: number;
  users: number;
}> {
  const [recipes, comments, mealPlans, users] = await Promise.all([
    db.recipe.count({ where: { deletedAt: { not: null } } }),
    db.comment.count({ where: { deletedAt: { not: null } } }),
    db.weeklyMealPlan.count({ where: { deletedAt: { not: null } } }),
    db.user.count({ where: { deletedAt: { not: null } } }),
  ]);

  return { recipes, comments, mealPlans, users };
}
