"use client";

import { useState } from "react";
import { Trash2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RecipeDetailDialog } from "./recipe-detail-dialog";

interface MealCardProps {
  meal: any;
  planId: number;
  onRefresh: () => void;
}

export function MealCard({ meal, planId, onRefresh }: MealCardProps) {
  const [showDetail, setShowDetail] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Supprimer ce repas ?")) return;
    
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
    }
  };

  return (
    <>
      <div
        onClick={() => setShowDetail(true)}
        className="w-full h-full p-3 bg-white dark:bg-stone-800 rounded-lg cursor-pointer hover:shadow-lg transition-all group relative overflow-hidden border border-stone-200 dark:border-stone-700"
      >
        <div className="relative h-full flex flex-col">
          {/* Meal Name */}
          <h4 className="text-sm font-semibold text-stone-900 dark:text-stone-100 line-clamp-2 mb-1">
            {meal.name}
          </h4>
          
          {/* Time info */}
          <p className="text-xs text-stone-500 dark:text-stone-400">
            ⏱ {meal.prepTime + meal.cookTime} min
          </p>
          
          {/* Calories */}
          {meal.calories && (
            <p className="text-xs text-stone-500 dark:text-stone-400">
              🔥 {meal.calories} kcal
            </p>
          )}
          
          {/* Actions */}
          <div className="mt-auto flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity pt-2">
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0 text-emerald-600"
              onClick={(e) => {
                e.stopPropagation();
                setShowDetail(true);
              }}
            >
              <Eye className="h-3 w-3" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0 text-red-600"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>

      {/* Recipe Detail Dialog */}
      <RecipeDetailDialog
        open={showDetail}
        onOpenChange={setShowDetail}
        meal={meal}
      />
    </>
  );
}
