import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const body = await request.json();
    const { planId, dayOfWeek, timeSlot, mealType, recipeId, portionsUsed } = body;

    // Si c'est une recette existante
    if (recipeId) {
      const recipe = await db.recipe.findUnique({
        where: { id: recipeId },
        include: {
          ingredients: true,
          steps: { orderBy: { order: "asc" } },
        },
      });

      if (!recipe) {
        return NextResponse.json({ error: "Recette non trouvée" }, { status: 404 });
      }

      const meal = await db.plannedMeal.create({
        data: {
          weeklyMealPlanId: planId,
          dayOfWeek,
          timeSlot,
          mealType,
          name: recipe.name,
          prepTime: recipe.preparationTime,
          cookTime: recipe.cookingTime,
          servings: recipe.servings,
          calories: recipe.caloriesPerServing,
          portionsUsed: portionsUsed || 1,
          ingredients: recipe.ingredients.map((ing) => ({
            name: ing.name,
            quantity: ing.quantity,
            unit: ing.unit,
          })),
          steps: recipe.steps.map((step) => step.text),
          recipeId: recipe.id,
          isUserRecipe: true,
        },
      });

      return NextResponse.json(meal);
    }

    return NextResponse.json({ error: "Données invalides" }, { status: 400 });
  } catch (error) {
    console.error("❌ Erreur complète lors de l'ajout du repas:");
    console.error(error);
    if (error instanceof Error) {
      console.error("Message:", error.message);
      console.error("Stack:", error.stack);
    }
    return NextResponse.json(
      { 
        error: "Erreur lors de l'ajout du repas",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const mealId = searchParams.get("id");

    if (!mealId) {
      return NextResponse.json({ error: "ID manquant" }, { status: 400 });
    }

    await db.plannedMeal.delete({
      where: { id: parseInt(mealId) },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression" },
      { status: 500 }
    );
  }
}
