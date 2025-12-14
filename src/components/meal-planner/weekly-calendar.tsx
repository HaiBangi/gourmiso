"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { MealCard } from "./meal-card";
import { AddMealDialog } from "./add-meal-dialog";

const DAYS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];
const TIME_SLOTS = [
  { time: "08:00", label: "Petit-déjeuner", type: "Petit-déjeuner" },
  { time: "12:00", label: "Déjeuner", type: "Déjeuner" },
  { time: "16:00", label: "Collation", type: "Collation" },
  { time: "19:00", label: "Dîner", type: "Dîner" },
];

interface WeeklyCalendarProps {
  plan: any;
  onRefresh: () => void;
}

export function WeeklyCalendar({ plan, onRefresh }: WeeklyCalendarProps) {
  const [selectedSlot, setSelectedSlot] = useState<{ day: string; time: string; type: string } | null>(null);

  const getMealForSlot = (day: string, timeSlot: string) => {
    return plan.meals?.find(
      (meal: any) => meal.dayOfWeek === day && meal.timeSlot === timeSlot
    );
  };

  const handleAddMeal = (day: string, time: string, type: string) => {
    setSelectedSlot({ day, time, type });
  };

  return (
    <>
      <div className="grid grid-cols-8 gap-2 bg-white dark:bg-stone-800 rounded-lg shadow-lg p-4">
        {/* Header Row - Time Labels */}
        <div className="col-span-1 flex flex-col gap-2">
          <div className="h-12 flex items-center justify-center font-semibold text-sm text-stone-600 dark:text-stone-400">
            Horaire
          </div>
          {TIME_SLOTS.map((slot) => (
            <div
              key={slot.time}
              className="h-32 flex flex-col items-center justify-center border rounded-lg bg-stone-50 dark:bg-stone-900 p-2"
            >
              <div className="text-lg font-bold text-emerald-600">{slot.time}</div>
              <div className="text-xs text-stone-600 dark:text-stone-400 text-center mt-1">
                {slot.label}
              </div>
            </div>
          ))}
        </div>

        {/* Days Columns */}
        {DAYS.map((day) => (
          <div key={day} className="flex flex-col gap-2">
            {/* Day Header */}
            <div className="h-12 flex items-center justify-center font-bold text-stone-900 dark:text-stone-100 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-lg shadow-sm">
              {day}
            </div>

            {/* Time Slots */}
            {TIME_SLOTS.map((slot) => {
              const meal = getMealForSlot(day, slot.time);
              
              return (
                <div
                  key={`${day}-${slot.time}`}
                  className="h-32 border-2 border-dashed border-stone-200 dark:border-stone-700 rounded-lg hover:border-emerald-300 dark:hover:border-emerald-600 transition-all relative group"
                >
                  {meal ? (
                    <MealCard 
                      meal={meal} 
                      planId={plan.id}
                      onRefresh={onRefresh}
                    />
                  ) : (
                    <button
                      onClick={() => handleAddMeal(day, slot.time, slot.type)}
                      className="w-full h-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Plus className="h-6 w-6 text-stone-400" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Add Meal Dialog */}
      {selectedSlot && (
        <AddMealDialog
          open={!!selectedSlot}
          onOpenChange={(open) => !open && setSelectedSlot(null)}
          planId={plan.id}
          day={selectedSlot.day}
          timeSlot={selectedSlot.time}
          mealType={selectedSlot.type}
          onSuccess={() => {
            onRefresh();
            setSelectedSlot(null);
          }}
        />
      )}
    </>
  );
}
