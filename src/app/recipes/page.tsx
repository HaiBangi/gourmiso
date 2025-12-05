import { Suspense } from "react";
import { db } from "@/lib/db";
import { RecipeList } from "@/components/recipes/recipe-list";
import { RecipeListSkeleton } from "@/components/recipes/recipe-skeleton";
import { RecipeFilters } from "@/components/recipes/recipe-filters";
import { RecipeForm } from "@/components/recipes/recipe-form";
import { QuickFilters } from "@/components/recipes/quick-filters";
import { Button } from "@/components/ui/button";
import type { Recipe } from "@/types/recipe";
import { ChefHat, Plus } from "lucide-react";

interface SearchParams {
  category?: string;
  search?: string;
}

// Category sort order (priority)
const categoryOrder: Record<string, number> = {
  MAIN_DISH: 1,
  STARTER: 2,
  DESSERT: 3,
  SIDE_DISH: 4,
  SOUP: 5,
  SALAD: 6,
  BEVERAGE: 7,
  SNACK: 8,
};

async function getRecipes(searchParams: SearchParams): Promise<Recipe[]> {
  const { category, search } = searchParams;

  const recipes = await db.recipe.findMany({
    where: {
      AND: [
        category ? { category } : {},
        search
          ? {
              OR: [
                { name: { contains: search } },
                { description: { contains: search } },
                { author: { contains: search } },
              ],
            }
          : {},
      ],
    },
    include: {
      ingredients: true,
      steps: { orderBy: { order: "asc" } },
    },
  });

  // Sort: by category order, then by rating (desc), then by name (asc)
  const sortedRecipes = (recipes as Recipe[]).sort((a, b) => {
    // First: sort by category
    const catOrderA = categoryOrder[a.category] || 99;
    const catOrderB = categoryOrder[b.category] || 99;
    if (catOrderA !== catOrderB) return catOrderA - catOrderB;

    // Second: sort by rating (descending - higher rating first)
    if (b.rating !== a.rating) return b.rating - a.rating;

    // Third: sort by name (alphabetically)
    return a.name.localeCompare(b.name, "fr");
  });

  return sortedRecipes;
}

async function RecipesContent({ searchParams }: { searchParams: SearchParams }) {
  const recipes = await getRecipes(searchParams);
  return <RecipeList recipes={recipes} />;
}

interface PageProps {
  searchParams: Promise<SearchParams>;
}

export default async function RecipesPage({ searchParams }: PageProps) {
  const params = await searchParams;

  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="relative overflow-hidden bg-gradient-to-r from-amber-500 to-orange-500">
        <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10" />

        <div className="relative mx-auto max-w-screen-2xl px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-5">
              <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
                <ChefHat className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="font-serif text-3xl font-bold text-white">
                  Gourmiso
                </h1>
                <p className="text-base text-white/80 hidden sm:block">
                  Les recettes de MISO
                </p>
              </div>
            </div>

            <RecipeForm
              trigger={
                <Button
                  className="bg-white text-amber-600 hover:bg-white/90 gap-2 h-11 px-5 text-base"
                >
                  <Plus className="h-5 w-5" />
                  <span className="hidden sm:inline">Nouvelle recette</span>
                  <span className="sm:hidden">Ajouter</span>
                </Button>
              }
            />
          </div>
        </div>
      </header>

      {/* Content */}
      <section className="mx-auto max-w-screen-2xl px-8 py-8">
        {/* Quick Category Filters */}
        <QuickFilters currentCategory={params.category} />

        {/* Search & Category Dropdown */}
        <RecipeFilters
          currentCategory={params.category}
          currentSearch={params.search}
        />

        <Suspense fallback={<RecipeListSkeleton />}>
          <RecipesContent searchParams={params} />
        </Suspense>
      </section>
    </main>
  );
}
