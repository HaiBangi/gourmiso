/**
 * Script de restauration rapide depuis un backup
 * Utilisation: node scripts/restore-from-backup.ts <nom-du-fichier-backup.json>
 */

import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

async function restoreFromBackup(backupFilename: string) {
  console.log("🔄 Début de la restauration depuis le backup...\n");

  try {
    // Lire le fichier de backup
    const backupPath = path.join(process.cwd(), "backups", backupFilename);

    if (!fs.existsSync(backupPath)) {
      throw new Error(`❌ Fichier de backup introuvable: ${backupPath}`);
    }

    console.log(`📂 Lecture du backup: ${backupFilename}`);
    const backupData = JSON.parse(fs.readFileSync(backupPath, "utf-8"));

    console.log(`\n📊 Informations du backup:`);
    console.log(`   Date: ${backupData.timestamp}`);
    console.log(`   Description: ${backupData.description}`);
    console.log(`   Recettes: ${backupData.stats.recipes}`);
    console.log(`   Utilisateurs: ${backupData.stats.users}`);
    console.log(`   Collections: ${backupData.stats.collections}`);

    const confirm = process.argv[3] === "--confirm";
    if (!confirm) {
      console.log("\n⚠️  ATTENTION: Cette opération va SUPPRIMER toutes les données actuelles !");
      console.log("Pour confirmer, ajoutez --confirm à la commande:");
      console.log(`   npx tsx scripts/restore-from-backup.ts ${backupFilename} --confirm`);
      process.exit(0);
    }

    console.log("\n🗑️  Suppression des données actuelles...");

    // Supprimer dans l'ordre inverse des dépendances
    await prisma.$transaction(async (tx) => {
      await tx.comment.deleteMany({});
      await tx.collection.deleteMany({});
      await tx.ingredient.deleteMany({});
      await tx.ingredientGroup.deleteMany({});
      await tx.step.deleteMany({});
      await tx.recipe.deleteMany({});
      await tx.session.deleteMany({});
      await tx.account.deleteMany({});
      await tx.user.deleteMany({});
    });

    console.log("✅ Données supprimées");

    console.log("\n📥 Restauration des données...");

    // Restaurer les utilisateurs
    console.log("   👥 Restauration des utilisateurs...");
    for (const user of backupData.data.users) {
      await prisma.user.create({
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
          emailVerified: user.emailVerified ? new Date(user.emailVerified) : null,
          image: user.image,
          pseudo: user.pseudo,
          role: user.role,
          createdAt: new Date(user.createdAt),
          updatedAt: new Date(user.updatedAt),
        },
      });
    }

    // Restaurer les recettes avec leurs relations
    console.log("   🍽️  Restauration des recettes...");
    for (const recipe of backupData.data.recipes) {
      await prisma.recipe.create({
        data: {
          id: recipe.id,
          name: recipe.name,
          description: recipe.description,
          category: recipe.category,
          author: recipe.author,
          imageUrl: recipe.imageUrl,
          videoUrl: recipe.videoUrl,
          preparationTime: recipe.preparationTime,
          cookingTime: recipe.cookingTime,
          rating: recipe.rating,
          servings: recipe.servings,
          costEstimate: recipe.costEstimate,
          tags: recipe.tags,
          userId: recipe.userId,
          createdAt: new Date(recipe.createdAt),
          updatedAt: new Date(recipe.updatedAt),
          // Relations
          ingredients: {
            create: recipe.ingredients.map((ing: any) => ({
              id: ing.id,
              name: ing.name,
              quantity: ing.quantity,
              unit: ing.unit,
              order: ing.order,
              groupId: ing.groupId,
            })),
          },
          steps: {
            create: recipe.steps.map((step: any) => ({
              id: step.id,
              order: step.order,
              text: step.text,
            })),
          },
          ingredientGroups: {
            create: recipe.ingredientGroups.map((group: any) => ({
              id: group.id,
              name: group.name,
              order: group.order,
              ingredients: {
                create: group.ingredients.map((ing: any) => ({
                  id: ing.id,
                  name: ing.name,
                  quantity: ing.quantity,
                  unit: ing.unit,
                  order: ing.order,
                })),
              },
            })),
          },
        },
      });
    }

    // Restaurer les collections
    console.log("   📚 Restauration des collections...");
    for (const collection of backupData.data.collections) {
      await prisma.collection.create({
        data: {
          id: collection.id,
          name: collection.name,
          description: collection.description,
          userId: collection.userId,
          createdAt: new Date(collection.createdAt),
          updatedAt: new Date(collection.updatedAt),
          recipes: {
            connect: collection.recipes.map((r: any) => ({ id: r.id })),
          },
        },
      });
    }

    console.log("\n✅ Restauration terminée avec succès !");
    console.log(`\n📊 Données restaurées:`);
    console.log(`   - ${backupData.stats.recipes} recettes`);
    console.log(`   - ${backupData.stats.users} utilisateurs`);
    console.log(`   - ${backupData.stats.collections} collections`);
  } catch (error) {
    console.error("❌ Erreur lors de la restauration:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Vérifier les arguments
const backupFilename = process.argv[2];

if (!backupFilename) {
  console.log("Usage: npx tsx scripts/restore-from-backup.ts <nom-du-fichier-backup.json> [--confirm]");
  console.log("\nFichiers de backup disponibles:");

  const backupsDir = path.join(process.cwd(), "backups");
  if (fs.existsSync(backupsDir)) {
    const files = fs.readdirSync(backupsDir).filter((f) => f.endsWith(".json"));
    files.forEach((f) => console.log(`   - ${f}`));
  } else {
    console.log("   Aucun backup trouvé");
  }

  process.exit(1);
}

restoreFromBackup(backupFilename)
  .then(() => {
    console.log("\n🎉 Restauration terminée !");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Erreur fatale:", error);
    process.exit(1);
  });
