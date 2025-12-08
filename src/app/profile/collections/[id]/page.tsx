import { Suspense } from "react";
import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, Trash2, FolderOpen } from "lucide-react";
import { RecipeCard } from "@/components/recipes/recipe-card";
import { RecipeListSkeleton } from "@/components/recipes/recipe-skeleton";

interface PageProps {
  params: Promise<{ id: string }>;
}

async function getCollection(collectionId: number, userId: string) {
  const collection = await db.collection.findFirst({
    where: {
      id: collectionId,
      userId
    },
    include: {
      recipes: {
        include: {
          ingredients: true,
          ingredientGroups: {
            include: {
              ingredients: true
            }
          },
          steps: true
        },
        orderBy: { name: 'asc' }
      },
      _count: {
        select: { recipes: true }
      }
    }
  });

  return collection;
}

async function CollectionContent({ collectionId, userId }: { collectionId: number; userId: string }) {
  const collection = await getCollection(collectionId, userId);

  if (!collection) {
    notFound();
  }

  // Get favorite IDs for the user
  const user = await db.user.findUnique({
    where: { id: userId },
    include: { favorites: { select: { id: true } } },
  });
  const favoriteIds = new Set(user?.favorites.map(f => f.id) || []);

  return (
    <>
      {/* Header de la collection */}
      <div className="mb-8 bg-gradient-to-r from-stone-100 to-stone-50 dark:from-stone-800 dark:to-stone-900 rounded-xl p-6 border-2"
           style={{ borderColor: collection.color + '60' }}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-stone-900 dark:text-stone-100">
              {collection.name}
            </h1>
            <p className="text-stone-600 dark:text-stone-400 mt-1">
              {collection._count.recipes} {collection._count.recipes === 1 ? 'recette' : 'recettes'}
            </p>
          </div>
          
          <div className="flex gap-2">
            {/* TODO: Ajouter boutons Edit et Delete */}
          </div>
        </div>

        {collection.description && (
          <p className="text-stone-700 dark:text-stone-300 mt-2">
            {collection.description}
          </p>
        )}
      </div>

      {/* Recettes de la collection */}
      {collection.recipes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 border-2 border-dashed border-stone-300 dark:border-stone-600 rounded-xl">
          <FolderOpen className="h-16 w-16 text-stone-300 dark:text-stone-600 mb-4" />
          <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-100 mb-2">
            Collection vide
          </h3>
          <p className="text-sm text-stone-500 dark:text-stone-400 text-center max-w-md mb-6">
            Cette collection ne contient pas encore de recettes. Explorez les recettes et ajoutez-les à cette collection.
          </p>
          <Button asChild>
            <Link href="/recipes">
              Explorer les recettes
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {collection.recipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe as any}
              isFavorite={favoriteIds.has(recipe.id)}
            />
          ))}
        </div>
      )}
    </>
  );
}

export default async function CollectionDetailPage({ params }: PageProps) {
  const session = await auth();
  
  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  const { id } = await params;
  const collectionId = parseInt(id);

  if (isNaN(collectionId)) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-stone-50 to-white dark:from-stone-900 dark:to-stone-800">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Bouton retour */}
        <Button variant="ghost" asChild className="mb-6">
          <Link href="/profile/collections">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour aux collections
          </Link>
        </Button>

        <Suspense fallback={<RecipeListSkeleton />}>
          <CollectionContent collectionId={collectionId} userId={session.user.id} />
        </Suspense>
      </div>
    </main>
  );
}
