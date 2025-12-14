"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getUserNotes() {
  const session = await auth();
  
  if (!session?.user?.id) {
    throw new Error("Non authentifié");
  }

  const notes = await db.userNote.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return notes;
}

export async function createUserNote(title: string, content?: string) {
  const session = await auth();
  
  if (!session?.user?.id) {
    throw new Error("Non authentifié");
  }

  const note = await db.userNote.create({
    data: {
      title,
      content: content || null,
      userId: session.user.id,
    },
  });

  revalidatePath("/notes");
  return note;
}

export async function updateUserNote(id: number, title: string, content?: string) {
  const session = await auth();
  
  if (!session?.user?.id) {
    throw new Error("Non authentifié");
  }

  // Vérifier que la note appartient à l'utilisateur
  const existingNote = await db.userNote.findUnique({
    where: { id },
  });

  if (!existingNote || existingNote.userId !== session.user.id) {
    throw new Error("Note non trouvée ou accès refusé");
  }

  const note = await db.userNote.update({
    where: { id },
    data: {
      title,
      content: content || null,
    },
  });

  revalidatePath("/notes");
  return note;
}

export async function deleteUserNote(id: number) {
  const session = await auth();
  
  if (!session?.user?.id) {
    throw new Error("Non authentifié");
  }

  // Vérifier que la note appartient à l'utilisateur
  const existingNote = await db.userNote.findUnique({
    where: { id },
  });

  if (!existingNote || existingNote.userId !== session.user.id) {
    throw new Error("Note non trouvée ou accès refusé");
  }

  await db.userNote.delete({
    where: { id },
  });

  revalidatePath("/notes");
}
