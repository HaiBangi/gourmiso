"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Lock, Globe, Loader2, Share2, ShoppingCart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { WeeklyCalendar } from "@/components/meal-planner/weekly-calendar";
import { ShoppingListDialog } from "@/components/meal-planner/shopping-list-dialog";
import { Toast, useToast } from "@/components/ui/toast";

export default function MealPlanPage() {
  const params = useParams();
  const router = useRouter();
  const planId = params.id as string;

  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sharingLoading, setSharingLoading] = useState(false);
  const [showShoppingList, setShowShoppingList] = useState(false);
  const { toast, showToast, hideToast } = useToast();

  useEffect(() => {
    if (planId) {
      fetchPlan();
    }
  }, [planId]);

  const fetchPlan = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/meal-planner/plan/${planId}`);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Erreur lors du chargement");
      }
      const data = await res.json();
      setPlan(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const togglePublic = async () => {
    if (!plan?.isOwner) return;

    setSharingLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/meal-planner/plan/${planId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublic: !plan.isPublic }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error('❌ Erreur API toggle public:', errorData);
        throw new Error(
          errorData.message || errorData.error || 'Erreur lors de la mise à jour'
        );
      }

      const data = await res.json();
      setPlan({ ...plan, isPublic: data.isPublic });
      console.log('✅ Visibilité mise à jour:', data.isPublic ? 'Public' : 'Privé');
    } catch (err: any) {
      console.error('❌ Erreur toggle public:', err);
      setError(err.message || 'Erreur lors de la mise à jour de la visibilité');
    } finally {
      setSharingLoading(false);
    }
  };

  const copyShareLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      showToast('🔗 Lien copié dans le presse-papier !');
    }).catch(() => {
      showToast('❌ Erreur lors de la copie du lien');
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 dark:bg-stone-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          <p className="text-stone-600 dark:text-stone-400">Chargement du menu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 z-50 bg-gradient-to-br from-stone-50 via-stone-100 to-stone-200 dark:from-stone-950 dark:via-stone-900 dark:to-stone-800 flex items-center justify-center p-4 overflow-hidden">
        <Card className="max-w-md w-full shadow-2xl">
          <CardContent className="p-8">
            <div className="text-center space-y-6">
              <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center ring-4 ring-red-50 dark:ring-red-900/20">
                <Lock className="h-8 w-8 text-red-600 dark:text-red-400" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-stone-900 dark:text-stone-100">
                  Accès refusé
                </h2>
                <p className="text-stone-600 dark:text-stone-400 leading-relaxed">
                  {error}
                </p>
              </div>
              <Button 
                onClick={() => router.push('/meal-planner')} 
                className="w-full"
                size="lg"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour à mes menus
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!plan) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 dark:from-stone-950 dark:via-stone-900 dark:to-stone-950">
      <div className="max-w-[1800px] mx-auto px-4 py-6 space-y-6">
        {/* Header avec navigation et partage */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/meal-planner')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
            
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">
                  {plan.name}
                </h1>
                {plan.isPublic ? (
                  <Badge variant="outline" className="gap-1 bg-emerald-50 text-emerald-700 border-emerald-300">
                    <Globe className="h-3 w-3" />
                    Public
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="gap-1">
                    <Lock className="h-3 w-3" />
                    Privé
                  </Badge>
                )}
              </div>
              <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
                Créé par {plan.user.pseudo || plan.user.name || 'Anonyme'}
              </p>
            </div>
          </div>

          {/* Boutons d'actions */}
          <div className="flex gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowShoppingList(true)}
              className="gap-2"
            >
              <ShoppingCart className="h-4 w-4" />
              Liste de courses
            </Button>

            {plan.isOwner && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={togglePublic}
                  disabled={sharingLoading}
                  className="gap-2"
                >
                  {sharingLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : plan.isPublic ? (
                    <Lock className="h-4 w-4" />
                  ) : (
                    <Globe className="h-4 w-4" />
                  )}
                  {plan.isPublic ? 'Rendre privé' : 'Rendre public'}
                </Button>

                {plan.isPublic && (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={copyShareLink}
                    className="gap-2"
                  >
                    <Share2 className="h-4 w-4" />
                    Partager
                  </Button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Vue calendrier hebdomadaire */}
        <WeeklyCalendar
          plan={plan}
          onRefresh={fetchPlan}
          readOnly={!plan.isOwner}
        />

        {/* Liste de courses Dialog */}
        <ShoppingListDialog
          open={showShoppingList}
          onOpenChange={setShowShoppingList}
          plan={plan}
          onUpdate={fetchPlan}
        />

        {/* Toast pour les notifications */}
        <Toast
          message={toast.message}
          isVisible={toast.isVisible}
          onClose={hideToast}
        />
      </div>
    </div>
  );
}
