"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { deleteRecipe } from "@/actions/recipes";

interface DeleteRecipeDialogProps {
  recipeId: number;
  recipeName: string;
  trigger: React.ReactNode;
  redirectAfterDelete?: boolean;
}

export function DeleteRecipeDialog({
  recipeId,
  recipeName,
  trigger,
  redirectAfterDelete = false,
}: DeleteRecipeDialogProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await deleteRecipe(recipeId);
      if (result.success) {
        setOpen(false);
        if (redirectAfterDelete) {
          router.push("/recipes");
        } else {
          router.refresh();
        }
      } else {
        setError(result.error || "Erreur lors de la suppression");
        console.error("[DeleteRecipeDialog] Error:", result.error);
      }
    } catch (err) {
      console.error("[DeleteRecipeDialog] Exception:", err);
      setError("Une erreur inattendue s'est produite");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setError(null);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Supprimer cette recette ?</AlertDialogTitle>
          <AlertDialogDescription>
            Êtes-vous sûr de vouloir supprimer &quot;{recipeName}&quot; ? Cette
            action est irréversible.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {error && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3">
            {error}
          </div>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700"
          >
            {loading ? "Suppression..." : "Supprimer"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

