import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { RecipeDetail } from "@/components/recipes/recipe-detail";
import type { Recipe } from "@/types/recipe";
import type { Metadata } from "next";

interface RecipePageProps {
  params: Promise<{ id: string }>;
}

interface RecipeWithUserId extends Recipe {
  userId: string | null;
}

async function getRecipe(id: number): Promise<RecipeWithUserId | null> {
  const recipe = await db.recipe.findUnique({
    where: { id },
    include: {
      ingredients: true,
      steps: { orderBy: { order: "asc" } },
    },
  });

  return recipe as RecipeWithUserId | null;
}

export async function generateMetadata({ params }: RecipePageProps): Promise<Metadata> {
  const { id } = await params;
  const recipeId = parseInt(id, 10);
  
  if (isNaN(recipeId)) {
    return { title: "Recette non trouvée | Gourmiso" };
  }

  const recipe = await getRecipe(recipeId);
  
  if (!recipe) {
    return { title: "Recette non trouvée | Gourmiso" };
  }

  return {
    title: `${recipe.name} | Gourmiso`,
    description: recipe.description || `Découvrez la recette ${recipe.name} par ${recipe.author}`,
  };
}

export default async function RecipePage({ params }: RecipePageProps) {
  const { id } = await params;
  const recipeId = parseInt(id, 10);

  if (isNaN(recipeId)) {
    notFound();
  }

  const [recipe, session] = await Promise.all([
    getRecipe(recipeId),
    auth(),
  ]);

  if (!recipe) {
    notFound();
  }

  // Check if user can edit/delete this recipe
  const isOwner = session?.user?.id === recipe.userId;
  const isAdmin = session?.user?.role === "ADMIN";
  const canEdit = isOwner || isAdmin;

  return <RecipeDetail recipe={recipe} canEdit={canEdit} />;
}

