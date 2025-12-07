/**
 * Migration intelligente des ingrédients vers des groupes d'ingrédients
 * Analyse les étapes de préparation pour regrouper logiquement les ingrédients
 * Date: 2025-12-07
 */

// Charger dotenv en premier
import { config } from "dotenv";
config({ path: ".env.local" });

import { PrismaClient } from "@prisma/client";
import OpenAI from "openai";

const prisma = new PrismaClient();

// Vérifier la clé API AVANT d'initialiser OpenAI
if (!process.env.OPENAI_API_KEY) {
  console.error("❌ OPENAI_API_KEY n'est pas définie dans .env.local");
  console.error("Valeur actuelle:", process.env.OPENAI_API_KEY);
  process.exit(1);
}

// Initialiser OpenAI pour l'analyse intelligente
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface IngredientGroup {
  name: string;
  ingredients: Array<{
    name: string;
    quantity: number | null;
    unit: string | null;
  }>;
}

/**
 * Analyse une recette avec ChatGPT pour regrouper intelligemment les ingrédients
 */
async function analyzeRecipeIngredients(
  recipeName: string,
  ingredients: Array<{ name: string; quantity: number | null; unit: string | null }>,
  steps: Array<{ text: string; order: number }>
): Promise<IngredientGroup[]> {
  const prompt = `Tu es un expert culinaire. Analyse cette recette et regroupe les ingrédients de manière logique.

Recette: ${recipeName}

Ingrédients:
${ingredients.map((ing, i) => `${i + 1}. ${ing.quantity || ""} ${ing.unit || ""} ${ing.name}`.trim()).join("\n")}

Étapes de préparation:
${steps.map((step) => `${step.order}. ${step.text}`).join("\n")}

Règles IMPORTANTES:
1. Si la recette a des composantes distinctes (ex: sauce/viande/garniture, base/topping, pâte/garniture), crée des groupes
2. Les groupes typiques: "Marinade", "Sauce", "Viande", "Légumes", "Garniture", "Base", "Riz", "Nouilles", "Accompagnement"
3. Si tous les ingrédients vont ensemble, retourne UN SEUL groupe appelé "Ingrédients principaux"
4. **CRUCIAL**: Garde EXACTEMENT les mêmes noms d'ingrédients, NE DUPLIQUE PAS la quantité dans le nom
   - ✅ Correct: { "name": "carottes", "quantity": 2, "unit": null }
   - ❌ Incorrect: { "name": "2 carottes", "quantity": 2, "unit": null }
   - ✅ Correct: { "name": "blanquette de veau", "quantity": 1, "unit": "kg" }
   - ❌ Incorrect: { "name": "1 kg blanquette de veau", "quantity": 1, "unit": "kg" }
5. Garde les mêmes quantités et unités EXACTEMENT comme fournies
6. Maximum 4 groupes

Réponds UNIQUEMENT avec un JSON valide (pas de markdown):
{
  "groups": [
    {
      "name": "Nom du groupe",
      "ingredients": [
        { "name": "nom_ingredient_sans_quantite", "quantity": 150, "unit": "g" }
      ]
    }
  ]
}`;

  try {
    console.log(`   🤖 Analyse de "${recipeName}" avec ChatGPT...`);

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Tu es un expert culinaire qui analyse des recettes pour regrouper logiquement les ingrédients. Réponds toujours en JSON valide.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.3,
      max_tokens: 1000,
      response_format: { type: "json_object" },
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error("Pas de réponse de ChatGPT");
    }

    const parsed = JSON.parse(response);
    const groups = parsed.groups || [];

    console.log(`   ✅ ${groups.length} groupe(s) détecté(s)`);
    groups.forEach((g: IngredientGroup) => {
      console.log(`      - ${g.name} (${g.ingredients.length} ingrédients)`);
    });

    return groups;
  } catch (error) {
    console.error(`   ⚠️ Erreur d'analyse, utilisation du groupe par défaut:`, error);
    // En cas d'erreur, mettre tous les ingrédients dans un seul groupe
    return [
      {
        name: "Ingrédients principaux",
        ingredients,
      },
    ];
  }
}

/**
 * Migre une recette vers des groupes d'ingrédients
 */
