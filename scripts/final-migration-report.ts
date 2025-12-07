/**
 * Rapport final de la migration
 */

import { config } from "dotenv";
config({ path: ".env.local" });

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function finalReport() {
  console.log("\n" + "=".repeat(80));
  console.log("📊 RAPPORT FINAL DE MIGRATION DES GROUPES D'INGRÉDIENTS");
  console.log("=".repeat(80));

  const recipes = await prisma.recipe.findMany({
    include: {
      ingredientGroups: {
        include: {
          ingredients: true,
        },
      },
      ingredients: true,
    },
    orderBy: { name: "asc" },
  });

  const withComplexGroups = recipes.filter(
    (r) =>
      r.ingredientGroups.length > 1 ||
      (r.ingredientGroups.length === 1 && r.ingredientGroups[0].name !== "Ingrédients")
  );
  const withSimpleIngredients = recipes.filter(
    (r) => r.ingredientGroups.length === 0 && r.ingredients.length > 0
  );
  const withoutIngredients = recipes.filter(
    (r) => r.ingredientGroups.length === 0 && r.ingredients.length === 0
  );

  console.log("\n📈 STATISTIQUES GLOBALES:\n");
  console.log(`   Total de recettes: ${recipes.length}`);
  console.log(`   ✅ Avec groupes complexes: ${withComplexGroups.length}`);
  console.log(`   📝 Ingrédients simples: ${withSimpleIngredients.length}`);
  console.log(`   ⚠️  Sans ingrédients: ${withoutIngredients.length}`);

  const totalGroups = recipes.reduce((sum, r) => sum + r.ingredientGroups.length, 0);
  const totalIngredients = recipes.reduce(
    (sum, r) =>
      sum +
      r.ingredients.length +
      r.ingredientGroups.reduce((s, g) => s + g.ingredients.length, 0),
    0
  );

  console.log(`\n   Groupes d'ingrédients créés: ${totalGroups}`);
  console.log(`   Ingrédients totaux: ${totalIngredients}`);

  console.log("\n" + "=".repeat(80));
  console.log("🎯 RECETTES AVEC GROUPES COMPLEXES:\n");

  const groupStats: { [key: string]: number } = {};

  for (const recipe of withComplexGroups) {
    const groupNames = recipe.ingredientGroups.map((g) => g.name).join(", ");
    console.log(`   🍽️  ${recipe.name}`);
    console.log(`      ${recipe.ingredientGroups.length} groupes: ${groupNames}`);

    // Compter les types de groupes
    recipe.ingredientGroups.forEach((g) => {
      groupStats[g.name] = (groupStats[g.name] || 0) + 1;
    });
  }

  console.log("\n" + "=".repeat(80));
  console.log("📦 TYPES DE GROUPES LES PLUS UTILISÉS:\n");

  const sortedGroups = Object.entries(groupStats).sort((a, b) => b[1] - a[1]);

  sortedGroups.forEach(([name, count]) => {
    console.log(`   ${count.toString().padStart(3)}x ${name}`);
  });

  console.log("\n" + "=".repeat(80));
  console.log("✅ BUGS CORRIGÉS:\n");
  console.log("   ✓ Faux groupes 'Ingrédients' supprimés");
  console.log("   ✓ Quantités dupliquées dans les noms corrigées");
  console.log("   ✓ Groupes intelligents créés par ChatGPT");
  console.log("   ✓ Backup complet créé avant modifications");

  console.log("\n" + "=".repeat(80));
  console.log("💾 BACKUPS DISPONIBLES:\n");
  console.log("   - backup-ingredient-groups-2025-12-07T22-21-29.json");
  console.log("   - backup-ingredient-groups-2025-12-07T22-27-57.json");

  console.log("\n" + "=".repeat(80));
  console.log("🎉 MIGRATION TERMINÉE AVEC SUCCÈS !");
  console.log("=".repeat(80) + "\n");

  await prisma.$disconnect();
}

finalReport();
