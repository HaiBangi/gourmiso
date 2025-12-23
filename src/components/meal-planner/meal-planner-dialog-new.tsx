"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

interface MealPlannerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (newPlanId?: number) => void;
}

export function MealPlannerDialog({ open, onOpenChange, onSuccess }: MealPlannerDialogProps) {
  const [formData, setFormData] = useState({
    name: `Menu du ${new Date().toLocaleDateString("fr-FR")}`,
    numberOfPeople: 2,
    budget: "moyen",
    cookingTime: "moyen",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch("/api/meal-planner/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        const createdPlan = await res.json();
        onSuccess(createdPlan.id); // Passer l'ID du nouveau plan
        onOpenChange(false);
        setFormData({
          name: `Menu du ${new Date().toLocaleDateString("fr-FR")}`,
          numberOfPeople: 2,
          budget: "moyen",
          cookingTime: "moyen",
        });
      }
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Créer un nouveau menu</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nom du menu</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="people">Nombre de personnes</Label>
            <Input
              id="people"
              type="number"
              min={1}
              value={formData.numberOfPeople}
              onChange={(e) =>
                setFormData({ ...formData, numberOfPeople: parseInt(e.target.value) })
              }
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading ? "Création..." : "Créer le menu"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
