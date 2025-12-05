import { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { RecipeList } from "@/components/recipes/recipe-list";
import { Heart, ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { Recipe } from "@/types/recipe";

export const metadata: Metadata = {
  title: "Mes favoris | Gourmiso",
  description: "Vos recettes favorites",
};

export default async function FavoritesPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    include: {
      favorites: {
        include: {
          ingredients: true,
          steps: { orderBy: { order: "asc" } },
        },
      },
    },
  });

  const favorites = user?.favorites || [];

  return (
    <main className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-red-500 to-pink-500">
        <div className="mx-auto max-w-screen-2xl px-4 py-4 sm:px-6 sm:py-6">
          <Link
            href="/profile"
            className="text-white/80 hover:text-white text-sm mb-2 inline-flex items-center gap-1"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour au profil
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white/20 backdrop-blur-sm">
              <Heart className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Mes favoris</h1>
              <p className="text-white/80 text-sm">
                {favorites.length} recette{favorites.length !== 1 ? "s" : ""} sauvegardée{favorites.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <section className="mx-auto max-w-screen-2xl px-4 py-8 sm:px-6">
        {favorites.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="h-16 w-16 mx-auto text-gray-300 mb-4" />
            <h2 className="text-xl font-semibold text-gray-600 mb-2">
              Aucun favori pour le moment
            </h2>
            <p className="text-gray-500 mb-6">
              Parcourez les recettes et ajoutez-les à vos favoris !
            </p>
            <Link href="/recipes">
              <button className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-2 rounded-lg">
                Découvrir les recettes
              </button>
            </Link>
          </div>
        ) : (
          <RecipeList recipes={favorites as Recipe[]} />
        )}
      </section>
    </main>
  );
}

