"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useMediaQuery } from "@/hooks/use-media-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ExternalLink, Clock, Users, Flame, Check } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

interface RecipeDetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  meal: any;
}

export function RecipeDetailSheet({ open, onOpenChange, meal }: RecipeDetailSheetProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [recipe, setRecipe] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [checkedIngredients, setCheckedIngredients] = useState<Set<number>>(new Set());
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (open && meal.recipeId) {
      fetchFullRecipe();
    }
  }, [open, meal]);

  const fetchFullRecipe = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/recipes/${meal.recipeId}`);
      if (res.ok) {
        const data = await res.json();
        setRecipe(data);
      }
    } catch (error) {
      console.error("Erreur lors du chargement de la recette:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleIngredient = (index: number) => {
    setCheckedIngredients((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const toggleStep = (index: number) => {
    setCompletedSteps((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const fullRecipe = recipe || meal.recipe;

  const RecipeContent = () => (
    <div className="space-y-4 pb-6">
      {/* Info Header - compact sur mobile */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 px-4">
        <div className="flex items-center gap-2 p-2 sm:p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
          <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600 flex-shrink-0" />
          <div className="min-w-0">
            <p className="text-[10px] sm:text-xs text-stone-500">Temps</p>
            <p className="font-semibold text-xs sm:text-sm text-stone-900 dark:text-stone-100 truncate">
              {meal.prepTime + meal.cookTime} min
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 p-2 sm:p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
          <Users className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600 flex-shrink-0" />
          <div className="min-w-0">
            <p className="text-[10px] sm:text-xs text-stone-500">Portions</p>
            <p className="font-semibold text-xs sm:text-sm text-stone-900 dark:text-stone-100 truncate">
              {meal.servings} pers.
            </p>
          </div>
        </div>
        {meal.calories && (
          <div className="flex items-center gap-2 p-2 sm:p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg col-span-2 sm:col-span-1">
            <Flame className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-[10px] sm:text-xs text-stone-500">Calories</p>
              <p className="font-semibold text-xs sm:text-sm text-stone-900 dark:text-stone-100 truncate">
                {meal.calories} kcal
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Bouton voir recette complète */}
      {meal.recipeId && (
        <div className="px-4">
          <Button asChild variant="outline" size="sm" className="w-full gap-2">
            <Link href={`/recipes/${meal.recipeId}`} target="_blank">
              <ExternalLink className="h-4 w-4" />
              Voir la recette complète
            </Link>
          </Button>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-4 px-4">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      ) : (
        <div className="space-y-4">
          {/* Ingrédients */}
          <Card className="mx-4 border-emerald-100 dark:border-emerald-900/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                <span className="text-lg">🥗</span>
                Ingrédients
              </CardTitle>
              {checkedIngredients.size > 0 && (
                <p className="text-xs text-emerald-600">
                  {checkedIngredients.size} / {fullRecipe?.ingredients?.length || meal.ingredients?.length || 0} cochés
                </p>
              )}
            </CardHeader>
            <CardContent className="space-y-3 pb-4">
              {fullRecipe?.ingredientGroups?.length > 0 ? (
                fullRecipe.ingredientGroups.map((group: any, groupIdx: number) => (
                  <div key={groupIdx} className="space-y-2">
                    {group.name && (
                      <h4 className="font-semibold text-xs text-emerald-700 dark:text-emerald-400 uppercase tracking-wide border-b border-emerald-200 dark:border-emerald-800 pb-1">
                        {group.name}
                      </h4>
                    )}
                    <div className="space-y-1.5">
                      {group.ingredients.map((ing: any) => {
                        const globalIdx = fullRecipe.ingredients.findIndex((i: any) => i.id === ing.id);
                        const isChecked = checkedIngredients.has(globalIdx);
                        return (
                          <label
                            key={ing.id}
                            className={`flex items-start gap-2 p-2 rounded-lg cursor-pointer transition-all ${
                              isChecked ? "bg-emerald-50/50 dark:bg-emerald-900/10" : "hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                            }`}
                          >
                            <Checkbox
                              checked={isChecked}
                              onCheckedChange={() => toggleIngredient(globalIdx)}
                              className="h-4 w-4 sm:h-5 sm:w-5 mt-0.5 flex-shrink-0"
                            />
                            <span className={`flex-1 text-xs sm:text-sm ${isChecked ? "line-through text-stone-400" : "text-stone-700 dark:text-stone-200"}`}>
                              {ing.quantity && ing.unit ? (
                                <>
                                  <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                                    {ing.quantity} {ing.unit}
                                  </span>
                                  {" "}{ing.name}
                                </>
                              ) : (
                                ing.name
                              )}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))
              ) : fullRecipe?.ingredients?.length > 0 ? (
                <div className="space-y-1.5">
                  {fullRecipe.ingredients.map((ing: any, idx: number) => {
                    const isChecked = checkedIngredients.has(idx);
                    return (
                      <label
                        key={idx}
                        className={`flex items-start gap-2 p-2 rounded-lg cursor-pointer transition-all ${
                          isChecked ? "bg-emerald-50/50 dark:bg-emerald-900/10" : "hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                        }`}
                      >
                        <Checkbox
                          checked={isChecked}
                          onCheckedChange={() => toggleIngredient(idx)}
                          className="h-4 w-4 sm:h-5 sm:w-5 mt-0.5 flex-shrink-0"
                        />
                        <span className={`flex-1 text-xs sm:text-sm ${isChecked ? "line-through text-stone-400" : "text-stone-700 dark:text-stone-200"}`}>
                          {ing.quantity && ing.unit ? (
                            <>
                              <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                                {ing.quantity} {ing.unit}
                              </span>
                              {" "}{ing.name}
                            </>
                          ) : (
                            ing.name
                          )}
                        </span>
                      </label>
                    );
                  })}
                </div>
              ) : (
                <div className="space-y-1.5">
                  {Array.isArray(meal.ingredients) && meal.ingredients.map((ing: string, idx: number) => {
                    const isChecked = checkedIngredients.has(idx);
                    return (
                      <label
                        key={idx}
                        className={`flex items-start gap-2 p-2 rounded-lg cursor-pointer transition-all ${
                          isChecked ? "bg-emerald-50/50 dark:bg-emerald-900/10" : "hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                        }`}
                      >
                        <Checkbox
                          checked={isChecked}
                          onCheckedChange={() => toggleIngredient(idx)}
                          className="h-4 w-4 sm:h-5 sm:w-5 mt-0.5 flex-shrink-0"
                        />
                        <span className={`flex-1 text-xs sm:text-sm ${isChecked ? "line-through text-stone-400" : "text-stone-700 dark:text-stone-200"}`}>
                          {ing}
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Étapes de préparation */}
          <Card className="mx-4 border-emerald-100 dark:border-emerald-900/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                <span className="text-lg">👨‍🍳</span>
                Préparation
              </CardTitle>
              <p className="text-xs text-stone-500 mt-1">
                Cliquez pour cocher une étape
              </p>
            </CardHeader>
            <CardContent className="space-y-2.5 pb-4">
              {fullRecipe?.steps?.length > 0 ? (
                fullRecipe.steps.map((step: any, index: number) => {
                  const isCompleted = completedSteps.has(index);
                  
                  return (
                    <div
                      key={index}
                      onClick={() => toggleStep(index)}
                      className={`cursor-pointer select-none transition-all duration-200 ${
                        isCompleted ? "opacity-70" : ""
                      }`}
                    >
                      <div className={`rounded-lg p-3 border-2 transition-all ${
                        isCompleted
                          ? "bg-emerald-50/50 dark:bg-emerald-900/20 border-emerald-300 dark:border-emerald-700"
                          : "bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700"
                      }`}>
                        <div className="flex gap-3">
                          <div className="flex-shrink-0">
                            <div
                              className={`flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full text-xs font-bold ${
                                isCompleted
                                  ? "bg-emerald-500"
                                  : "bg-orange-500"
                              }`}
                            >
                              {isCompleted ? (
                                <Check className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                              ) : (
                                <span className="text-white">{step.order}</span>
                              )}
                            </div>
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className={`text-xs sm:text-sm leading-relaxed ${
                              isCompleted ? "text-stone-500 dark:text-stone-400" : "text-stone-700 dark:text-stone-200"
                            }`}>
                              {step.text}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="space-y-2.5">
                  {Array.isArray(meal.steps) && meal.steps.map((step: string, index: number) => {
                    const isCompleted = completedSteps.has(index);
                    
                    return (
                      <div
                        key={index}
                        onClick={() => toggleStep(index)}
                        className={`cursor-pointer select-none transition-all duration-200 ${
                          isCompleted ? "opacity-70" : ""
                        }`}
                      >
                        <div className={`rounded-lg p-3 border-2 transition-all ${
                          isCompleted
                            ? "bg-emerald-50/50 dark:bg-emerald-900/20 border-emerald-300 dark:border-emerald-700"
                            : "bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700"
                        }`}>
                          <div className="flex gap-3">
                            <div className="flex-shrink-0">
                              <div
                                className={`flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full text-xs font-bold ${
                                  isCompleted
                                    ? "bg-emerald-500"
                                    : "bg-orange-500"
                                }`}
                              >
                                {isCompleted ? (
                                  <Check className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                                ) : (
                                  <span className="text-white">{index + 1}</span>
                                )}
                              </div>
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className={`text-xs sm:text-sm leading-relaxed ${
                                isCompleted ? "text-stone-500 dark:text-stone-400" : "text-stone-700 dark:text-stone-200"
                              }`}>
                                {step}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="!max-w-6xl max-h-[90vh] overflow-y-auto p-0 sm:!max-w-[85vw] lg:!max-w-6xl">
          <VisuallyHidden>
            <DialogTitle>{meal.name}</DialogTitle>
          </VisuallyHidden>
          {fullRecipe?.imageUrl && (
            <div className="relative w-full h-40">
              <Image
                src={fullRecipe.imageUrl}
                alt={meal.name}
                fill
                className="object-cover"
                sizes="95vw"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-3 left-4 right-4">
                <h2 className="text-3xl font-bold text-white drop-shadow-lg">
                  {meal.name}
                </h2>
              </div>
            </div>
          )}
          {!fullRecipe?.imageUrl && (
            <DialogHeader className="p-4 pb-1">
              <DialogTitle className="text-3xl font-bold">{meal.name}</DialogTitle>
            </DialogHeader>
          )}
          <div className="px-4 pb-4 pt-2 space-y-3">
            {/* Info cards - version compacte */}
            <div className="flex items-center gap-2 text-base">
              <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 dark:bg-emerald-900/20 rounded">
                <Clock className="h-5 w-5 text-emerald-600" />
                <span className="font-medium">{meal.prepTime + meal.cookTime} min</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 dark:bg-emerald-900/20 rounded">
                <Users className="h-5 w-5 text-emerald-600" />
                <span className="font-medium">{meal.servings} pers.</span>
              </div>
              {meal.calories && (
                <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 dark:bg-emerald-900/20 rounded">
                  <Flame className="h-5 w-5 text-emerald-600" />
                  <span className="font-medium">{meal.calories} kcal</span>
                </div>
              )}
              {meal.recipeId && (
                <Button asChild variant="ghost" size="sm" className="ml-auto h-9 text-base gap-2">
                  <Link href={`/recipes/${meal.recipeId}`} target="_blank">
                    <ExternalLink className="h-4 w-4" />
                    Voir la recette
                  </Link>
                </Button>
              )}
            </div>

            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
              </div>
            ) : (
              <div className="grid gap-4 lg:grid-cols-5">
                {/* Ingrédients - 2 colonnes */}
                <Card className="lg:col-span-2 border-emerald-100 dark:border-emerald-900/50">
                  <CardHeader className="pb-2 pt-3 px-4">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <span className="text-xl">🥗</span>
                      Ingrédients
                    </CardTitle>
                    {checkedIngredients.size > 0 && (
                      <p className="text-sm text-emerald-600">
                        {checkedIngredients.size} / {fullRecipe?.ingredients?.length || meal.ingredients?.length || 0} cochés
                      </p>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-2 pb-3 px-4">
                    {fullRecipe?.ingredientGroups?.length > 0 ? (
                      fullRecipe.ingredientGroups.map((group: any, groupIdx: number) => (
                        <div key={groupIdx} className="space-y-1.5">
                          {group.name && (
                            <>
                              <h4 className="font-semibold text-base text-emerald-700 dark:text-emerald-400 uppercase tracking-wide">
                                {group.name}
                              </h4>
                              <hr className="border-t border-emerald-200 dark:border-emerald-800 mb-2" />
                            </>
                          )}
                          <div className="space-y-1">
                            {group.ingredients.map((ing: any) => {
                              const globalIdx = fullRecipe.ingredients.findIndex((i: any) => i.id === ing.id);
                              const isChecked = checkedIngredients.has(globalIdx);
                              return (
                                <label
                                  key={ing.id}
                                  className={`flex items-start gap-2 p-2.5 rounded cursor-pointer transition-all text-base ${
                                    isChecked ? "bg-emerald-50/50 dark:bg-emerald-900/10" : "hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                                  }`}
                                >
                                  <Checkbox
                                    checked={isChecked}
                                    onCheckedChange={() => toggleIngredient(globalIdx)}
                                    className="h-5 w-5 mt-0.5 flex-shrink-0"
                                  />
                                  <span className={`flex-1 ${isChecked ? "line-through text-stone-400" : "text-stone-700 dark:text-stone-200"}`}>
                                    {ing.quantity && ing.unit ? (
                                      <>
                                        <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                                          {ing.quantity} {ing.unit}
                                        </span>
                                        {" "}{ing.name}
                                      </>
                                    ) : (
                                      ing.name
                                    )}
                                  </span>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      ))
                    ) : fullRecipe?.ingredients?.length > 0 ? (
                      <div className="space-y-1">
                        {fullRecipe.ingredients.map((ing: any, idx: number) => {
                          const isChecked = checkedIngredients.has(idx);
                          return (
                            <label
                              key={idx}
                              className={`flex items-start gap-2 p-2.5 rounded cursor-pointer transition-all text-base ${
                                isChecked ? "bg-emerald-50/50 dark:bg-emerald-900/10" : "hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                              }`}
                            >
                              <Checkbox
                                checked={isChecked}
                                onCheckedChange={() => toggleIngredient(idx)}
                                className="h-5 w-5 mt-0.5 flex-shrink-0"
                              />
                              <span className={`flex-1 ${isChecked ? "line-through text-stone-400" : "text-stone-700 dark:text-stone-200"}`}>
                                {ing.quantity && ing.unit ? (
                                  <>
                                    <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                                      {ing.quantity} {ing.unit}
                                    </span>
                                    {" "}{ing.name}
                                  </>
                                ) : (
                                  ing.name
                                )}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="space-y-1">
                        {Array.isArray(meal.ingredients) && meal.ingredients.map((ing: string, idx: number) => {
                          const isChecked = checkedIngredients.has(idx);
                          return (
                            <label
                              key={idx}
                              className={`flex items-start gap-2 p-2.5 rounded cursor-pointer transition-all text-base ${
                                isChecked ? "bg-emerald-50/50 dark:bg-emerald-900/10" : "hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                              }`}
                            >
                              <Checkbox
                                checked={isChecked}
                                onCheckedChange={() => toggleIngredient(idx)}
                                className="h-5 w-5 mt-0.5 flex-shrink-0"
                              />
                              <span className={`flex-1 ${isChecked ? "line-through text-stone-400" : "text-stone-700 dark:text-stone-200"}`}>
                                {ing}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Étapes - 3 colonnes */}
                <Card className="lg:col-span-3 border-emerald-100 dark:border-emerald-900/50 pb-3">
                  <CardHeader className="pb-2 pt-3 px-4">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <span className="text-xl">👨‍🍳</span>
                      Préparation
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pb-2 px-4">
                    <div className="space-y-2.5">
                      {fullRecipe?.steps?.length > 0 ? (
                        fullRecipe.steps.map((step: any, index: number) => {
                          const isCompleted = completedSteps.has(index);
                          const isLastStep = index === fullRecipe.steps.length - 1;
                          
                          return (
                            <div key={index} className="relative">
                              {!isLastStep && (
                                <div className="absolute left-4 top-11 w-0.5 h-[calc(100%+0.5rem)] bg-gradient-to-b from-stone-200 to-stone-100 dark:from-stone-700 dark:to-stone-800" />
                              )}
                              
                              <div
                                onClick={() => toggleStep(index)}
                                className={`group relative cursor-pointer select-none transition-all duration-300 ${
                                  isCompleted ? "opacity-70 hover:opacity-80" : "hover:shadow-md hover:-translate-y-0.5"
                                }`}
                              >
                                <div className={`rounded-lg p-3.5 border-2 transition-all duration-300 ${
                                  isCompleted
                                    ? "bg-emerald-50/50 dark:bg-emerald-900/20 border-emerald-300 dark:border-emerald-700"
                                    : "bg-gradient-to-br from-white to-stone-50 dark:from-stone-800 dark:to-stone-900 border-stone-200 dark:border-stone-700 hover:border-emerald-300 dark:hover:border-emerald-700"
                                }`}>
                                  <div className="flex gap-3">
                                    <div className="flex-shrink-0">
                                      <div
                                        className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold shadow-lg transition-all duration-300 ${
                                          isCompleted
                                            ? "bg-gradient-to-br from-emerald-500 to-emerald-600"
                                            : "bg-gradient-to-br from-orange-500 to-orange-600"
                                        }`}
                                      >
                                        {isCompleted ? (
                                          <Check className="h-4 w-4 text-white" />
                                        ) : (
                                          <span className="text-white">{step.order}</span>
                                        )}
                                      </div>
                                    </div>

                                    <div className="flex-1 min-w-0">
                                      <div className={`text-base leading-relaxed text-justify transition-all duration-300 ${
                                        isCompleted ? "text-stone-500 dark:text-stone-400" : "text-stone-700 dark:text-stone-200"
                                      }`}>
                                        {step.text.split('\n').map((line: string, lineIndex: number) => {
                                          const leadingSpaces = line.match(/^(\s*)/)?.[1].length || 0;
                                          const trimmedLine = line.trim();
                                          const isBulletPoint = trimmedLine.startsWith('-');
                                          
                                          if (!isBulletPoint) {
                                            return <span key={lineIndex} className="block">{line}</span>;
                                          }
                                          
                                          const indentLevel = Math.floor(leadingSpaces / 2);
                                          const textWithoutBullet = trimmedLine.substring(1).trim();
                                          
                                          return (
                                            <div 
                                              key={lineIndex} 
                                              className="flex gap-2 items-start"
                                              style={{ marginLeft: `${indentLevel}rem` }}
                                            >
                                              <span className="text-orange-500 dark:text-orange-400 font-bold flex-shrink-0 mt-[0.15rem]">•</span>
                                              <span className="flex-1">{textWithoutBullet}</span>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="space-y-2.5">
                          {Array.isArray(meal.steps) && meal.steps.map((step: string, index: number) => {
                            const isCompleted = completedSteps.has(index);
                            
                            return (
                              <div
                                key={index}
                                onClick={() => toggleStep(index)}
                                className={`cursor-pointer select-none transition-all duration-200 ${
                                  isCompleted ? "opacity-70" : ""
                                }`}
                              >
                                <div className={`rounded-lg p-3.5 border-2 transition-all ${
                                  isCompleted
                                    ? "bg-emerald-50/50 dark:bg-emerald-900/20 border-emerald-300 dark:border-emerald-700"
                                    : "bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700"
                                }`}>
                                  <div className="flex gap-3">
                                    <div className="flex-shrink-0">
                                      <div
                                        className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                                          isCompleted
                                            ? "bg-emerald-500"
                                            : "bg-orange-500"
                                        }`}
                                      >
                                        {isCompleted ? (
                                          <Check className="h-4 w-4 text-white" />
                                        ) : (
                                          <span className="text-white">{index + 1}</span>
                                        )}
                                      </div>
                                    </div>

                                    <div className="flex-1 min-w-0">
                                      <div className={`text-base leading-relaxed ${
                                        isCompleted ? "text-stone-500 dark:text-stone-400" : "text-stone-700 dark:text-stone-200"
                                      }`}>
                                        {step}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[95vh] p-0 overflow-y-auto">
        <VisuallyHidden>
          <SheetTitle>{meal.name}</SheetTitle>
        </VisuallyHidden>
        {fullRecipe?.imageUrl && (
          <div className="relative w-full h-48">
            <Image
              src={fullRecipe.imageUrl}
              alt={meal.name}
              fill
              className="object-cover"
              sizes="100vw"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4">
              <h2 className="text-xl font-bold text-white drop-shadow-lg">
                {meal.name}
              </h2>
            </div>
          </div>
        )}
        {!fullRecipe?.imageUrl && (
          <SheetHeader className="p-4 pb-0">
            <SheetTitle className="text-xl font-bold">{meal.name}</SheetTitle>
          </SheetHeader>
        )}
        <RecipeContent />
      </SheetContent>
    </Sheet>
  );
}
