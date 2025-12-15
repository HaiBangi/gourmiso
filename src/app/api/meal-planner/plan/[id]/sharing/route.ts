import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { id } = await params;
    const planId = parseInt(id);
    if (isNaN(planId)) {
      return NextResponse.json({ error: "ID invalide" }, { status: 400 });
    }

    // Vérifier que le plan appartient à l'utilisateur
    const existingPlan = await db.weeklyMealPlan.findUnique({
      where: { id: planId },
      select: { userId: true, isPublic: true },
    });

    if (!existingPlan) {
      return NextResponse.json({ error: "Menu non trouvé" }, { status: 404 });
    }

    if (existingPlan.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 403 }
      );
    }

    // Récupérer le nouveau statut isPublic du body
    const body = await request.json();
    const { isPublic } = body;

    if (typeof isPublic !== "boolean") {
      return NextResponse.json(
        { error: "isPublic doit être un booléen" },
        { status: 400 }
      );
    }

    // Mettre à jour le statut
    const updatedPlan = await db.weeklyMealPlan.update({
      where: { id: planId },
      data: { isPublic },
    });

    return NextResponse.json({
      success: true,
      isPublic: updatedPlan.isPublic,
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour" },
      { status: 500 }
    );
  }
}
