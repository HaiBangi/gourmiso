/**
 * Backup complet de la base de données avant migration des groupes d'ingrédients
 * Date: 2025-12-07
 */

import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

async function backupDatabase() {
  console.log("🔄 Début du backup de la base de données...");

  try {
    // Récupérer toutes les recettes avec leurs relations
    const recipes = await prisma.recipe.findMany({
      include: {
        ingredients: true,
        steps: true,
        ingredientGroups: {
          include: {
            ingredients: true,
          },
        },
        comments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        collections: {
          include: {
            recipes: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Récupérer tous les utilisateurs
    const users = await prisma.user.findMany({
      include: {
        favorites: true,
        sessions: true,
        accounts: true,
      },
    });

    // Récupérer toutes les collections
    const collections = await prisma.collection.findMany({
      include: {
        recipes: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    const backup = {
      timestamp: new Date().toISOString(),
      version: "1.0.0",
      description: "Backup avant migration des groupes d'ingrédients",
      stats: {
        recipes: recipes.length,
        users: users.length,
        collections: collections.length,
        ingredients: recipes.reduce((sum, r) => sum + r.ingredients.length, 0),
        steps: recipes.reduce((sum, r) => sum + r.steps.length, 0),
      },
      data: {
        recipes,
        users,
        collections,
      },
    };

    // Créer le dossier backups s'il n'existe pas
    const backupsDir = path.join(process.cwd(), "backups");
    if (!fs.existsSync(backupsDir)) {
      fs.mkdirSync(backupsDir, { recursive: true });
    }

    // Sauvegarder avec un nom de fichier horodaté
    const filename = `backup-ingredient-groups-${new Date().toISOString().replace(/:/g, "-").split(".")[0]}.json`;
    const filepath = path.join(backupsDir, filename);

    fs.writeFileSync(filepath, JSON.stringify(backup, null, 2), "utf-8");

    console.log("\n✅ Backup créé avec succès !");
    console.log(`📁 Fichier: ${filepath}`);
    console.log(`\n📊 Statistiques:`);
    console.log(`   - ${backup.stats.recipes} recettes`);
    console.log(`   - ${backup.stats.users} utilisateurs`);
    console.log(`   - ${backup.stats.collections} collections`);
    console.log(`   - ${backup.stats.ingredients} ingrédients`);
    console.log(`   - ${backup.stats.steps} étapes`);

    return filepath;
  } catch (error) {
    console.error("❌ Erreur lors du backup:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

backupDatabase()
  .then((filepath) => {
    console.log("\n🎉 Backup terminé avec succès !");
    console.log(`\nPour restaurer ce backup, utilisez :`);
    console.log(`node scripts/restore-recipes.ts ${path.basename(filepath)}`);
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Erreur fatale:", error);
    process.exit(1);
  });
