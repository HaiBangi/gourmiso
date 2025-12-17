import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function restore() {
  try {
    console.log('🔄 Chargement du backup...');
    
    const backupPath = path.join(process.cwd(), 'backups', 'backup-2025-12-14T21-22-31.json');
    const backupData = JSON.parse(fs.readFileSync(backupPath, 'utf-8'));
    
    console.log('📊 Stats du backup:', backupData.stats);
    console.log('📅 Exporté le:', backupData.exportedAt);
    
    // Restaurer les utilisateurs et créer un mapping
    console.log('\n👥 Restauration des utilisateurs...');
    const userIdMap = new Map<string, string>(); // old ID -> new ID
    
    if (backupData.data.users && backupData.data.users.length > 0) {
      for (const user of backupData.data.users) {
        try {
          // Chercher si l'utilisateur existe déjà par email
          const existing = await prisma.user.findUnique({
            where: { email: user.email },
          });
          
          if (existing) {
            console.log(`  ℹ️  User exists: ${user.pseudo || user.name} (${user.email})`);
            userIdMap.set(user.id, existing.id);
          } else {
            // Créer le nouvel utilisateur
            const created = await prisma.user.create({
              data: {
                name: user.name,
                pseudo: user.pseudo,
                email: user.email,
                emailVerified: user.emailVerified ? new Date(user.emailVerified) : null,
                image: user.image,
                role: user.role,
              },
            });
            console.log(`  ✅ User created: ${user.pseudo || user.name}`);
            userIdMap.set(user.id, created.id);
          }
        } catch (error: any) {
          console.error(`  ❌ Erreur user ${user.email}:`, error.message);
        }
      }
    }
    
    console.log(`\n   📋 User ID mapping:`, Array.from(userIdMap.entries()).map(([old, newId]) => `${old} → ${newId}`));
    
    // Restaurer les recettes
    console.log('\n🍳 Restauration des recettes...');
    if (backupData.data.recipes && backupData.data.recipes.length > 0) {
      for (const recipe of backupData.data.recipes) {
        try {
          // Mapper l'userId
          const mappedUserId = recipe.userId ? userIdMap.get(recipe.userId) : null;
          
          // Créer la recette
          const createdRecipe = await prisma.recipe.upsert({
            where: { id: recipe.id },
            update: {
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
              difficulty: recipe.difficulty,
              costEstimate: recipe.costEstimate,
              caloriesPerServing: recipe.caloriesPerServing,
              tags: recipe.tags || [],
              userId: mappedUserId,
            },
            create: {
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
              difficulty: recipe.difficulty,
              costEstimate: recipe.costEstimate,
              caloriesPerServing: recipe.caloriesPerServing,
              tags: recipe.tags || [],
              userId: mappedUserId,
            },
          });
          
          // Supprimer les anciens ingrédients et étapes
          await prisma.ingredient.deleteMany({ where: { recipeId: recipe.id } });
          await prisma.step.deleteMany({ where: { recipeId: recipe.id } });
          await prisma.ingredientGroup.deleteMany({ where: { recipeId: recipe.id } });
          
          // Restaurer les groupes d'ingrédients
          if (recipe.ingredientGroups && recipe.ingredientGroups.length > 0) {
            for (const group of recipe.ingredientGroups) {
              const createdGroup = await prisma.ingredientGroup.create({
                data: {
                  name: group.name,
                  order: group.order,
                  recipeId: recipe.id,
                },
              });
              
              // Restaurer les ingrédients du groupe
              if (group.ingredients && group.ingredients.length > 0) {
                for (const ing of group.ingredients) {
                  await prisma.ingredient.create({
                    data: {
                      name: ing.name,
                      quantity: ing.quantity,
                      unit: ing.unit,
                      order: ing.order,
                      recipeId: recipe.id,
                      groupId: createdGroup.id,
                    },
                  });
                }
              }
            }
          }
          
          // Restaurer les ingrédients sans groupe
          if (recipe.ingredients && recipe.ingredients.length > 0) {
            for (const ing of recipe.ingredients) {
              if (!ing.groupId) {
                await prisma.ingredient.create({
                  data: {
                    name: ing.name,
                    quantity: ing.quantity,
                    unit: ing.unit,
                    order: ing.order,
                    recipeId: recipe.id,
                  },
                });
              }
            }
          }
          
          // Restaurer les étapes
          if (recipe.steps && recipe.steps.length > 0) {
            for (const step of recipe.steps) {
              await prisma.step.create({
                data: {
                  order: step.order,
                  text: step.text,
                  recipeId: recipe.id,
                },
              });
            }
          }
          
          console.log(`  ✅ Recipe: ${recipe.name}`);
        } catch (error: any) {
          console.error(`  ❌ Erreur recipe ${recipe.name}:`, error.message);
        }
      }
    }
    
    // Restaurer les collections
    console.log('\n📁 Restauration des collections...');
    if (backupData.data.collections && backupData.data.collections.length > 0) {
      for (const collection of backupData.data.collections) {
        try {
          const mappedUserId = userIdMap.get(collection.userId);
          if (!mappedUserId) {
            console.log(`  ⚠️  Skipping collection (user not found): ${collection.name}`);
            continue;
          }
          
          const created = await prisma.collection.upsert({
            where: { 
              userId_name: {
                userId: mappedUserId,
                name: collection.name,
              }
            },
            update: {
              description: collection.description,
              color: collection.color,
              icon: collection.icon,
            },
            create: {
              name: collection.name,
              description: collection.description,
              color: collection.color,
              icon: collection.icon,
              userId: mappedUserId,
            },
          });
          
          // Restaurer les recettes de la collection
          if (collection.recipes && collection.recipes.length > 0) {
            await prisma.collection.update({
              where: { id: created.id },
              data: {
                recipes: {
                  connect: collection.recipes.map((r: any) => ({ id: r.id })),
                },
              },
            });
          }
          
          console.log(`  ✅ Collection: ${collection.name}`);
        } catch (error: any) {
          console.error(`  ❌ Erreur collection ${collection.name}:`, error.message);
        }
      }
    }
    
    // Restaurer les notes
    console.log('\n📝 Restauration des notes...');
    if (backupData.data.userRecipeNotes && backupData.data.userRecipeNotes.length > 0) {
      for (const note of backupData.data.userRecipeNotes) {
        try {
          const mappedUserId = userIdMap.get(note.userId);
          if (!mappedUserId) continue;
          
          await prisma.userRecipeNote.upsert({
            where: {
              userId_recipeId: {
                userId: mappedUserId,
                recipeId: note.recipeId,
              }
            },
            update: {
              note: note.note,
            },
            create: {
              userId: mappedUserId,
              recipeId: note.recipeId,
              note: note.note,
            },
          });
          console.log(`  ✅ Note pour recette ${note.recipeId}`);
        } catch (error: any) {
          console.error(`  ❌ Erreur note:`, error.message);
        }
      }
    }
    
    // Restaurer les favoris
    console.log('\n⭐ Restauration des favoris...');
    if (backupData.data.userFavorites && backupData.data.userFavorites.length > 0) {
      for (const fav of backupData.data.userFavorites) {
        try {
          const mappedUserId = userIdMap.get(fav.userId);
          if (!mappedUserId) continue;
          
          await prisma.user.update({
            where: { id: mappedUserId },
            data: {
              favorites: {
                connect: { id: fav.recipeId },
              },
            },
          });
          console.log(`  ✅ Favori: user ${mappedUserId} → recipe ${fav.recipeId}`);
        } catch (error: any) {
          console.error(`  ❌ Erreur favori:`, error.message);
        }
      }
    }
    
    console.log('\n✅ Restauration terminée !');
    
    // Afficher les stats finales
    const stats = {
      users: await prisma.user.count(),
      recipes: await prisma.recipe.count(),
      ingredients: await prisma.ingredient.count(),
      steps: await prisma.step.count(),
      collections: await prisma.collection.count(),
      notes: await prisma.userRecipeNote.count(),
    };
    
    console.log('\n📊 Stats de la base de données:');
    console.log(stats);
    
  } catch (error) {
    console.error('❌ Erreur lors de la restauration:', error);
  } finally {
    await prisma.$disconnect();
  }
}

restore();
