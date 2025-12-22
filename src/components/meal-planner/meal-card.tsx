"use client";

import { useState } from "react";
import { Trash2, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RecipeDetailSheet } from "./recipe-detail-sheet";
import { EditMealDialog } from "./edit-meal-dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { formatTime } from "@/lib/utils";
import Image from "next/image";

interface MealCardProps {
  meal: any;
  planId: number;
  onRefresh: () => void;
  canEdit?: boolean;
}

export function MealCard({ meal, onRefresh, canEdit = false }: MealCardProps) {
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
        {/* Image de la recette (si disponible) */}
        {meal.imageUrl && (
          <div className="relative w-full h-32 lg:h-40 overflow-hidden">
            <Image
              src={meal.imageUrl}
              alt={meal.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              unoptimized // Pour Unsplash URLs
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          </div>
        )}
        
        <div className={`relative h-full flex flex-col ${meal.imageUrl ? 'p-3' : 'p-3 lg:p-3'}`}>
          {/* Meal Name - 3 lignes max */}
          <h4 className="text-sm lg:text-sm font-semibold text-stone-900 dark:text-stone-100 line-clamp-3 mb-2 pr-20 lg:pr-0">
            {meal.name}
          </h4>
          
          {/* Actions et Calories */}
          {canEdit ? (
            <div className="absolute top-2 right-2 lg:static lg:mt-auto lg:flex lg:items-center lg:justify-between gap-1 transition-opacity lg:pt-1">
              {/* Boutons sur mobile (absolute) et desktop (flex à gauche) */}
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 lg:h-7 lg:w-7 p-0 text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-900/20 bg-white/90 dark:bg-stone-900/90 lg:bg-transparent backdrop-blur-sm lg:backdrop-blur-none"
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
                  className="h-8 w-8 lg:h-7 lg:w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 bg-white/90 dark:bg-stone-900/90 lg:bg-transparent backdrop-blur-sm lg:backdrop-blur-none"
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
              
              {/* Calories à droite sur desktop seulement */}
              {meal.calories && (
                <div className="hidden lg:flex items-center gap-1 text-xs text-stone-600 dark:text-stone-400">
                  <span>🔥</span>
                  <span className="font-medium">{meal.calories} kcal</span>
                </div>
              )}
            </div>
          ) : (
            // Si pas d'édition possible, afficher seulement les calories en bas à droite
            meal.calories && (
              <div className="hidden lg:flex mt-auto items-center justify-end pt-1">
                <div className="flex items-center gap-1 text-xs text-stone-600 dark:text-stone-400">
                  <span>🔥</span>
                  <span className="font-medium">{meal.calories} kcal</span>
                </div>
              </div>
            )
          )}
        </div>
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
