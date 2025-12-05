"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Users, Plus, Minus } from "lucide-react";

interface PortionAdjusterProps {
  originalServings: number;
  ingredients: Array<{
    id: number;
    name: string;
    quantity: number | null;
    unit: string | null;
  }>;
  onServingsChange: (newServings: number, multiplier: number) => void;
}

export function PortionAdjuster({
  originalServings,
  ingredients,
  onServingsChange,
}: PortionAdjusterProps) {
  const [servings, setServings] = useState(originalServings);

  const updateServings = (newServings: number) => {
    if (newServings < 1 || newServings > 50) return;
    setServings(newServings);
    onServingsChange(newServings, newServings / originalServings);
  };

  return (
    <div className="flex items-center gap-3">
      <Users className="h-5 w-5 text-emerald-600" />
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => updateServings(servings - 1)}
          disabled={servings <= 1}
        >
          <Minus className="h-4 w-4" />
        </Button>
        <span className="min-w-[80px] text-center font-semibold">
          {servings} pers.
        </span>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => updateServings(servings + 1)}
          disabled={servings >= 50}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      {servings !== originalServings && (
        <span className="text-xs text-muted-foreground">
          (×{(servings / originalServings).toFixed(1)})
        </span>
      )}
    </div>
  );
}

// Helper function to format adjusted quantities
export function formatQuantity(quantity: number | null, multiplier: number): string {
  if (quantity === null) return "";
  const adjusted = quantity * multiplier;
  
  // Round to nice fractions
  if (adjusted < 0.1) return adjusted.toFixed(2);
  if (adjusted < 1) return adjusted.toFixed(1);
  if (Number.isInteger(adjusted)) return adjusted.toString();
  return adjusted.toFixed(1);
}

