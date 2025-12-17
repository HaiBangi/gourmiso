"use client";

import { ShoppingListDialog } from "./shopping-list-dialog";
import { useRealtimeShoppingList } from "@/hooks/use-realtime-shopping-list";
import { useMemo } from "react";
import { Wifi, WifiOff } from "lucide-react";

interface RealtimeShoppingListDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plan: any;
  onUpdate?: () => void;
  canOptimize?: boolean;
}

export function RealtimeShoppingListDialog({
  open,
  onOpenChange,
  plan,
  onUpdate,
  canOptimize = false,
}: RealtimeShoppingListDialogProps) {
  const { items: realtimeItems, toggleIngredient, isConnected, isLoading } = useRealtimeShoppingList(
    open ? plan?.id : null
  );

  // Merger les données temps réel avec la liste de courses statique
  const enhancedPlan = useMemo(() => {
    if (!plan || realtimeItems.length === 0) return plan;

    // Créer un map des items cochés
    const checkedMap = new Map<string, boolean>();
    realtimeItems.forEach((item) => {
      const key = `${item.ingredientName}`;
      checkedMap.set(key, item.isChecked);
    });

    return {
      ...plan,
      _realtimeChecked: checkedMap,
      _realtimeItems: realtimeItems,
    };
  }, [plan, realtimeItems]);

  return (
    <>
      {/* Indicateur de connexion temps réel */}
      {open && (
        <div className="fixed top-20 right-4 z-[100] flex flex-col gap-1">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-stone-800 shadow-lg border border-stone-200 dark:border-stone-700 transition-all">
            {isLoading ? (
              <>
                <div className="h-2 w-2 rounded-full bg-yellow-500 animate-pulse" />
                <span className="text-xs font-medium text-stone-600 dark:text-stone-400">
                  Connexion...
                </span>
              </>
            ) : isConnected ? (
              <>
                <Wifi className="h-3 w-3 text-emerald-500 animate-pulse" />
                <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                  Temps réel actif
                </span>
              </>
            ) : (
              <>
                <WifiOff className="h-3 w-3 text-red-500" />
                <span className="text-xs font-medium text-red-500">
                  Déconnecté
                </span>
              </>
            )}
          </div>
          {/* Info supplémentaire */}
          {isConnected && (
            <div className="text-[10px] text-stone-500 dark:text-stone-400 text-right px-2">
              {realtimeItems.length} ingrédient{realtimeItems.length > 1 ? 's' : ''} synchronisé{realtimeItems.length > 1 ? 's' : ''}
            </div>
          )}
        </div>
      )}

      <ShoppingListDialog
        open={open}
        onOpenChange={onOpenChange}
        plan={enhancedPlan}
        onUpdate={onUpdate}
        canOptimize={canOptimize}
        realtimeToggle={toggleIngredient}
        realtimeItems={realtimeItems}
      />
    </>
  );
}
