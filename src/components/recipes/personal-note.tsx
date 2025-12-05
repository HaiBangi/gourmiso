"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Pencil, Save, X, StickyNote } from "lucide-react";
import { saveUserNote } from "@/actions/notes";

interface PersonalNoteProps {
  recipeId: number;
  initialNote?: string | null;
}

export function PersonalNote({ recipeId, initialNote }: PersonalNoteProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [note, setNote] = useState(initialNote || "");
  const [savedNote, setSavedNote] = useState(initialNote || "");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setNote(initialNote || "");
    setSavedNote(initialNote || "");
  }, [initialNote]);

  const handleSave = async () => {
    setIsSaving(true);
    const result = await saveUserNote(recipeId, note);
    if (result.success) {
      setSavedNote(note);
      setIsEditing(false);
    }
    setIsSaving(false);
  };

  const handleCancel = () => {
    setNote(savedNote);
    setIsEditing(false);
  };

  // If no note and not editing, show add button
  if (!savedNote && !isEditing) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsEditing(true)}
        className="text-amber-600 border-amber-200 hover:bg-amber-50"
      >
        <StickyNote className="h-4 w-4 mr-2" />
        Ajouter une note personnelle
      </Button>
    );
  }

  return (
    <Card className="border border-yellow-200 bg-yellow-50/50 shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="font-serif text-base flex items-center gap-2 text-yellow-800">
            <StickyNote className="h-4 w-4" />
            Ma note personnelle
          </CardTitle>
          {!isEditing && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="h-8 px-2 text-yellow-700 hover:text-yellow-900 hover:bg-yellow-100"
            >
              <Pencil className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="pb-3">
        {isEditing ? (
          <div className="space-y-3">
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ajoutez vos notes personnelles ici... (ex: Mettre moins de sel, Maman adore cette recette)"
              className="min-h-[100px] bg-white border-yellow-200 focus:border-yellow-400"
              autoFocus
            />
            <div className="flex gap-2 justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancel}
                disabled={isSaving}
              >
                <X className="h-4 w-4 mr-1" />
                Annuler
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={isSaving}
                className="bg-yellow-600 hover:bg-yellow-700"
              >
                <Save className="h-4 w-4 mr-1" />
                {isSaving ? "Sauvegarde..." : "Sauvegarder"}
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-yellow-900 whitespace-pre-wrap">{savedNote}</p>
        )}
      </CardContent>
    </Card>
  );
}

