import { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { RecipeList } from "@/components/recipes/recipe-list";
import { RecipeForm } from "@/components/recipes/recipe-form";
import { Button } from "@/components/ui/button";
import { ChefHat, Plus, ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { Recipe } from "@/types/recipe";

export const metadata: Metadata = {
  title: "Mes recettes | Gourmiso",
  description: "Gérez vos recettes personnelles",
};

export default async function MyRecipesPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  const recipes = await db.recipe.findMany({
    where: { userId: session.user.id },
    include: {
      ingredients: true,
      steps: { orderBy: { order: "asc" } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <main className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-amber-500 to-orange-500">
        <div className="mx-auto max-w-screen-2xl px-4 py-4 sm:px-6 sm:py-6">
          <Link
            href="/profile"
            className="text-white/80 hover:text-white text-sm mb-2 inline-flex items-center gap-1"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour au profil
          </Link>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-white/20 backdrop-blur-sm">
                <ChefHat className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Mes recettes</h1>
                <p className="text-white/80 text-sm">
                  {recipes.length} recette{recipes.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>

            <RecipeForm
              trigger={
                <Button className="bg-white text-amber-600 hover:bg-white/90 gap-2">
                  <Plus className="h-4 w-4" />
                  Nouvelle recette
                </Button>
              }
            />
          </div>
        </div>
      </header>

      {/* Content */}
      <section className="mx-auto max-w-screen-2xl px-4 py-8 sm:px-6">
        {recipes.length === 0 ? (
          <div className="text-center py-16">
            <ChefHat className="h-16 w-16 mx-auto text-gray-300 mb-4" />
            <h2 className="text-xl font-semibold text-gray-600 mb-2">
              Aucune recette pour le moment
            </h2>
            <p className="text-gray-500 mb-6">
              Commencez à créer vos propres recettes !
            </p>
            <RecipeForm
              trigger={
                <Button className="bg-amber-500 hover:bg-amber-600 text-white gap-2">
                  <Plus className="h-4 w-4" />
                  Créer ma première recette
                </Button>
              }
            />
          </div>
        ) : (
          <RecipeList recipes={recipes as Recipe[]} />
        )}
      </section>
    </main>
  );
}

