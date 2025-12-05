"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import { useCallback, useState, useTransition } from "react";

const categories = [
  { value: "all", label: "Toutes les catégories" },
  { value: "MAIN_DISH", label: "Plat principal" },
  { value: "STARTER", label: "Entrée" },
  { value: "DESSERT", label: "Dessert" },
  { value: "SIDE_DISH", label: "Accompagnement" },
  { value: "SOUP", label: "Soupe" },
  { value: "SALAD", label: "Salade" },
  { value: "BEVERAGE", label: "Boisson" },
  { value: "SNACK", label: "En-cas" },
];

interface RecipeFiltersProps {
  currentCategory?: string;
  currentSearch?: string;
}

export function RecipeFilters({ currentCategory, currentSearch }: RecipeFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState(currentSearch || "");

  const updateParams = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value && value !== "all") {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      startTransition(() => {
        router.push(`/recipes?${params.toString()}`);
      });
    },
    [router, searchParams]
  );

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateParams("search", search.trim() || null);
  };

  const clearFilters = () => {
    setSearch("");
    startTransition(() => {
      router.push("/recipes");
    });
  };

  const hasFilters = currentCategory || currentSearch;

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-8">
      <form onSubmit={handleSearchSubmit} className="flex-1 flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-stone-400" />
          <Input
            type="text"
            placeholder="Rechercher une recette..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-12 h-12 !text-lg md:!text-lg bg-white dark:bg-stone-900 placeholder:!text-lg"
          />
        </div>
        <Button type="submit" variant="secondary" disabled={isPending} className="h-12 px-6 text-lg">
          Rechercher
        </Button>
      </form>

      <Select
        value={currentCategory || "all"}
        onValueChange={(value) => updateParams("category", value)}
      >
        <SelectTrigger className="w-full sm:w-[280px] !h-12 !text-lg bg-white dark:bg-stone-900 px-4">
          <SelectValue placeholder="Catégorie" />
        </SelectTrigger>
        <SelectContent>
          {categories.map((cat) => (
            <SelectItem key={cat.value} value={cat.value} className="text-lg py-3">
              {cat.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasFilters && (
        <Button variant="ghost" onClick={clearFilters} className="h-12 gap-2 text-lg">
          <X className="h-5 w-5" />
          Effacer
        </Button>
      )}
    </div>
  );
}
