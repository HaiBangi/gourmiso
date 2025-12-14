import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { dayOfWeek, timeSlot } = body;

    const meal = await db.plannedMeal.update({
      where: { id: parseInt(id) },
      data: {
        dayOfWeek,
        timeSlot,
      },
    });

    return NextResponse.json(meal);
  } catch (error) {
    console.error("Erreur:", error);
    return NextResponse.json(
      { error: "Erreur lors du déplacement du repas" },
      { status: 500 }
    );
  }
}
