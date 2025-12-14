"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";

interface AddMealDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  planId: number;
  day: string;
  timeSlot: string;
  mealType: string;
  onSuccess: () => void;
}

export function AddMealDialog({
  open,
  onOpenChange,
  planId,
  day,
  timeSlot,
  mealType,
  onSuccess,
}: AddMealDialogProps) {
  const [tab, setTab] = useState<"existing" | "generate">("existing");
  const [recipes, setRecipes] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRecipe, setSelectedRecipe] = useState<any>(null);
  const [portionsToUse, setPortionsToUse] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [generatePrompt, setGeneratePrompt] = useState("");

  useEffect(() => {
    if (open && tab === "existing") {
      fetchRecipes();
    }
  }, [open, tab]);

  const fetchRecipes = async () => {
    try {
      const res = await fetch("/api/recipes");
      if (res.ok) {
        const data = await res.json();
        setRecipes(data);
      }
    } catch (error) {
      console.error("Erreur:", error);
    }
  };

  const filteredRecipes = recipes.filter((r) =>
    r.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddExistingRecipe = async () => {
    if (!selectedRecipe) return;

    setIsLoading(true);
    try {
      const res = await fetch(`/api/meal-planner/meal`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId,
          dayOfWeek: day,
          timeSlot,
          mealType,
          recipeId: selectedRecipe.id,
          portionsUsed: portionsToUse,
        }),
      });

      if (res.ok) {
        onSuccess();
        onOpenChange(false);
        resetForm();
      }
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateRecipe = async () => {
    if (!generatePrompt.trim()) return;

    setIsLoading(true);
    try {
      console.log("🤖 Génération IA:", { planId, day, timeSlot, mealType, prompt: generatePrompt });

      const res = await fetch(`/api/meal-planner/generate-meal`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId,
          dayOfWeek: day,
          timeSlot,
          mealType,
          prompt: generatePrompt,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error("❌ Erreur serveur:", errorData);
        alert(`Erreur: ${errorData.error || "Erreur inconnue"}`);
        return;
      }

      const data = await res.json();
      console.log("✅ Recette générée:", data);

      onSuccess();
      onOpenChange(false);
      resetForm();
    } catch (error) {
      console.error("❌ Erreur:", error);
      alert("Erreur lors de la génération: " + (error instanceof Error ? error.message : String(error)));
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedRecipe(null);
    setPortionsToUse(1);
    setGeneratePrompt("");
    setSearchTerm("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>
            Ajouter un repas - {day} à {timeSlot} ({mealType})
          </DialogTitle>
        </DialogHeader>

        <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="existing">Recettes Existantes</TabsTrigger>
            <TabsTrigger value="generate">
              <Sparkles className="h-4 w-4 mr-2" />
              Générer avec IA
            </TabsTrigger>
          </TabsList>

          <TabsContent value="existing" className="space-y-4 mt-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-stone-400" />
              <Input
                placeholder="Rechercher une recette..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Recipe List */}
            <div className="max-h-96 overflow-y-auto space-y-2">
              {filteredRecipes.map((recipe) => (
                <Card
                  key={recipe.id}
                  className={`p-3 cursor-pointer transition-all ${
                    selectedRecipe?.id === recipe.id
                      ? "border-2 border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20"
                      : "hover:border-emerald-300"
                  }`}
                  onClick={() => setSelectedRecipe(recipe)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold">{recipe.name}</h4>
                      <p className="text-sm text-stone-500">
                        ⏱ {recipe.preparationTime + recipe.cookingTime} min • 🍽 {recipe.servings} portions
                        {recipe.caloriesPerServing && ` • 🔥 ${recipe.caloriesPerServing} kcal`}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Portions Selector */}
            {selectedRecipe && (
              <div className="space-y-2">
                <Label>Combien de portions utiliser ?</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min={1}
                    max={selectedRecipe.servings}
                    value={portionsToUse}
                    onChange={(e) => setPortionsToUse(parseInt(e.target.value) || 1)}
                    className="w-24"
                  />
                  <span className="text-sm text-stone-500">
                    sur {selectedRecipe.servings} portions disponibles
                  </span>
                </div>
                <p className="text-xs text-stone-500">
                  💡 Les portions non utilisées peuvent être assignées à un autre repas
                </p>
              </div>
            )}

            <Button
              onClick={handleAddExistingRecipe}
              disabled={!selectedRecipe || isLoading}
              className="w-full"
            >
              {isLoading ? "Ajout en cours..." : "Ajouter cette recette"}
            </Button>
          </TabsContent>

          <TabsContent value="generate" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Décrivez le repas que vous souhaitez</Label>
              <Input
                placeholder="Ex: Salade césar légère, Pâtes carbonara..."
                value={generatePrompt}
                onChange={(e) => setGeneratePrompt(e.target.value)}
              />
            </div>

            <Button
              onClick={handleGenerateRecipe}
              disabled={!generatePrompt.trim() || isLoading}
              className="w-full"
            >
              {isLoading ? "Génération en cours..." : "Générer cette recette"}
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
