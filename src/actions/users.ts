"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Role } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function updateUserRole(userId: string, newRole: Role) {
  const session = await auth();

  if (!session?.user?.id) {
    return { success: false, error: "Non authentifié" };
  }

  // Check if current user is admin
  const currentUser = await db.user.findUnique({
    where: { id: session.user.id },
  });

  if (currentUser?.role !== "ADMIN") {
    return { success: false, error: "Accès refusé" };
  }

  // Prevent changing own role
  if (userId === session.user.id) {
    return { success: false, error: "Vous ne pouvez pas modifier votre propre rôle" };
  }

  try {
    await db.user.update({
      where: { id: userId },
      data: { role: newRole },
    });

    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Error updating user role:", error);
    return { success: false, error: "Erreur lors de la mise à jour" };
  }
}

