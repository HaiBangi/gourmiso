import { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, FolderOpen, ChevronRight } from "lucide-react";

async function getUserCollections(userId: string) {
  const collections = await db.collection.findMany({
    where: { userId },
    include: {
      _count: {
        select: { recipes: true }
      },
      recipes: {
        take: 3,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          imageUrl: true
        }
      }
    },
    orderBy: { updatedAt: 'desc' }
  });

  return collections;
}

async function CollectionsContent({ userId }: { userId: string }) {
  const collections = await getUserCollections(userId);

  if (collections.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <FolderOpen className="h-16 w-16 text-stone-300 dark:text-stone-600 mb-4" />
        <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-100 mb-2">
          Aucune collection
        </h3>
        <p className="text-sm text-stone-500 dark:text-stone-400 text-center max-w-md mb-6">
          Créez votre première collection pour organiser vos recettes préférées.
        </p>
        <Button asChild>
          <Link href="/recipes">
            <Plus className="h-4 w-4 mr-2" />
            Explorer les recettes
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {collections.map((collection) => (
        <Link key={collection.id} href={`/profile/collections/${collection.id}`}>
          <Card className="group hover:shadow-lg transition-all cursor-pointer border-2 hover:border-emerald-400 dark:hover:border-emerald-600"
                style={{ borderColor: collection.color + '40' }}>
            <CardContent className="p-4">
              {/* En-tête de la collection */}
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-stone-900 dark:text-stone-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    {collection.name}
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    {collection._count.recipes} {collection._count.recipes === 1 ? 'recette' : 'recettes'}
                  </p>
                </div>
                <ChevronRight className="h-5 w-5 text-stone-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
              </div>

              {/* Description */}
              {collection.description && (
                <p className="text-xs text-stone-600 dark:text-stone-400 mb-3 line-clamp-2">
                  {collection.description}
                </p>
              )}

              {/* Aperçu des recettes */}
              {collection.recipes.length > 0 && (
                <div className="flex gap-1">
                  {collection.recipes.slice(0, 3).map((recipe) => (
                    <div
                      key={recipe.id}
                      className="flex-1 aspect-square rounded-md bg-stone-100 dark:bg-stone-700 overflow-hidden"
                    >
                      {recipe.imageUrl ? (
                        <img
                          src={recipe.imageUrl}
                          alt={recipe.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-stone-400 dark:text-stone-500">
                          <FolderOpen className="h-4 w-4" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}

export default async function CollectionsPage() {
  const session = await auth();
  
  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  return (
    <main className="bg-gradient-to-b from-stone-50 to-white dark:from-stone-900 dark:to-stone-800 pb-8">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-stone-900 dark:text-stone-100 mb-2">
            Mes collections
          </h1>
          <p className="text-stone-600 dark:text-stone-400">
            Organisez vos recettes préférées dans des collections personnalisées
          </p>
        </div>

        {/* Collections Grid */}
        <Suspense fallback={
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-4">
                  <div className="h-20 bg-stone-200 dark:bg-stone-700 rounded-md mb-3" />
                  <div className="h-4 bg-stone-200 dark:bg-stone-700 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-stone-200 dark:bg-stone-700 rounded w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        }>
          <CollectionsContent userId={session.user.id} />
        </Suspense>
      </div>
    </main>
  );
}
