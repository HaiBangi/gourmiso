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
        className="w-full h-full p-2 bg-gradient-to-br from-white to-emerald-50 dark:from-stone-800 dark:to-emerald-900/20 rounded-lg cursor-pointer hover:shadow-md transition-all group relative overflow-hidden"
      >
        {/* Background pattern */}
        <div className="absolute inset-0 bg-emerald-500/5 dark:bg-emerald-400/5 opacity-0 group-hover:opacity-100 transition-opacity" />
        
        <div className="relative h-full flex flex-col">
          {/* Meal Name */}
          <h4 className="text-xs font-semibold text-stone-900 dark:text-stone-100 line-clamp-2 mb-1">
            {meal.name}
          </h4>
          
          {/* Portions info */}
          {meal.portionsUsed && meal.servings && (
            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mb-1">
              {meal.portionsUsed}/{meal.servings} portions
            </p>
          )}
          
          {/* Time info */}
          <p className="text-[10px] text-stone-500 dark:text-stone-400">
            ⏱ {meal.prepTime + meal.cookTime} min
          </p>
          
          {/* Calories */}
          {meal.calories && (
            <p className="text-[10px] text-stone-500 dark:text-stone-400">
              🔥 {meal.calories} kcal
            </p>
          )}
          
          {/* Actions */}
          <div className="mt-auto flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
