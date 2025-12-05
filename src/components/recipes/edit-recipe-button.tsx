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
        variant="ghost"
        className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white opacity-50"
        disabled
      >
        <Pencil className="mr-2 h-4 w-4" />
        Modifier
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
          variant="ghost"
          className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white"
        >
          <Pencil className="mr-2 h-4 w-4" />
          Modifier
        </Button>
      }
    />
  );
}

