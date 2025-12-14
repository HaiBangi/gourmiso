"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Edit2, Trash2, Calendar as CalendarIcon, ShoppingCart } from "lucide-react";
import { WeeklyCalendar } from "@/components/meal-planner/weekly-calendar";
import { MealPlannerDialog } from "@/components/meal-planner/meal-planner-dialog-new";
import { EditPlanDialog } from "@/components/meal-planner/edit-plan-dialog";
import { ShoppingListDialog } from "@/components/meal-planner/shopping-list-dialog";

const DAYS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];

export default function MealPlannerPage() {
  const { data: session } = useSession();
  const [plans, setPlans] = useState<any[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showShoppingList, setShowShoppingList] = useState(false);

  const selectedPlan = plans.find(p => p.id === selectedPlanId);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const res = await fetch("/api/meal-planner/saved");
      if (res.ok) {
        const data = await res.json();
        setPlans(data);
        if (data.length > 0 && !selectedPlanId) {
          setSelectedPlanId(data[0].id);
        }
      }
    } catch (error) {
      console.error("Erreur lors du chargement des plans:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePlan = async (planId: number) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce menu ?")) return;
    
    try {
      const res = await fetch(`/api/meal-planner/plan/${planId}`, {
        method: "DELETE",
      });
      
      if (res.ok) {
        await fetchPlans();
        if (selectedPlanId === planId) {
          setSelectedPlanId(plans[0]?.id || null);
        }
      }
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
    }
  };

  const handleUpdatePlanName = async (planId: number, newName: string) => {
    try {
      const res = await fetch(`/api/meal-planner/plan/${planId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName }),
      });
      
      if (res.ok) {
        await fetchPlans();
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error);
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Veuillez vous connecter pour accéder au planificateur de menus.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 dark:from-stone-950 dark:via-stone-900 dark:to-stone-950">
      <div className="max-w-[1800px] mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-stone-900 dark:text-stone-100">
              Planificateur de Menus
            </h1>
            <p className="text-stone-600 dark:text-stone-400 mt-1">
              Organisez vos repas de la semaine
            </p>
          </div>
          
          <div className="flex gap-2">
            {selectedPlan && (
              <Button 
                onClick={() => setShowShoppingList(true)}
                variant="outline"
                className="gap-2"
              >
                <ShoppingCart className="h-4 w-4" />
                Liste de Courses
              </Button>
            )}
            <Button 
              onClick={() => setIsCreateDialogOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nouveau Menu
            </Button>
          </div>
        </div>

        {/* Plans List */}
        <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all cursor-pointer ${
                selectedPlanId === plan.id
                  ? "border-emerald-600 bg-emerald-50 dark:bg-emerald-900/30"
                  : "border-stone-200 dark:border-stone-700 hover:border-emerald-300"
              }`}
              onClick={() => setSelectedPlanId(plan.id)}
            >
              <CalendarIcon className="h-4 w-4 text-emerald-600" />
              <span className="font-medium whitespace-nowrap">{plan.name}</span>
              <div className="flex gap-1 ml-2">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsEditDialogOpen(true);
                  }}
                >
                  <Edit2 className="h-3 w-3" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0 text-red-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeletePlan(plan.id);
                  }}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Calendar */}
        {selectedPlan ? (
          <WeeklyCalendar 
            plan={selectedPlan} 
            onRefresh={fetchPlans}
          />
        ) : (
          <Card>
            <CardContent className="py-20 text-center">
              <CalendarIcon className="h-16 w-16 mx-auto mb-4 text-stone-300" />
              <h3 className="text-xl font-semibold mb-2">Aucun menu</h3>
              <p className="text-stone-500 mb-6">
                Créez votre premier menu hebdomadaire pour commencer
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Créer un Menu
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Dialogs */}
      <MealPlannerDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={fetchPlans}
      />
      
      {selectedPlan && (
        <>
          <EditPlanDialog
            open={isEditDialogOpen}
            onOpenChange={setIsEditDialogOpen}
            plan={selectedPlan}
            onUpdate={handleUpdatePlanName}
          />
          
          <ShoppingListDialog
            open={showShoppingList}
            onOpenChange={setShowShoppingList}
            plan={selectedPlan}
          />
        </>
      )}
    </div>
  );
}