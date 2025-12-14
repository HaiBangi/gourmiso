"use client";

import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { ShoppingCart, Check } from "lucide-react";
import { Card } from "@/components/ui/card";

interface ShoppingListDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plan: any;
}

export function ShoppingListDialog({ open, onOpenChange, plan }: ShoppingListDialogProps) {
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

  // Calculer la liste de courses consolidée
  const shoppingList = useMemo(() => {
    if (!plan?.meals) return {};

    const consolidated: Record<string, string[]> = {
      "Légumes": [],
      "Viandes & Poissons": [],
      "Produits Laitiers": [],
      "Épicerie": [],
      "Condiments & Sauces": [],
      "Autres": [],
    };

    // Grouper tous les ingrédients
    const ingredientMap: Map<string, number> = new Map();

    plan.meals.forEach((meal: any) => {
      if (Array.isArray(meal.ingredients)) {
        meal.ingredients.forEach((ing: any) => {
          // Convertir en string
          const ingredientStr = typeof ing === 'string' ? ing : (ing?.name || String(ing));
          if (!ingredientStr || ingredientStr === 'undefined' || ingredientStr === 'null' || ingredientStr === '[object Object]') return;
          
          const current = ingredientMap.get(ingredientStr) || 0;
          ingredientMap.set(ingredientStr, current + 1);
        });
      }
    });

    // Catégoriser les ingrédients (simple heuristique)
    ingredientMap.forEach((count, ingredient) => {
      // Convertir en string et s'assurer que c'est valide
      const ingredientStr = typeof ingredient === 'string' ? ingredient : String(ingredient);
      if (!ingredientStr || ingredientStr === 'undefined' || ingredientStr === 'null') return;
      
      const lowerIng = ingredientStr.toLowerCase();
      
      // Détection de catégorie par mots-clés
      if (lowerIng.match(/(tomate|carotte|oignon|ail|poivron|salade|laitue|chou|légume|courgette|aubergine)/)) {
        consolidated["Légumes"].push(ingredientStr);
      } else if (lowerIng.match(/(viande|poulet|boeuf|porc|poisson|crevette|saumon|thon)/)) {
        consolidated["Viandes & Poissons"].push(ingredientStr);
      } else if (lowerIng.match(/(lait|fromage|yaourt|crème|beurre|œuf|oeuf)/)) {
        consolidated["Produits Laitiers"].push(ingredientStr);
      } else if (lowerIng.match(/(sauce|huile|vinaigre|moutarde|soja|nuoc mam|ketchup)/)) {
        consolidated["Condiments & Sauces"].push(ingredientStr);
      } else if (lowerIng.match(/(farine|sucre|sel|poivre|riz|pâtes|pain)/)) {
        consolidated["Épicerie"].push(ingredientStr);
      } else {
        consolidated["Autres"].push(ingredientStr);
      }
    });

    // Nettoyer les catégories vides
    Object.keys(consolidated).forEach(category => {
      if (consolidated[category].length === 0) {
        delete consolidated[category];
      }
    });

    return consolidated;
  }, [plan]);

  const toggleItem = (item: string) => {
    const newSet = new Set(checkedItems);
    if (newSet.has(item)) {
      newSet.delete(item);
    } else {
      newSet.add(item);
    }
    setCheckedItems(newSet);
  };

  const totalItems = Object.values(shoppingList).reduce((acc, items) => acc + items.length, 0);
  const checkedCount = checkedItems.size;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <ShoppingCart className="h-6 w-6 text-emerald-600" />
            Liste de Courses - {plan?.name}
          </DialogTitle>
          <p className="text-sm text-stone-500">
            {checkedCount} / {totalItems} articles cochés
          </p>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {Object.entries(shoppingList).map(([category, items]) => (
            <Card key={category} className="p-4">
              <h3 className="font-semibold text-lg text-stone-900 dark:text-stone-100 mb-3 flex items-center gap-2">
                <span className="text-xl">
                  {category === "Légumes" && "🥬"}
                  {category === "Viandes & Poissons" && "🥩"}
                  {category === "Produits Laitiers" && "🥛"}
                  {category === "Épicerie" && "🌾"}
                  {category === "Condiments & Sauces" && "🧂"}
                  {category === "Autres" && "📦"}
                </span>
                {category}
              </h3>
              <div className="space-y-2">
                {items.map((item, idx) => (
                  <div key={idx} className="flex items-center space-x-3 p-2 hover:bg-stone-50 dark:hover:bg-stone-800 rounded transition-colors">
                    <Checkbox
                      id={`${category}-${idx}`}
                      checked={checkedItems.has(item)}
                      onCheckedChange={() => toggleItem(item)}
                    />
                    <label
                      htmlFor={`${category}-${idx}`}
                      className={`flex-1 cursor-pointer select-none ${
                        checkedItems.has(item)
                          ? "line-through text-stone-400"
                          : "text-stone-700 dark:text-stone-300"
                      }`}
                    >
                      {item}
                    </label>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>

        {checkedCount === totalItems && totalItems > 0 && (
          <div className="mt-6 p-4 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg flex items-center gap-3 text-emerald-700 dark:text-emerald-300">
            <Check className="h-5 w-5" />
            <span className="font-semibold">Toutes les courses sont faites ! 🎉</span>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
