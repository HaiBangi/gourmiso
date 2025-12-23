import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

/**
 * Recalcule automatiquement la liste de courses basée sur les repas actuels du plan
 */
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const body = await request.json();
    const { planId } = body;

    if (!planId) {
      return NextResponse.json(
        { error: "planId manquant" },
        { status: 400 }
      );
    }

    // Récupérer le plan avec tous les repas
    const plan = await db.weeklyMealPlan.findUnique({
      where: { id: planId },
      include: {
        meals: true,
        contributors: {
          where: { userId: session.user.id },
        },
      },
    });

    if (!plan) {
      return NextResponse.json(
        { error: "Plan non trouvé" },
        { status: 404 }
      );
    }

    // Vérifier les permissions
    const isOwner = plan.userId === session.user.id;
    const isContributor = plan.contributors.some(c => c.role === "CONTRIBUTOR");

    if (!isOwner && !isContributor) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 403 }
      );
    }

    // Collecter tous les ingrédients bruts sans calcul ni agrégation
    const allIngredients: string[] = [];

    plan.meals.forEach((meal) => {
      if (Array.isArray(meal.ingredients)) {
        meal.ingredients.forEach((ing: any) => {
          // Vérifier si c'est un format groupé ou simple
          if (typeof ing === 'object' && ing.name && Array.isArray(ing.items)) {
            // Format groupé: {name: "Farce", items: ["...", "..."]}
            ing.items.forEach((item: string) => {
              if (item && item !== 'undefined' && item !== 'null' && item !== '[object Object]') {
                allIngredients.push(item.trim());
              }
            });
          } else {
            // Format simple: string
            const ingredientStr = typeof ing === 'string' ? ing : (ing?.name || String(ing));
            if (!ingredientStr || ingredientStr === 'undefined' || ingredientStr === 'null' || ingredientStr === '[object Object]') return;
            allIngredients.push(ingredientStr.trim());
          }
        });
      }
    });

    console.log(`📊 Collecté ${allIngredients.length} ingrédients bruts pour le plan ${planId}`);

    // Catégoriser les ingrédients bruts (sans agrégation)
    const categorized: Record<string, string[]> = {
      "Légumes": [],
      "Viandes & Poissons": [],
      "Produits Laitiers": [],
      "Épicerie": [],
      "Condiments & Sauces": [],
      "Autres": [],
    };

    const categories = {
      légumes: ["tomate", "carotte", "oignon", "ail", "poivron", "courgette", "aubergine", "salade", "laitue", "épinard", "chou", "brocoli", "champignon", "poireau", "céleri", "concombre", "radis", "navet", "betterave", "courge", "potiron", "citrouille", "haricot vert", "petit pois", "fève", "artichaut", "asperge", "endive", "fenouil", "patate douce", "pomme de terre"],
      viandes: ["poulet", "bœuf", "porc", "agneau", "veau", "canard", "dinde", "lapin", "saucisse", "jambon", "bacon", "lard", "poisson", "saumon", "thon", "cabillaud", "morue", "sole", "truite", "bar", "daurade", "maquereau", "sardine", "hareng", "anchois", "crevette", "crabe", "homard", "langouste", "moule", "huître", "coquille", "calmar", "seiche", "poulpe"],
      laitiers: ["lait", "crème", "beurre", "fromage", "yaourt", "yogourt", "mozzarella", "parmesan", "gruyère", "emmental", "chèvre", "brebis", "camembert", "roquefort", "comté", "raclette", "ricotta", "mascarpone", "feta", "cottage"],
      épicerie: ["riz", "pâte", "farine", "sucre", "sel", "poivre", "huile", "vinaigre", "pâte", "nouille", "vermicelle", "semoule", "couscous", "quinoa", "boulgour", "lentille", "pois chiche", "haricot", "fève", "maïs", "avoine", "céréale", "pain", "biscuit", "gâteau", "chocolat", "cacao", "café", "thé", "miel", "confiture", "pâte à tartiner"],
      condiments: ["sauce", "ketchup", "mayonnaise", "moutarde", "vinaigre", "huile", "soja", "nuoc mam", "mirin", "saké", "wasabi", "gingembre", "curry", "curcuma", "paprika", "piment", "harissa", "tabasco", "sriracha", "bouillon", "fond", "concentré", "pâte", "purée", "coulis"],
    };

    // Catégoriser chaque ingrédient brut tel quel
    allIngredients.forEach((ingredient) => {
      const ingredientLower = ingredient.toLowerCase();
      let placed = false;

      if (categories.légumes.some(v => ingredientLower.includes(v))) {
        categorized["Légumes"].push(ingredient);
        placed = true;
      } else if (categories.viandes.some(v => ingredientLower.includes(v))) {
        categorized["Viandes & Poissons"].push(ingredient);
        placed = true;
      } else if (categories.laitiers.some(v => ingredientLower.includes(v))) {
        categorized["Produits Laitiers"].push(ingredient);
        placed = true;
      } else if (categories.épicerie.some(v => ingredientLower.includes(v))) {
        categorized["Épicerie"].push(ingredient);
        placed = true;
      } else if (categories.condiments.some(v => ingredientLower.includes(v))) {
        categorized["Condiments & Sauces"].push(ingredient);
        placed = true;
      }

      if (!placed) {
        categorized["Autres"].push(ingredient);
      }
    });

    // Nettoyer les catégories vides
    Object.keys(categorized).forEach(key => {
      if (categorized[key].length === 0) {
        delete categorized[key];
      }
    });

    console.log(`📦 Catégories créées:`, Object.keys(categorized));
    console.log(`📋 Liste de courses à sauvegarder:`, JSON.stringify(categorized, null, 2));

    // Sauvegarder la liste de courses recalculée
    await db.weeklyMealPlan.update({
      where: { id: planId },
      data: {
        optimizedShoppingList: categorized,
        updatedAt: new Date(),
      },
    });

    console.log("✅ Liste de courses recalculée automatiquement pour le plan", planId);

    return NextResponse.json({
      success: true,
      shoppingList: categorized,
    });
  } catch (error) {
    console.error("❌ Erreur recalcul liste de courses:", error);
    
    return NextResponse.json(
      {
        error: "Erreur lors du recalcul",
        message: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 }
    );
  }
}
