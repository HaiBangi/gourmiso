"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface GenerateMenuDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  planId: number;
  onSuccess: () => void;
}

const MEAL_TYPES = [
  { id: "breakfast", label: "Petit-déjeuner", time: "08:00" },
  { id: "lunch", label: "Déjeuner", time: "12:00" },
  { id: "snack", label: "Collation", time: "16:00" },
  { id: "dinner", label: "Dîner", time: "19:00" },
];

const CUISINE_TYPES = [
  "Française", "Italienne", "Asiatique", "Mexicaine", 
  "Méditerranéenne", "Indienne", "Japonaise", "Végétarienne"
];

export function GenerateMenuDialog({ open, onOpenChange, planId, onSuccess }: GenerateMenuDialogProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [numberOfPeople, setNumberOfPeople] = useState(2);
  const [selectedMealTypes, setSelectedMealTypes] = useState<string[]>(["lunch", "dinner"]);
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([]);
  const [preferences, setPreferences] = useState("");
  const [budget, setBudget] = useState("moyen");
  const [useExistingRecipes, setUseExistingRecipes] = useState(true);

  const toggleMealType = (mealId: string) => {
    setSelectedMealTypes(prev =>
      prev.includes(mealId)
        ? prev.filter(id => id !== mealId)
        : [...prev, mealId]
    );
  };

  const toggleCuisine = (cuisine: string) => {
    setSelectedCuisines(prev =>
      prev.includes(cuisine)
        ? prev.filter(c => c !== cuisine)
        : [...prev, cuisine]
    );
  };

  const handleGenerate = async () => {
    if (selectedMealTypes.length === 0) {
      alert("Veuillez sélectionner au moins un type de repas");
      return;
    }

    setIsGenerating(true);
    try {
      const res = await fetch("/api/meal-planner/generate-menu", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId,
          numberOfPeople,
          mealTypes: selectedMealTypes,
          cuisinePreferences: selectedCuisines,
          preferences,
          budget,
          useExistingRecipes,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Erreur lors de la génération");
      }

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Erreur:", error);
      alert(error instanceof Error ? error.message : "Erreur lors de la génération du menu");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Sparkles className="h-6 w-6 text-emerald-600" />
            Générer un Menu Automatiquement
          </DialogTitle>
          <DialogDescription>
            Laissez l'IA créer un menu complet pour votre semaine
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Nombre de personnes */}
          <div className="space-y-2">
            <Label htmlFor="people">Nombre de personnes</Label>
            <Input
              id="people"
              type="number"
              min={1}
              value={numberOfPeople}
              onChange={(e) => setNumberOfPeople(parseInt(e.target.value) || 1)}
            />
          </div>

          {/* Types de repas */}
          <div className="space-y-3">
            <Label>Types de repas à générer</Label>
            <div className="grid grid-cols-2 gap-3">
              {MEAL_TYPES.map((meal) => (
                <div key={meal.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={meal.id}
                    checked={selectedMealTypes.includes(meal.id)}
                    onCheckedChange={() => toggleMealType(meal.id)}
                  />
                  <label
                    htmlFor={meal.id}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {meal.label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Budget */}
          <div className="space-y-2">
            <Label>Budget</Label>
            <div className="flex gap-2">
              {["économique", "moyen", "élevé"].map((level) => (
                <Badge
                  key={level}
                  variant={budget === level ? "default" : "outline"}
                  className="cursor-pointer capitalize"
                  onClick={() => setBudget(level)}
                >
                  {level}
                </Badge>
              ))}
            </div>
          </div>

          {/* Types de cuisine */}
          <div className="space-y-3">
            <Label>Types de cuisine préférés (optionnel)</Label>
            <div className="flex flex-wrap gap-2">
              {CUISINE_TYPES.map((cuisine) => (
                <Badge
                  key={cuisine}
                  variant={selectedCuisines.includes(cuisine) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleCuisine(cuisine)}
                >
                  {cuisine}
                </Badge>
              ))}
            </div>
          </div>

          {/* Autres informations */}
          <div className="space-y-2">
            <Label htmlFor="preferences">Autres informations (optionnel)</Label>
            <Textarea
              id="preferences"
              placeholder="Ex: Jeudi je veux une omelette, vendredi je veux bo bun, je ne veux aucun plat de pâtes, pas de poisson..."
              value={preferences}
              onChange={(e) => setPreferences(e.target.value)}
              rows={4}
            />
            <p className="text-xs text-stone-500">
              Indiquez vos souhaits spécifiques, plats à éviter, jours particuliers, etc.
            </p>
          </div>

          {/* Utiliser recettes existantes */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="useExisting"
              checked={useExistingRecipes}
              onCheckedChange={(checked) => setUseExistingRecipes(checked as boolean)}
            />
            <label
              htmlFor="useExisting"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              Utiliser mes recettes existantes quand c'est possible
            </label>
          </div>
        </div>

        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isGenerating}>
            Annuler
          </Button>
          <Button onClick={handleGenerate} disabled={isGenerating} className="gap-2">
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Génération en cours...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Générer le Menu
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
