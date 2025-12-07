"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, Plus, GripVertical, FolderPlus, Edit2, Check, X } from "lucide-react";
import { Card } from "@/components/ui/card";

interface IngredientInput {
  id: string;
  name: string;
  quantityUnit: string;
}

interface IngredientGroupInput {
  id: string;
  name: string;
  ingredients: IngredientInput[];
  isEditing?: boolean;
}

interface IngredientGroupsEditorProps {
  groups: IngredientGroupInput[];
  onChange: (groups: IngredientGroupInput[]) => void;
  disabled?: boolean;
}

export function IngredientGroupsEditor({
  groups,
  onChange,
  disabled = false,
}: IngredientGroupsEditorProps) {
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [editingGroupName, setEditingGroupName] = useState("");
  const [draggedIngredient, setDraggedIngredient] = useState<{ groupId: string; ingredientId: string } | null>(null);
  const inputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  const addGroup = () => {
    const newGroup: IngredientGroupInput = {
      id: `group-${Date.now()}`,
      name: "Nouveau groupe",
      ingredients: [
        { id: `ing-${Date.now()}`, name: "", quantityUnit: "" },
      ],
      isEditing: true,
    };
    onChange([...groups, newGroup]);
    setEditingGroupId(newGroup.id);
    setEditingGroupName(newGroup.name);
  };

  const removeGroup = (groupId: string) => {
    if (groups.length === 1) return; // Toujours garder au moins un groupe
    onChange(groups.filter((g) => g.id !== groupId));
  };

  const updateGroupName = (groupId: string, name: string) => {
    onChange(
      groups.map((g) => (g.id === groupId ? { ...g, name } : g))
    );
  };

  const startEditingGroupName = (groupId: string, currentName: string) => {
    setEditingGroupId(groupId);
    setEditingGroupName(currentName);
  };

  const saveGroupName = (groupId: string) => {
    if (editingGroupName.trim()) {
      updateGroupName(groupId, editingGroupName.trim());
    }
    setEditingGroupId(null);
    setEditingGroupName("");
  };

  const cancelEditingGroupName = () => {
    setEditingGroupId(null);
    setEditingGroupName("");
  };

  const addIngredientToGroup = (groupId: string) => {
    const newIngId = `ing-${Date.now()}`;
    onChange(
      groups.map((g) =>
        g.id === groupId
          ? {
              ...g,
              ingredients: [
                ...g.ingredients,
                {
                  id: newIngId,
                  name: "",
                  quantityUnit: "",
                },
              ],
            }
          : g
      )
    );
    // Focus sur le nouveau champ après un court délai
    setTimeout(() => {
      const input = inputRefs.current[`${groupId}-${newIngId}-qty`];
      if (input) input.focus();
    }, 50);
  };

  const removeIngredientFromGroup = (groupId: string, ingredientId: string) => {
    onChange(
      groups.map((g) =>
        g.id === groupId
          ? {
              ...g,
              ingredients: g.ingredients.filter((i) => i.id !== ingredientId),
            }
          : g
      )
    );
  };

  const updateIngredient = (
    groupId: string,
    ingredientId: string,
    field: keyof IngredientInput,
    value: string
  ) => {
    onChange(
      groups.map((g) =>
        g.id === groupId
          ? {
              ...g,
              ingredients: g.ingredients.map((i) =>
                i.id === ingredientId ? { ...i, [field]: value } : i
              ),
            }
          : g
      )
    );
  };

  // Navigation Enter entre les champs
  const handleQuantityKeyDown = (e: React.KeyboardEvent, groupId: string, ingredientId: string) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const nameInput = inputRefs.current[`${groupId}-${ingredientId}-name`];
      if (nameInput) nameInput.focus();
    }
  };

  const handleNameKeyDown = (e: React.KeyboardEvent, groupId: string, ingredientId: string) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addIngredientToGroup(groupId);
    }
  };

  // Drag and drop pour réorganiser les groupes
  const [draggedGroupId, setDraggedGroupId] = useState<string | null>(null);

  const handleGroupDragStart = (e: React.DragEvent, groupId: string) => {
    setDraggedGroupId(groupId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleGroupDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleGroupDrop = (e: React.DragEvent, targetGroupId: string) => {
    e.preventDefault();

    if (!draggedGroupId || draggedGroupId === targetGroupId) {
      setDraggedGroupId(null);
      return;
    }

    const draggedIndex = groups.findIndex((g) => g.id === draggedGroupId);
    const targetIndex = groups.findIndex((g) => g.id === targetGroupId);

    if (draggedIndex === -1 || targetIndex === -1) {
      setDraggedGroupId(null);
      return;
    }

    const newGroups = [...groups];
    const [draggedGroup] = newGroups.splice(draggedIndex, 1);
    newGroups.splice(targetIndex, 0, draggedGroup);

    onChange(newGroups);
    setDraggedGroupId(null);
  };

  const handleGroupDragEnd = () => {
    setDraggedGroupId(null);
  };

  // Drag and drop pour déplacer des ingrédients entre groupes
  const handleIngredientDragStart = (e: React.DragEvent, groupId: string, ingredientId: string) => {
    setDraggedIngredient({ groupId, ingredientId });
    e.dataTransfer.effectAllowed = "move";
  };

  const handleIngredientDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleIngredientDrop = (e: React.DragEvent, targetGroupId: string) => {
    e.preventDefault();
    e.stopPropagation();

    if (!draggedIngredient) return;

    const { groupId: sourceGroupId, ingredientId } = draggedIngredient;

    // Si on dépose dans le même groupe, ne rien faire
    if (sourceGroupId === targetGroupId) {
      setDraggedIngredient(null);
      return;
    }

    // Trouver l'ingrédient à déplacer
    const sourceGroup = groups.find(g => g.id === sourceGroupId);
    const ingredient = sourceGroup?.ingredients.find(i => i.id === ingredientId);

    if (!ingredient) {
      setDraggedIngredient(null);
      return;
    }

    // Retirer de l'ancien groupe et ajouter au nouveau
    const newGroups = groups.map(g => {
      if (g.id === sourceGroupId) {
        return {
          ...g,
          ingredients: g.ingredients.filter(i => i.id !== ingredientId)
        };
      }
      if (g.id === targetGroupId) {
        return {
          ...g,
          ingredients: [...g.ingredients, ingredient]
        };
      }
      return g;
    });

    onChange(newGroups);
    setDraggedIngredient(null);
  };

  const handleIngredientDragEnd = () => {
    setDraggedIngredient(null);
  };

  // Double-clic pour renommer le groupe
  const handleGroupNameDoubleClick = (groupId: string, currentName: string) => {
    if (!disabled) {
      startEditingGroupName(groupId, currentName);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header avec bouton d'ajout de groupe */}
      <div className="flex items-center justify-between">
        <Label className="text-sm font-semibold flex items-center gap-2">
          <FolderPlus className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          Groupes d'ingrédients
          <span className="text-xs text-stone-500 font-normal">
            (Glisser-déposer pour réorganiser)
          </span>
        </Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addGroup}
          disabled={disabled}
          className="h-7 text-xs border-emerald-300 dark:border-emerald-600 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 cursor-pointer"
        >
          <FolderPlus className="h-3.5 w-3.5 mr-1" />
          Ajouter un groupe
        </Button>
      </div>

      {/* Liste des groupes */}
      <div className="space-y-4">
        {groups.map((group, groupIndex) => (
          <Card
            key={group.id}
            draggable={!disabled}
            onDragStart={(e) => handleGroupDragStart(e, group.id)}
            onDragOver={handleGroupDragOver}
            onDrop={(e) => handleGroupDrop(e, group.id)}
            onDragEnd={handleGroupDragEnd}
            className={`p-4 border-2 transition-all ${
              draggedGroupId === group.id
                ? "opacity-50 scale-95 border-emerald-400"
                : "border-emerald-200 dark:border-emerald-800 hover:border-emerald-300 dark:hover:border-emerald-700"
            }`}
          >
            {/* Header du groupe */}
            <div className="flex items-center gap-3 mb-4">
              <GripVertical className="h-5 w-5 text-stone-400 cursor-grab active:cursor-grabbing flex-shrink-0" />

              {editingGroupId === group.id ? (
                // Mode édition du nom
                <div className="flex-1 flex items-center gap-2">
                  <Input
                    value={editingGroupName}
                    onChange={(e) => setEditingGroupName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        saveGroupName(group.id);
                      } else if (e.key === "Escape") {
                        cancelEditingGroupName();
                      }
                    }}
                    placeholder="Nom du groupe..."
                    className="h-8 text-sm font-semibold"
                    autoFocus
                    disabled={disabled}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => saveGroupName(group.id)}
                    className="h-7 px-2 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-100"
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={cancelEditingGroupName}
                    className="h-7 px-2 text-stone-500 hover:text-stone-700 hover:bg-stone-100"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                // Mode affichage du nom - Double-clic pour éditer
                <>
                  <h4 
                    className="flex-1 font-semibold text-stone-800 dark:text-stone-100 text-sm cursor-pointer hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors"
                    onDoubleClick={() => handleGroupNameDoubleClick(group.id, group.name)}
                    title="Double-cliquez pour renommer"
                  >
                    {group.name} <span className="text-xs text-stone-500 font-normal">({group.ingredients.length})</span>
                  </h4>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => startEditingGroupName(group.id, group.name)}
                    disabled={disabled}
                    className="h-7 px-2 text-stone-500 hover:text-emerald-600 hover:bg-emerald-50"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </Button>
                </>
              )}

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => addIngredientToGroup(group.id)}
                disabled={disabled}
                className="h-7 px-2 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-100 cursor-pointer"
              >
                <Plus className="h-4 w-4" />
              </Button>

              {groups.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeGroup(group.id)}
                  disabled={disabled}
                  className="h-7 px-2 text-red-500 hover:text-red-700 hover:bg-red-50 cursor-pointer"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Zone de drop pour les ingrédients */}
            <div 
              className="space-y-2 pl-8"
              onDragOver={handleIngredientDragOver}
              onDrop={(e) => handleIngredientDrop(e, group.id)}
            >
              {group.ingredients.length === 0 ? (
                <p className="text-xs text-stone-400 italic py-2">
                  Aucun ingrédient dans ce groupe (glissez un ingrédient ici)
                </p>
              ) : (
                <>
                  {/* Header row pour desktop */}
                  <div className="hidden sm:grid sm:grid-cols-[80px_1fr_40px] gap-2 text-xs text-stone-500 dark:text-stone-400 font-medium px-2">
                    <span className="text-center">Qté + Unité</span>
                    <span className="pl-1">Ingrédient</span>
                    <span></span>
                  </div>

                  {group.ingredients.map((ingredient) => (
                    <div
                      key={ingredient.id}
                      draggable={!disabled}
                      onDragStart={(e) => handleIngredientDragStart(e, group.id, ingredient.id)}
                      onDragEnd={handleIngredientDragEnd}
                      className={`grid grid-cols-[70px_1fr_40px] sm:grid-cols-[80px_1fr_40px] gap-2 items-center px-2 py-2 rounded-lg bg-stone-50 dark:bg-stone-700/30 border border-stone-200 dark:border-stone-600 hover:border-emerald-300 dark:hover:border-emerald-600 transition-colors cursor-move ${
                        draggedIngredient?.ingredientId === ingredient.id ? 'opacity-50' : ''
                      }`}
                    >
                      <Input
                        ref={(el) => { inputRefs.current[`${group.id}-${ingredient.id}-qty`] = el; }}
                        value={ingredient.quantityUnit}
                        onChange={(e) =>
                          updateIngredient(
                            group.id,
                            ingredient.id,
                            "quantityUnit",
                            e.target.value
                          )
                        }
                        onKeyDown={(e) => handleQuantityKeyDown(e, group.id, ingredient.id)}
                        placeholder="150g"
                        disabled={disabled}
                        className="h-10 text-xs text-center bg-white dark:bg-stone-700 border-stone-200 dark:border-stone-600 dark:text-stone-100 placeholder:text-xs placeholder:italic placeholder:text-stone-400 dark:placeholder:text-stone-500"
                        title="Ex: 150g, 1 c.à.s, 2 kg - Appuyez sur Enter pour passer au nom"
                      />
                      <Input
                        ref={(el) => { inputRefs.current[`${group.id}-${ingredient.id}-name`] = el; }}
                        value={ingredient.name}
                        onChange={(e) =>
                          updateIngredient(
                            group.id,
                            ingredient.id,
                            "name",
                            e.target.value
                          )
                        }
                        onKeyDown={(e) => handleNameKeyDown(e, group.id, ingredient.id)}
                        placeholder="Nom de l'ingrédient..."
                        disabled={disabled}
                        className="h-10 text-xs border-stone-200 dark:border-stone-600 dark:bg-stone-700 dark:text-stone-100 placeholder:text-xs placeholder:italic placeholder:text-stone-400 dark:placeholder:text-stone-500"
                        title="Appuyez sur Enter pour ajouter un nouvel ingrédient"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          removeIngredientFromGroup(group.id, ingredient.id)
                        }
                        disabled={disabled || group.ingredients.length === 1}
                        className="h-10 w-10 text-stone-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 cursor-pointer disabled:opacity-30"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </>
              )}
            </div>
          </Card>
        ))}
      </div>

      {groups.length === 0 && (
        <div className="text-center py-8 border-2 border-dashed border-stone-200 dark:border-stone-700 rounded-lg">
          <FolderPlus className="h-12 w-12 text-stone-300 dark:text-stone-600 mx-auto mb-3" />
          <p className="text-sm text-stone-500 dark:text-stone-400 mb-3">
            Aucun groupe d'ingrédients
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addGroup}
            disabled={disabled}
            className="cursor-pointer"
          >
            <FolderPlus className="h-4 w-4 mr-2" />
            Créer un groupe
          </Button>
        </div>
      )}
    </div>
  );
}
