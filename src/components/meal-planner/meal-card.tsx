"use client";

import { useState } from "react";
import { Trash2, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RecipeDetailSheet } from "./recipe-detail-sheet";
import { EditMealDialog } from "./edit-meal-dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { formatTime } from "@/lib/utils";
import Image from "next/image";

// Fonction helper pour recalculer la liste de courses
async function recalculateShoppingList(planId: number) {
  try {
    await fetch("/api/meal-planner/recalculate-shopping-list", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planId }),
    });
    console.log("✅ Liste de courses recalculée");
  } catch (error) {
    console.error("❌ Erreur recalcul liste de courses:", error);
  }
}

interface MealCardProps {
  meal: any;
  planId: number;
  onRefresh: () => void;
  canEdit?: boolean;
  showImages?: boolean;
}

export function MealCard({ meal, onRefresh, canEdit = false, showImages = true }: MealCardProps) {
  const [showDetail, setShowDetail] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/meal-planner/meal/${meal.id}`, {
        method: "DELETE",
      });
      
      if (res.ok) {
        // Recalculer la liste de courses après suppression
        await recalculateShoppingList(meal.weeklyMealPlanId);
        // Rafraîchir les données APRÈS le recalcul
        onRefresh();
      }
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  return (
    <>
      <div
        onClick={() => setShowDetail(true)}
        className="w-full h-full bg-white dark:bg-stone-800 rounded-lg cursor-pointer hover:shadow-lg transition-all group relative overflow-hidden border border-stone-200 dark:border-stone-700"
      >
        {/* Afficher l'image SEULEMENT si showImages=true ET qu'une image existe */}
        {showImages && (meal.imageUrl || meal.recipe?.imageUrl) ? (
          <div className="relative w-full h-48 lg:h-full overflow-hidden">
            {/* Image en arrière-plan */}
            <div className="absolute inset-0">
              <Image
                src={meal.imageUrl || meal.recipe?.imageUrl}
                alt={meal.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                unoptimized
              />
            </div>
            
            {/* Gradient overlay pour améliorer la lisibilité */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/30 to-black/60" />
            
            {/* Titre en haut de l'image */}
            <div className="absolute top-0 left-0 right-0 p-3 lg:p-4">
              <h4 className="text-base lg:text-base font-bold text-white line-clamp-2 leading-snug drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                {meal.name}
              </h4>
            </div>
            
            {/* Boutons et calories en bas */}
            <div className="absolute bottom-0 left-0 right-0 p-2 lg:p-3">
              {canEdit ? (
                <div className="flex items-center justify-between gap-1">
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0 text-orange-300 hover:text-orange-200 hover:bg-orange-400/20 rounded-md drop-shadow-md"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowEditDialog(true);
                      }}
                      title="Modifier"
                    >
                      <Edit2 className="h-3 w-3 stroke-[2.5]" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0 text-red-300 hover:text-red-200 hover:bg-red-400/20 rounded-md drop-shadow-md"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowDeleteDialog(true);
                      }}
                      disabled={isDeleting}
                      title="Supprimer"
                    >
                      <Trash2 className="h-3 w-3 stroke-[2.5]" />
                    </Button>
                  </div>
                  
                  {meal.calories && (
                    <div className="flex items-center gap-1">
                      <span className="text-sm">🔥</span>
                      <span className="text-sm font-bold text-white drop-shadow-md">{meal.calories}</span>
                    </div>
                  )}
                </div>
              ) : (
                meal.calories && (
                  <div className="flex items-center justify-end">
                    <div className="flex items-center gap-1">
                      <span className="text-sm">🔥</span>
                      <span className="text-sm font-bold text-white drop-shadow-md">{meal.calories}</span>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        ) : (
          // Mode compacte : pas d'image (soit showImages=false, soit pas d'image disponible)
          <div className="relative flex flex-col p-3 lg:p-3 h-full">
            {/* Meal Name */}
            <h4 className="text-sm lg:text-sm font-semibold text-stone-900 dark:text-stone-100 line-clamp-3 mb-2">
              {meal.name}
            </h4>
            
            {/* Actions et Calories */}
            {canEdit ? (
              <div className="mt-auto flex items-center justify-between gap-1 pt-1">
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0 text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-900/20"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowEditDialog(true);
                    }}
                    title="Modifier"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDeleteDialog(true);
                    }}
                    disabled={isDeleting}
                    title="Supprimer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
                
                {meal.calories && (
                  <div className="flex items-center gap-1 text-xs text-stone-600 dark:text-stone-400">
                    <span>🔥</span>
                    <span className="font-medium">{meal.calories} kcal</span>
                  </div>
                )}
              </div>
            ) : (
              meal.calories && (
                <div className="mt-auto flex items-center justify-end pt-1">
                  <div className="flex items-center gap-1 text-xs text-stone-600 dark:text-stone-400">
                    <span>🔥</span>
                    <span className="font-medium">{meal.calories} kcal</span>
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </div>

      {/* Recipe Detail Dialog */}
      <RecipeDetailSheet
        open={showDetail}
        onOpenChange={setShowDetail}
        meal={meal}
      />

      {/* Edit Meal Dialog */}
      <EditMealDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        meal={meal}
        onSuccess={onRefresh}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Supprimer ce repas ?"
        description={`Êtes-vous sûr de vouloir supprimer ${meal.name} de votre planning ? Cette action est irréversible.`}
        onConfirm={handleDelete}
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
        isLoading={isDeleting}
        variant="destructive"
      />
    </>
  );
}
