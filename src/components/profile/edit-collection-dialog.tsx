"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { updateCollection } from "@/actions/collections";

interface EditCollectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  collection: {
    id: number;
    name: string;
    description: string | null;
    color: string;
  };
}

const COLORS = [
  { value: "#10b981", label: "Émeraude" },
  { value: "#3b82f6", label: "Bleu" },
  { value: "#8b5cf6", label: "Violet" },
  { value: "#ec4899", label: "Rose" },
  { value: "#f59e0b", label: "Orange" },
  { value: "#ef4444", label: "Rouge" },
  { value: "#14b8a6", label: "Turquoise" },
  { value: "#6366f1", label: "Indigo" },
];

export function EditCollectionDialog({ open, onOpenChange, collection }: EditCollectionDialogProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState(collection.name);
  const [description, setDescription] = useState(collection.description || "");
  const [selectedColor, setSelectedColor] = useState(collection.color);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsLoading(true);
    try {
      const result = await updateCollection(collection.id, {
        name: name.trim(),
        description: description.trim() || undefined,
        color: selectedColor,
      });

      if (result.success) {
        onOpenChange(false);
        router.refresh();
      }
    } catch (error) {
      console.error("Error updating collection:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Modifier la collection</DialogTitle>
            <DialogDescription>
              Modifiez les informations de votre collection
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Nom */}
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nom de la collection *</Label>
              <Input
                id="edit-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Recettes d'été, Plats rapides..."
                maxLength={50}
                required
              />
              <p className="text-xs text-stone-500 dark:text-stone-400">
                {name.length}/50 caractères
              </p>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description (optionnel)</Label>
              <Textarea
                id="edit-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ajoutez une description pour cette collection..."
                rows={3}
                maxLength={200}
              />
              <p className="text-xs text-stone-500 dark:text-stone-400">
                {description.length}/200 caractères
              </p>
            </div>

            {/* Couleur */}
            <div className="space-y-2">
              <Label>Couleur</Label>
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                {COLORS.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => setSelectedColor(color.value)}
                    className={`h-10 w-full rounded-lg border-2 transition-all ${
                      selectedColor === color.value
                        ? "border-stone-900 dark:border-stone-100 scale-110"
                        : "border-transparent hover:border-stone-300 dark:hover:border-stone-600"
                    }`}
                    style={{ backgroundColor: color.value }}
                    title={color.label}
                  />
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading || !name.trim()}>
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Enregistrer
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
