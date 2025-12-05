"use server";

import { db } from "@/lib/db";

export interface AuthorInfo {
  id: string | null;
  name: string;
  pseudo: string;
  image: string | null;
  recipeCount: number;
}

export async function getAuthors(): Promise<AuthorInfo[]> {
  // Get all recipes with their authors
  const recipes = await db.recipe.findMany({
    select: {
      author: true,
      userId: true,
      user: {
        select: {
          id: true,
          name: true,
          pseudo: true,
          image: true,
        },
      },
    },
  });

  // Group by author
  const authorMap = new Map<string, AuthorInfo>();

  for (const recipe of recipes) {
    const key = recipe.userId || recipe.author;
    
    if (!authorMap.has(key)) {
      authorMap.set(key, {
        id: recipe.userId,
        name: recipe.user?.name || recipe.author,
        pseudo: recipe.user?.pseudo || recipe.author,
        image: recipe.user?.image || null,
        recipeCount: 0,
      });
    }
    
    const author = authorMap.get(key)!;
    author.recipeCount++;
  }

  // Sort by recipe count (descending)
  return Array.from(authorMap.values())
    .sort((a, b) => b.recipeCount - a.recipeCount);
}

