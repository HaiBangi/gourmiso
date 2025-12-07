/**
 * Script de nettoyage des bugs de migration :
 * 1. Supprime les groupes "Ingrédients" (pas de vrais groupes)
 * 2. Corrige les noms d'ingrédients avec quantités dupliquées
 * Date: 2025-12-07
 */

import { config } from "dotenv";
config({ path: ".env.local" });

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Nettoie le nom d'un ingrédient en enlevant la quantité du début
 * Ex: "2 carottes" -> "carottes"
 * Ex: "1 kg 1 kg blanquette de veau" -> "blanquette de veau"
 * Ex: "250 g champignons coupés" -> "champignons coupés"
 */
function cleanIngredientName(name: string): string {
  // Pattern pour capturer les quantités au début
  // Exemples: "2 ", "1 kg ", "250 g ", "1 c.a.s ", etc.
  const patterns = [
    /^\d+(\.\d+)?\s*(kg|g|mg|l|ml|cl|dl|c\.a\.s|c\.a\.c|c\.\s*à\s*s|c\.\s*à\s*c|tasse|verre|pincée|pince)?\s+/gi,
  ];

  let cleaned = name;

  // Appliquer les patterns plusieurs fois pour les duplications
  for (let i = 0; i < 3; i++) {
    let changed = false;
    for (const pattern of patterns) {
      const before = cleaned;
      cleaned = cleaned.replace(pattern, "");
      if (before !== cleaned) {
        changed = true;
      }
    }
    if (!changed) break;
  }

  return cleaned.trim();
}

/**
 * Supprime les faux groupes "Ingrédients" et les remet en ingrédients simples
 */
async function cleanupFakeGroups() {
  console.log("🧹 Nettoyage des faux groupes 'Ingrédients'...\n");

  const recipes = await prisma.recipe.findMany({
    include: {
      ingredientGroups: {
        include: {
          ingredients: true,
        },
      },
    },
  });

  let cleaned = 0;

  for (const recipe of recipes) {
    // Vérifier si la recette a un seul groupe nommé "Ingrédients"
    if (
      recipe.ingredientGroups.length === 1 &&
      (recipe.ingredientGroups[0].name === "Ingrédients" ||
        recipe.ingredientGroups[0].name === "Ingrdients" ||
        recipe.ingredientGroups[0].name === "Ingrédients principaux")
    ) {
      console.log(`   🔧 Nettoyage de "${recipe.name}"...`);

      const group = recipe.ingredientGroups[0];

      // Supprimer le groupe (les ingrédients seront aussi supprimés en cascade)
      await prisma.ingredientGroup.delete({
        where: { id: group.id },
      });

      cleaned++;
    }
  }

  console.log(`\n✅ ${cleaned} faux groupes supprimés\n`);
}

/**
 * Corrige les noms d'ingrédients avec quantités dupliquées
 */
async function fixIngredientNames() {
  console.log("🔧 Correction des noms d'ingrédients...\n");

  const ingredients = await prisma.ingredient.findMany({
    include: {
      recipe: {
        select: {
          name: true,
        },
      },
    },
  });

  let fixed = 0;

  for (const ingredient of ingredients) {
    const cleaned = cleanIngredientName(ingredient.name);

    if (cleaned !== ingredient.name && cleaned.length > 0) {
      console.log(`   📝 "${ingredient.name}" -> "${cleaned}"`);
      console.log(`      (dans "${ingredient.recipe.name}")`);

      await prisma.ingredient.update({
        where: { id: ingredient.id },
        data: { name: cleaned },
      });

      fixed++;
    }
  }

  console.log(`\n✅ ${fixed} noms d'ingrédients corrigés\n`);
}

/**
 * Affiche un résumé des recettes avant de relancer la migration
 */
async function showSummary() {
  console.log("📊 Résumé après nettoyage\n");
  console.log("=".repeat(60));

  const recipes = await prisma.recipe.findMany({
    include: {
      ingredients: true,
      ingredientGroups: {
        include: {
          ingredients: true,
        },
      },
    },
  });

  const withGroups = recipes.filter((r) => r.ingredientGroups.length > 0);
  const withSimpleIngredients = recipes.filter(
    (r) => r.ingredientGroups.length === 0 && r.ingredients.length > 0
  );
  const withoutIngredients = recipes.filter(
    (r) => r.ingredientGroups.length === 0 && r.ingredients.length === 0
  );

  console.log(`\n📦 ${withGroups.length} recettes avec groupes complexes`);
  console.log(`📝 ${withSimpleIngredients.length} recettes avec ingrédients simples`);
  console.log(`⚠️  ${withoutIngredients.length} recettes sans ingrédients`);

  if (withGroups.length > 0) {
    console.log("\n🔍 Recettes avec groupes complexes:");
    withGroups.forEach((r) => {
      const groupNames = r.ingredientGroups.map((g) => g.name).join(", ");
      console.log(`   - ${r.name} (${r.ingredientGroups.length} groupes: ${groupNames})`);
    });
  }

  if (withSimpleIngredients.length > 0) {
    console.log("\n📝 Recettes prêtes pour la migration:");
    withSimpleIngredients.forEach((r) => {
      console.log(`   - ${r.name} (${r.ingredients.length} ingrédients)`);
    });
  }

  console.log("\n" + "=".repeat(60));
}

async function main() {
  console.log("🚀 Début du nettoyage\n");
  console.log("=".repeat(60));

  try {
    // Étape 1 : Nettoyer les faux groupes
    await cleanupFakeGroups();

    // Étape 2 : Corriger les noms d'ingrédients
    await fixIngredientNames();

    // Étape 3 : Afficher le résumé
    await showSummary();

    console.log("\n✅ Nettoyage terminé avec succès !");
    console.log("\nVous pouvez maintenant relancer la migration :");
    console.log("   npx tsx scripts/migrate-to-ingredient-groups.ts");
  } catch (error) {
    console.error("❌ Erreur:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("💥 Erreur fatale:", error);
    process.exit(1);
  });
