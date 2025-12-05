"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Minus, Users } from "lucide-react";

interface Ingredient {
  id: number;
  name: string;
  quantity: number | null;
  unit: string | null;
}

interface IngredientsCardProps {
  ingredients: Ingredient[];
  originalServings: number;
}

function formatQuantity(quantity: number | null, multiplier: number): string {
  if (quantity === null) return "";
  const adjusted = quantity * multiplier;
  
  // Round to nice fractions
  if (adjusted < 0.1) return adjusted.toFixed(2);
  if (adjusted < 1) {
    const rounded = Math.round(adjusted * 10) / 10;
    return rounded.toString();
  }
  if (Number.isInteger(adjusted)) return adjusted.toString();
  return (Math.round(adjusted * 10) / 10).toString();
}

export function IngredientsCard({ ingredients, originalServings }: IngredientsCardProps) {
  const [servings, setServings] = useState(originalServings);
  const multiplier = servings / originalServings;

  const updateServings = (delta: number) => {
    const newServings = servings + delta;
    if (newServings >= 1 && newServings <= 50) {
      setServings(newServings);
    }
  };

  return (
    <Card className="md:col-span-2 border border-amber-100 shadow-sm bg-white/80 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="font-serif text-lg sm:text-xl flex items-center gap-2">
            <span className="text-xl sm:text-2xl">🥗</span>
            Ingrédients
          </CardTitle>
          
          {/* Portion Adjuster */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7"
              onClick={() => updateServings(-1)}
              disabled={servings <= 1}
            >
              <Minus className="h-3.5 w-3.5" />
            </Button>
            <div className="flex items-center gap-1 min-w-[70px] justify-center">
              <Users className="h-4 w-4 text-emerald-600" />
              <span className="font-medium text-sm">{servings}</span>
            </div>
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7"
              onClick={() => updateServings(1)}
              disabled={servings >= 50}
            >
              <Plus className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
        {servings !== originalServings && (
          <p className="text-xs text-amber-600 mt-1">
            Quantités ajustées (×{multiplier.toFixed(1)})
          </p>
        )}
      </CardHeader>
      <CardContent>
        <ul className="space-y-2 sm:space-y-3">
          {ingredients.map((ingredient) => (
            <li
              key={ingredient.id}
              className="flex items-start gap-2 sm:gap-3 text-sm sm:text-base text-stone-700"
            >
              <span className="mt-1.5 h-2 w-2 rounded-full bg-amber-500 flex-shrink-0" />
              <span>
                {ingredient.quantity && (
                  <span className="font-medium">
                    {formatQuantity(ingredient.quantity, multiplier)}{" "}
                  </span>
                )}
                {ingredient.unit && (
                  <span className="text-stone-500">{ingredient.unit} </span>
                )}
                {ingredient.name}
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

