"use client";

import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import type { Recipe } from "@/types/recipe";

// Import RecipeForm dynamically without SSR to avoid hydration issues
const RecipeForm = dynamic(
  () => import("./recipe-form").then((mod) => ({ default: mod.RecipeForm })),
  { 
    ssr: false,
    loading: () => (
      <Button
        variant="outline"
        size="sm"
        className="text-amber-600 border-amber-200 hover:bg-amber-50 hover:border-amber-300 opacity-50 cursor-pointer"
        disabled
      >
        <Pencil className="h-4 w-4 sm:mr-2" />
        <span className="hidden sm:inline">Modifier</span>
      </Button>
    ),
  }
);

interface EditRecipeButtonProps {
  recipe: Recipe;
}

export function EditRecipeButton({ recipe }: EditRecipeButtonProps) {
  return (
    <RecipeForm
      recipe={recipe}
      trigger={
        <Button
          variant="outline"
          size="sm"
          className="text-amber-600 border-amber-200 hover:bg-amber-50 hover:border-amber-300 cursor-pointer"
        >
          <Pencil className="h-4 w-4 sm:mr-2" />
          <span className="hidden sm:inline">Modifier</span>
        </Button>
      }
    />
  );
}

