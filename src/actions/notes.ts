"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function getUserNote(recipeId: number) {
  const session = await auth();
  if (!session?.user?.id) {
    return null;
  }

  return db.userRecipeNote.findUnique({
    where: {
      userId_recipeId: {
        userId: session.user.id,
        recipeId,
      },
    },
  });
}

export async function saveUserNote(recipeId: number, note: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Non authentifié" };
  }

  try {
    if (note.trim() === "") {
      // Delete note if empty
      await db.userRecipeNote.deleteMany({
        where: {
          userId: session.user.id,
          recipeId,
        },
      });
    } else {
      // Upsert note
      await db.userRecipeNote.upsert({
        where: {
          userId_recipeId: {
            userId: session.user.id,
            recipeId,
          },
        },
        update: { note },
        create: {
          userId: session.user.id,
          recipeId,
          note,
        },
      });
    }

    revalidatePath(`/recipes/${recipeId}`);
    return { success: true };
  } catch (error) {
    console.error("[saveUserNote] Error:", error);
    return { success: false, error: "Erreur lors de la sauvegarde" };
  }
}

export async function deleteUserNote(recipeId: number) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Non authentifié" };
  }

  try {
    await db.userRecipeNote.deleteMany({
      where: {
        userId: session.user.id,
        recipeId,
      },
    });

    revalidatePath(`/recipes/${recipeId}`);
    return { success: true };
  } catch {
    return { success: false, error: "Erreur lors de la suppression" };
  }
}

