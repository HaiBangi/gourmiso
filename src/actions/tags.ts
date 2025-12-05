"use server";

import { db } from "@/lib/db";

export async function getAllTags(): Promise<string[]> {
  const recipes = await db.recipe.findMany({
    select: { tags: true },
  });

  // Collect all unique tags (case-insensitive, stored lowercase)
  const tagSet = new Set<string>();
  
  for (const recipe of recipes) {
    for (const tag of recipe.tags) {
      tagSet.add(tag.toLowerCase());
    }
  }

  // Sort alphabetically
  return Array.from(tagSet).sort((a, b) => a.localeCompare(b, "fr"));
}

export async function searchTags(query: string): Promise<string[]> {
  if (!query || query.length < 1) return [];

  const allTags = await getAllTags();
  const queryLower = query.toLowerCase();

  // Filter tags that match the query
  return allTags.filter((tag) => tag.includes(queryLower));
}

