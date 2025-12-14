"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Lightbulb, 
  Save, 
  X, 
  Sparkles 
} from "lucide-react";
import { createUserNote, updateUserNote, deleteUserNote } from "@/actions/notes-user";

interface Note {
  id: number;
  title: string;
  content: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface NotesClientProps {
  initialNotes: Note[];
}

export function NotesClient({ initialNotes }: NotesClientProps) {
  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [isCreating, setIsCreating] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!newTitle.trim()) return;
    
    setLoading(true);
    try {
      const note = await createUserNote(newTitle, newContent || undefined);
      setNotes([note, ...notes]);
      setNewTitle("");
      setNewContent("");
      setIsCreating(false);
    } catch (error) {
      console.error("Erreur lors de la création:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!editingNote || !newTitle.trim()) return;
    
    setLoading(true);
    try {
      const updated = await updateUserNote(editingNote.id, newTitle, newContent || undefined);
      setNotes(notes.map(n => n.id === updated.id ? updated : n));
      setEditingNote(null);
      setNewTitle("");
      setNewContent("");
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Voulez-vous vraiment supprimer cette note ?")) return;
    
    setLoading(true);
    try {
      await deleteUserNote(id);
      setNotes(notes.filter(n => n.id !== id));
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
    } finally {
      setLoading(false);
    }
  };

  const openEditDialog = (note: Note) => {
    setEditingNote(note);
    setNewTitle(note.title);
    setNewContent(note.content || "");
  };

  const closeDialogs = () => {
    setIsCreating(false);
    setEditingNote(null);
    setNewTitle("");
    setNewContent("");
  };

  return (
    <>
      {/* Header */}
      <div className="mb-8 sm:mb-12">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-stone-900 dark:text-stone-100 font-serif mb-2 flex items-center gap-3">
              <Lightbulb className="h-8 w-8 sm:h-10 sm:w-10 text-amber-500 fill-amber-500" />
              Mes Notes
            </h1>
            <p className="text-stone-600 dark:text-stone-400 text-sm sm:text-base">
              Gardez vos idées de recettes en un seul endroit
            </p>
          </div>
          
          <Button 
            onClick={() => setIsCreating(true)}
            className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg hover:shadow-xl transition-all gap-2"
          >
            <Plus className="h-5 w-5" />
            <span className="hidden sm:inline">Nouvelle note</span>
          </Button>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-2 text-sm text-stone-500 dark:text-stone-400">
          <Sparkles className="h-4 w-4" />
          <span>{notes.length} {notes.length > 1 ? "idées" : "idée"} enregistrée{notes.length > 1 ? "s" : ""}</span>
        </div>
      </div>

      {/* Notes Grid */}
      {notes.length === 0 ? (
        <Card className="p-12 sm:p-16 text-center border-2 border-dashed border-stone-200 dark:border-stone-700 bg-white/50 dark:bg-stone-800/50">
          <Lightbulb className="h-16 w-16 mx-auto mb-4 text-stone-300 dark:text-stone-600" />
          <h3 className="text-xl font-semibold text-stone-700 dark:text-stone-300 mb-2">
            Aucune note pour le moment
          </h3>
          <p className="text-stone-500 dark:text-stone-400 mb-6">
            Commencez à noter vos idées de recettes !
          </p>
          <Button 
            onClick={() => setIsCreating(true)}
            className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white gap-2"
          >
            <Plus className="h-5 w-5" />
            Créer ma première note
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {notes.map((note) => (
            <Card 
              key={note.id}
              className="group relative p-5 sm:p-6 border border-stone-200 dark:border-stone-700 bg-gradient-to-br from-white to-stone-50/50 dark:from-stone-800 dark:to-stone-900/50 hover:shadow-xl hover:scale-[1.02] transition-all duration-300"
            >
              {/* Note Content */}
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-100 mb-2 line-clamp-2">
                  {note.title}
                </h3>
                {note.content && (
                  <p className="text-sm text-stone-600 dark:text-stone-400 line-clamp-3 whitespace-pre-wrap">
                    {note.content}
                  </p>
                )}
              </div>

              {/* Date */}
              <div className="text-xs text-stone-400 dark:text-stone-500 mb-4">
                {new Date(note.createdAt).toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openEditDialog(note)}
                  className="flex-1 gap-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-700 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  <Edit2 className="h-4 w-4" />
                  Modifier
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(note.id)}
                  disabled={loading}
                  className="gap-2 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-300 dark:hover:border-red-700 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={isCreating} onOpenChange={setIsCreating}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Plus className="h-5 w-5 text-emerald-600" />
              Nouvelle note
            </DialogTitle>
            <DialogDescription>
              Notez vos idées de recettes pour ne jamais les oublier
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 pt-4">
            <div>
              <Input
                placeholder="Titre de l'idée (ex: Tarte aux pommes de grand-mère)"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="text-base"
                autoFocus
              />
            </div>
            
            <div>
              <Textarea
                placeholder="Détails optionnels (ingrédients, instructions, notes...)"
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                rows={5}
                className="resize-none"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                onClick={handleCreate}
                disabled={!newTitle.trim() || loading}
                className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white gap-2"
              >
                <Save className="h-4 w-4" />
                Enregistrer
              </Button>
              <Button
                variant="outline"
                onClick={closeDialogs}
                disabled={loading}
                className="gap-2"
              >
                <X className="h-4 w-4" />
                Annuler
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editingNote} onOpenChange={(open) => !open && closeDialogs()}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Edit2 className="h-5 w-5 text-blue-600" />
              Modifier la note
            </DialogTitle>
            <DialogDescription>
              Mettez à jour votre idée de recette
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 pt-4">
            <div>
              <Input
                placeholder="Titre de l'idée"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="text-base"
              />
            </div>
            
            <div>
              <Textarea
                placeholder="Détails optionnels"
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                rows={5}
                className="resize-none"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                onClick={handleUpdate}
                disabled={!newTitle.trim() || loading}
                className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white gap-2"
              >
                <Save className="h-4 w-4" />
                Enregistrer
              </Button>
              <Button
                variant="outline"
                onClick={closeDialogs}
                disabled={loading}
                className="gap-2"
              >
                <X className="h-4 w-4" />
                Annuler
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
