"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, SortAsc, Leaf, X } from "lucide-react";
import { useCallback, useTransition } from "react";

const sortOptions = [
  { value: "default", label: "Tri par défaut" },
  { value: "newest", label: "Plus récentes" },
  { value: "oldest", label: "Plus anciennes" },
  { value: "rating", label: "Meilleures notes" },
  { value: "time_asc", label: "Temps (croissant)" },
  { value: "time_desc", label: "Temps (décroissant)" },
  { value: "name_asc", label: "Nom (A-Z)" },
  { value: "name_desc", label: "Nom (Z-A)" },
];

const timeOptions = [
  { value: "all", label: "Tous les temps" },
  { value: "15", label: "< 15 min" },
  { value: "30", label: "< 30 min" },
  { value: "60", label: "< 1 heure" },
  { value: "120", label: "< 2 heures" },
];

const dietaryOptions = [
  { value: "vegetarian", label: "🥬 Végétarien", color: "bg-green-100 text-green-700" },
  { value: "vegan", label: "🌱 Vegan", color: "bg-emerald-100 text-emerald-700" },
  { value: "gluten-free", label: "🌾 Sans gluten", color: "bg-amber-100 text-amber-700" },
  { value: "dairy-free", label: "🥛 Sans lactose", color: "bg-blue-100 text-blue-700" },
  { value: "low-carb", label: "🥩 Low carb", color: "bg-red-100 text-red-700" },
];

interface AdvancedFiltersProps {
  currentSort?: string;
  currentMaxTime?: string;
  currentDietary?: string[];
}

export function AdvancedFilters({
  currentSort,
  currentMaxTime,
  currentDietary = [],
}: AdvancedFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value && value !== "all" && value !== "default") {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      });
      startTransition(() => {
        router.push(`/recipes?${params.toString()}`);
      });
    },
    [router, searchParams]
  );

  const toggleDietary = (value: string) => {
    const current = new Set(currentDietary);
    if (current.has(value)) {
      current.delete(value);
    } else {
      current.add(value);
    }
    updateParams({ dietary: current.size > 0 ? Array.from(current).join(",") : null });
  };

  const hasAdvancedFilters = currentSort || currentMaxTime || currentDietary.length > 0;

  return (
    <div className="hidden md:flex flex-wrap items-center gap-3 mb-4 p-4 rounded-xl bg-white/50 backdrop-blur-sm border border-amber-100">
      {/* Sort */}
      <div className="flex items-center gap-2">
        <SortAsc className="h-4 w-4 text-stone-500" />
        <Select
          value={currentSort || "default"}
          onValueChange={(value) => updateParams({ sort: value })}
        >
          <SelectTrigger className="w-[180px] h-9 text-sm">
            <SelectValue placeholder="Trier par" />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Max Time */}
      <div className="flex items-center gap-2">
        <Clock className="h-4 w-4 text-stone-500" />
        <Select
          value={currentMaxTime || "all"}
          onValueChange={(value) => updateParams({ maxTime: value })}
        >
          <SelectTrigger className="w-[140px] h-9 text-sm">
            <SelectValue placeholder="Temps max" />
          </SelectTrigger>
          <SelectContent>
            {timeOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Dietary Tags */}
      <div className="flex items-center gap-2">
        <Leaf className="h-4 w-4 text-stone-500" />
        <div className="flex flex-wrap gap-1.5">
          {dietaryOptions.map((opt) => (
            <Badge
              key={opt.value}
              variant="outline"
              className={`cursor-pointer transition-all text-xs ${
                currentDietary.includes(opt.value)
                  ? opt.color + " border-transparent"
                  : "bg-transparent hover:bg-stone-100"
              }`}
              onClick={() => toggleDietary(opt.value)}
            >
              {opt.label}
            </Badge>
          ))}
        </div>
      </div>

      {/* Clear Advanced Filters */}
      {hasAdvancedFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => updateParams({ sort: null, maxTime: null, dietary: null })}
          className="ml-auto"
        >
          <X className="h-4 w-4 mr-1" />
          Réinitialiser
        </Button>
      )}
    </div>
  );
}

