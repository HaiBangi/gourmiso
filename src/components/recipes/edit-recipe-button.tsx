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
        className="bg-black/40 backdrop-blur-md hover:bg-black/60 text-white border border-white/20 opacity-50 shadow-lg"
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
          className="bg-amber-600/70 backdrop-blur-md hover:bg-amber-600/90 text-white border border-amber-400/30 cursor-pointer shadow-lg"
        >
          <Pencil className="mr-2 h-4 w-4" />
          Modifier
        </Button>
      }
    />
  );
}

