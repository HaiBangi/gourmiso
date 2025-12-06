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
import { AuthorFilter } from "./author-filter";

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
  currentUserId?: string;
  selectedAuthors?: string[];
}

export function RecipeFilters({ 
  currentCategory, 
  currentSearch,
  currentUserId,
  selectedAuthors = [],
}: RecipeFiltersProps) {
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

  const hasFilters = currentCategory || currentSearch || selectedAuthors.length > 0;

  return (
    <div className="flex flex-col gap-3 mb-4 sm:mb-6 md:mb-8 sm:flex-row sm:gap-4">
      <form onSubmit={handleSearchSubmit} className="flex-1 flex gap-2 sm:gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-stone-400" />
          <Input
            type="text"
            placeholder="Rechercher..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 sm:pl-12 h-10 sm:h-12 !text-base bg-white dark:bg-stone-900 placeholder:!text-base"
          />
        </div>
        <Button type="submit" variant="secondary" disabled={isPending} className="h-10 sm:h-12 px-3 sm:px-6 text-sm sm:text-base cursor-pointer">
          <span className="hidden sm:inline">Rechercher</span>
          <Search className="h-4 w-4 sm:hidden" />
        </Button>
      </form>

      <div className="flex gap-2 sm:gap-3">
        <Select
          value={currentCategory || "all"}
          onValueChange={(value) => updateParams("category", value)}
        >
          <SelectTrigger className="flex-1 sm:flex-none sm:w-[200px] !h-10 sm:!h-12 text-sm sm:!text-base bg-white dark:bg-stone-900 px-3 sm:px-4 cursor-pointer">
            <SelectValue placeholder="Catégorie" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat.value} value={cat.value} className="text-sm sm:text-base py-2 sm:py-3 cursor-pointer">
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <AuthorFilter 
          currentUserId={currentUserId} 
          selectedAuthors={selectedAuthors}
        />

        {hasFilters && (
          <Button variant="ghost" onClick={clearFilters} className="h-10 sm:h-12 gap-1 sm:gap-2 text-sm sm:text-base px-2 sm:px-4 cursor-pointer">
            <X className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="hidden sm:inline">Effacer</span>
          </Button>
        )}
      </div>
    </div>
  );
}
