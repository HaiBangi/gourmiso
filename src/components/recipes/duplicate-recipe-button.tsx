"use client";

import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import type { Recipe } from "@/types/recipe";

// Import RecipeForm dynamically without SSR to avoid hydration issues
const RecipeForm = dynamic(
  () => import("./recipe-form").then((mod) => ({ default: mod.RecipeForm })),
  {
    ssr: false,
    loading: () => (
      <Button
        className="bg-white dark:bg-stone-800 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-stone-700 gap-1.5 sm:gap-2 h-9 sm:h-10 md:h-11 px-3 sm:px-4 md:px-5 text-sm sm:text-base cursor-pointer shadow-md opacity-50"
        disabled
      >
        <Copy className="h-4 w-4 sm:h-5 sm:w-5" />
        <span className="hidden sm:inline">Dupliquer</span>
      </Button>
    ),
  }
);

interface DuplicateRecipeButtonProps {
  recipe: Recipe;
}

export function DuplicateRecipeButton({ recipe }: DuplicateRecipeButtonProps) {
  // Create a copy of the recipe without the id and userId
  // The author will be set by RecipeForm based on the current user
  const recipeToDuplicate: Recipe = {
    ...recipe,
    id: 0, // Temporary ID to indicate it's a new recipe
    author: "", // Will be set by RecipeForm
  };

  return (
    <RecipeForm
      recipe={recipeToDuplicate}
      trigger={
        <Button
          className="bg-white dark:bg-stone-800 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-stone-700 gap-1.5 sm:gap-2 h-9 sm:h-10 md:h-11 px-3 sm:px-4 md:px-5 text-sm sm:text-base cursor-pointer shadow-md"
        >
          <Copy className="h-4 w-4 sm:h-5 sm:w-5" />
          <span className="hidden sm:inline">Dupliquer</span>
        </Button>
      }
    />
  );
}

