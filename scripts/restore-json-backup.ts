import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function restoreFromJSON(backupPath: string) {
  console.log('📦 Restauration depuis JSON...');
  
  try {
    const backupData = JSON.parse(fs.readFileSync(backupPath, 'utf-8'));
    
    console.log('📊 Statistiques du backup:');
    Object.entries(backupData.statistics).forEach(([key, value]) => {
      console.log(`   - ${key}: ${value}`);
    });

    console.log('\n⚠️  ATTENTION: Cette opération va SUPPRIMER toutes les données existantes!');
    console.log('Appuyez sur Ctrl+C pour annuler, ou attendez 5 secondes...\n');
    
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Désactiver les contraintes de clés étrangères
    await prisma.$executeRaw`PRAGMA foreign_keys = OFF;`;

    // Supprimer toutes les données dans l'ordre inverse des dépendances
    console.log('🗑️  Suppression des données existantes...');
    await prisma.shoppingListItem.deleteMany({});
    await prisma.plannedMeal.deleteMany({});
    await prisma.weeklyMealPlan.deleteMany({});
    await prisma.note.deleteMany({});
    await prisma.comment.deleteMany({});
    await prisma.step.deleteMany({});
    await prisma.ingredient.deleteMany({});
    await prisma.ingredientGroup.deleteMany({});
    await prisma.collection.deleteMany({});
    await prisma.recipe.deleteMany({});
    await prisma.author.deleteMany({});
    await prisma.tag.deleteMany({});
    await prisma.user.deleteMany({});

    console.log('✅ Données existantes supprimées\n');

    // Restaurer les données
    console.log('📥 Restauration des données...\n');

    // Users
    if (backupData.data.users?.length > 0) {
      console.log(`   Restauration de ${backupData.data.users.length} utilisateurs...`);
      for (const user of backupData.data.users) {
        const { favorites, collections, ...userData } = user;
        await prisma.user.create({ data: userData });
      }
    }

    // Recipes
    if (backupData.data.recipes?.length > 0) {
      console.log(`   Restauration de ${backupData.data.recipes.length} recettes...`);
      for (const recipe of backupData.data.recipes) {
        const { ingredients, ingredientGroups, steps, collections, comments, favoritedBy, ...recipeData } = recipe;
        await prisma.recipe.create({ data: recipeData });
      }
    }

    // Ingredient Groups
    if (backupData.data.ingredientGroups?.length > 0) {
      console.log(`   Restauration de ${backupData.data.ingredientGroups.length} groupes d'ingrédients...`);
      for (const group of backupData.data.ingredientGroups) {
        const { ingredients, ...groupData } = group;
        await prisma.ingredientGroup.create({ data: groupData });
      }
    }

    // Ingredients
    if (backupData.data.ingredients?.length > 0) {
      console.log(`   Restauration de ${backupData.data.ingredients.length} ingrédients...`);
      for (const ingredient of backupData.data.ingredients) {
        await prisma.ingredient.create({ data: ingredient });
      }
    }

    // Steps
    if (backupData.data.steps?.length > 0) {
      console.log(`   Restauration de ${backupData.data.steps.length} étapes...`);
      for (const step of backupData.data.steps) {
        await prisma.step.create({ data: step });
      }
    }

    // Collections
    if (backupData.data.collections?.length > 0) {
      console.log(`   Restauration de ${backupData.data.collections.length} collections...`);
      for (const collection of backupData.data.collections) {
        const { recipes, ...collectionData } = collection;
        await prisma.collection.create({ data: collectionData });
      }
    }

    // Comments
    if (backupData.data.comments?.length > 0) {
      console.log(`   Restauration de ${backupData.data.comments.length} commentaires...`);
      for (const comment of backupData.data.comments) {
        const { user, recipe, ...commentData } = comment;
        await prisma.comment.create({ data: commentData });
      }
    }

    // Weekly Meal Plans
    if (backupData.data.weeklyMealPlans?.length > 0) {
      console.log(`   Restauration de ${backupData.data.weeklyMealPlans.length} plans de repas...`);
      for (const plan of backupData.data.weeklyMealPlans) {
        const { meals, shoppingList, ...planData } = plan;
        await prisma.weeklyMealPlan.create({ data: planData });
      }
    }

    // Planned Meals
    if (backupData.data.plannedMeals?.length > 0) {
      console.log(`   Restauration de ${backupData.data.plannedMeals.length} repas planifiés...`);
      for (const meal of backupData.data.plannedMeals) {
        const { recipe, ...mealData } = meal;
        await prisma.plannedMeal.create({ data: mealData });
      }
    }

    // Shopping List Items
    if (backupData.data.shoppingListItems?.length > 0) {
      console.log(`   Restauration de ${backupData.data.shoppingListItems.length} items de liste de courses...`);
      for (const item of backupData.data.shoppingListItems) {
        await prisma.shoppingListItem.create({ data: item });
      }
    }

    // User Notes
    if (backupData.data.userNotes?.length > 0) {
      console.log(`   Restauration de ${backupData.data.userNotes.length} notes utilisateur...`);
      for (const note of backupData.data.userNotes) {
        const { user, ...noteData } = note;
        await prisma.userNote.create({ data: noteData });
      }
    }

    // User Recipe Notes
    if (backupData.data.userRecipeNotes?.length > 0) {
      console.log(`   Restauration de ${backupData.data.userRecipeNotes.length} notes de recettes...`);
      for (const note of backupData.data.userRecipeNotes) {
        const { user, recipe, ...noteData } = note;
        await prisma.userRecipeNote.create({ data: noteData });
      }
    }

    // Restaurer les relations many-to-many
    console.log('\n   Restauration des relations...');
    
    // Favorites
    for (const user of backupData.data.users) {
      if (user.favorites && user.favorites.length > 0) {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            favorites: {
              connect: user.favorites.map((fav: any) => ({ id: fav.id }))
            }
          }
        });
      }
    }

    // Collection recipes
    for (const collection of backupData.data.collections) {
      if (collection.recipes && collection.recipes.length > 0) {
        await prisma.collection.update({
          where: { id: collection.id },
          data: {
            recipes: {
              connect: collection.recipes.map((recipe: any) => ({ id: recipe.id }))
            }
          }
        });
      }
    }

    // Réactiver les contraintes
    await prisma.$executeRaw`PRAGMA foreign_keys = ON;`;

    console.log('\n🎉 Restauration terminée avec succès!');
    
  } catch (error) {
    console.error('❌ Erreur lors de la restauration:', error);
    throw error;
  }
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage: node restore-json-backup.js <path-to-backup.json>');
    console.log('Example: node restore-json-backup.js backups/json/2025-12-19_10-30-00/full-backup.json');
    process.exit(1);
  }

  const backupPath = args[0];
  
  if (!fs.existsSync(backupPath)) {
    console.error(`❌ Fichier non trouvé: ${backupPath}`);
    process.exit(1);
  }

  try {
    await restoreFromJSON(backupPath);
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
