"use client";

import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { DeleteRecipeDialog } from "./delete-recipe-dialog";

interface DeleteRecipeButtonProps {
  recipeId: number;
  recipeName: string;
}

export function DeleteRecipeButton({ recipeId, recipeName }: DeleteRecipeButtonProps) {
  return (
    <DeleteRecipeDialog
      recipeId={recipeId}
      recipeName={recipeName}
      redirectAfterDelete={true}
      trigger={
        <Button
          variant="outline"
          size="sm"
          className="text-red-600 dark:text-red-400 bg-white/95 dark:bg-stone-900/95 backdrop-blur-sm border-white/50 dark:border-stone-700/50 hover:bg-red-50 dark:hover:bg-red-950/50 hover:border-red-300 dark:hover:border-red-700 cursor-pointer shadow-lg"
        >
          <Trash2 className="h-4 w-4 sm:mr-2" />
          <span className="hidden sm:inline">Supprimer</span>
        </Button>
      }
    />
  );
}

