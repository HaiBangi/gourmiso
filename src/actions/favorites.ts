"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function toggleFavorite(recipeId: number) {
  const session = await auth();

  if (!session?.user?.id) {
    return { success: false, error: "Non authentifié" };
  }

  try {
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      include: {
        favorites: {
          where: { id: recipeId },
        },
      },
    });

    if (!user) {
      return { success: false, error: "Utilisateur non trouvé" };
    }

    const isFavorited = user.favorites.length > 0;

    if (isFavorited) {
      // Remove from favorites
      await db.user.update({
        where: { id: session.user.id },
        data: {
          favorites: {
            disconnect: { id: recipeId },
          },
        },
      });
    } else {
      // Add to favorites
      await db.user.update({
        where: { id: session.user.id },
        data: {
          favorites: {
            connect: { id: recipeId },
          },
        },
      });
    }

    revalidatePath("/recipes");
    revalidatePath(`/recipes/${recipeId}`);
    revalidatePath("/profile/favorites");

    return { success: true, isFavorited: !isFavorited };
  } catch (error) {
    console.error("Error toggling favorite:", error);
    return { success: false, error: "Erreur lors de la mise à jour" };
  }
}

export async function checkIsFavorited(recipeId: number) {
  const session = await auth();

  if (!session?.user?.id) {
    return false;
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    include: {
      favorites: {
        where: { id: recipeId },
      },
    },
  });

  return user?.favorites && user.favorites.length > 0;
}