async function migrateRecipe(recipeId: number) {
  const recipe = await prisma.recipe.findUnique({
    where: { id: recipeId },
    include: {
      ingredients: {
        orderBy: { order: "asc" },
      },
      steps: {
        orderBy: { order: "asc" },
      },
      ingredientGroups: {
        include: {
          ingredients: true,
        },
      },
    },
  });

  if (!recipe) {
    console.log(`   ❌ Recette ${recipeId} introuvable`);
    return;
  }

  // Si la recette a déjà des groupes d'ingrédients, vérifier s'ils sont valides
  if (recipe.ingredientGroups.length > 0) {
    // Si c'est un seul groupe nommé "Ingrédients", ce n'est pas un vrai groupe
    const isFakeGroup =
      recipe.ingredientGroups.length === 1 &&
      (recipe.ingredientGroups[0].name === "Ingrédients" ||
        recipe.ingredientGroups[0].name === "Ingrdients" ||
        recipe.ingredientGroups[0].name === "Ingrédients principaux");

    if (!isFakeGroup) {
      console.log(`   ⏭️  "${recipe.name}" a déjà des groupes d'ingrédients valides`);
      return;
    }

    // Si c'est un faux groupe, on va le supprimer et recréer
    console.log(`   🔧 "${recipe.name}" a un faux groupe, on le recrée...`);
  }

  // Si pas d'ingrédients, on saute
  if (recipe.ingredients.length === 0) {
    console.log(`   ⏭️  "${recipe.name}" n'a pas d'ingrédients`);
    return;
  }

  console.log(`\n📝 Migration de "${recipe.name}"`);
  console.log(`   ${recipe.ingredients.length} ingrédients, ${recipe.steps.length} étapes`);

  // Analyser avec ChatGPT
  const groups = await analyzeRecipeIngredients(
    recipe.name,
    recipe.ingredients.map((ing) => ({
      name: ing.name,
      quantity: ing.quantity,
      unit: ing.unit,
    })),
    recipe.steps.map((step) => ({
      text: step.text,
      order: step.order,
    }))
  );

  // Si un seul groupe, on ne crée pas de groupes (on garde les ingrédients simples)
  if (groups.length === 1 && groups[0].name === "Ingrédients principaux") {
    console.log(`   ⏭️  Pas besoin de groupes pour cette recette`);
    return;
  }

  // Créer les groupes d'ingrédients dans la base de données
  console.log(`   💾 Création de ${groups.length} groupes...`);

  await prisma.$transaction(async (tx) => {
    // Supprimer les anciens ingrédients simples
    await tx.ingredient.deleteMany({
      where: { recipeId },
    });

    // Créer les groupes avec leurs ingrédients
    for (let groupIdx = 0; groupIdx < groups.length; groupIdx++) {
      const group = groups[groupIdx];

      await tx.ingredientGroup.create({
        data: {
          name: group.name,
          order: groupIdx,
          recipeId,
          ingredients: {
            create: group.ingredients.map((ing, ingIdx) => ({
              name: ing.name,
              // Convertir les chaînes vides en null et s'assurer que c'est un nombre ou null
              quantity: ing.quantity === null || ing.quantity === "" || ing.quantity === undefined || isNaN(Number(ing.quantity))
                ? null
                : Number(ing.quantity),
              unit: ing.unit || null,
              order: ingIdx,
              recipeId,
            })),
          },
        },
      });
    }
  });

  console.log(`   ✅ Migration réussie !`);
}

/**
 * Migre toutes les recettes
 */
async function migrateAllRecipes() {
  console.log("🚀 Début de la migration des groupes d'ingrédients\n");

  try {
    // Récupérer toutes les recettes
    const recipes = await prisma.recipe.findMany({
      select: { id: true, name: true },
      orderBy: { id: "asc" },
    });

    console.log(`📊 ${recipes.length} recettes à analyser\n`);

    let migrated = 0;
    let skipped = 0;
    let errors = 0;

    for (const recipe of recipes) {
      try {
        await migrateRecipe(recipe.id);
        migrated++;

        // Pause pour éviter les rate limits OpenAI
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`   ❌ Erreur pour "${recipe.name}":`, error);
        errors++;
      }
    }

    console.log("\n" + "=".repeat(60));
    console.log("📊 Résumé de la migration");
    console.log("=".repeat(60));
    console.log(`✅ Migrées avec succès: ${migrated}`);
    console.log(`⏭️  Ignorées: ${skipped}`);
    console.log(`❌ Erreurs: ${errors}`);
    console.log(`📝 Total: ${recipes.length}`);
  } catch (error) {
    console.error("💥 Erreur fatale:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

migrateAllRecipes()
  .then(() => {
    console.log("\n🎉 Migration terminée avec succès !");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Erreur fatale:", error);
    process.exit(1);
  });
