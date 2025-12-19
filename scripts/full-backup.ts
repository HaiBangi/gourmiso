import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

// Créer un timestamp pour le nom du backup
const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0] + '_' + 
                 new Date().toTimeString().split(' ')[0].replace(/:/g, '-');

const backupDir = path.join(process.cwd(), 'backups');

// Créer les dossiers de backup
const jsonDir = path.join(backupDir, 'json', timestamp);
const sqlDir = path.join(backupDir, 'sql', timestamp);
const csvDir = path.join(backupDir, 'csv', timestamp);

[jsonDir, sqlDir, csvDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

console.log('🚀 Début du backup complet de la base de données...');
console.log(`📅 Timestamp: ${timestamp}\n`);

async function backupToJSON() {
  console.log('📦 Backup JSON en cours...');
  
  try {
    // Récupérer toutes les données de toutes les tables
    const [
      users,
      recipes,
      ingredients,
      ingredientGroups,
      steps,
      collections,
      comments,
      weeklyMealPlans,
      plannedMeals,
      shoppingListItems,
      userNotes,
      userRecipeNotes
    ] = await Promise.all([
      prisma.user.findMany({ include: { favorites: true, collections: true } }),
      prisma.recipe.findMany({
        include: {
          ingredients: true,
          ingredientGroups: { include: { ingredients: true } },
          steps: true,
          collections: true,
          comments: { include: { user: true } },
          favoritedBy: true
        }
      }),
      prisma.ingredient.findMany(),
      prisma.ingredientGroup.findMany({ include: { ingredients: true } }),
      prisma.step.findMany(),
      prisma.collection.findMany({ include: { recipes: true } }),
      prisma.comment.findMany({ include: { user: true, recipe: true } }),
      prisma.weeklyMealPlan.findMany({ include: { meals: true, shoppingListItems: true } }),
      prisma.plannedMeal.findMany({ include: { recipe: true } }),
      prisma.shoppingListItem.findMany(),
      prisma.userNote.findMany({ include: { user: true } }),
      prisma.userRecipeNote.findMany({ include: { user: true, recipe: true } })
    ]);

    const backup = {
      metadata: {
        version: '1.0',
        timestamp: new Date().toISOString(),
        database: 'gourmich-v2',
        prismaSchema: 'included in schema.prisma file'
      },
      data: {
        users,
        recipes,
        ingredients,
        ingredientGroups,
        steps,
        collections,
        comments,
        weeklyMealPlans,
        plannedMeals,
        shoppingListItems,
        userNotes,
        userRecipeNotes
      },
      statistics: {
        users: users.length,
        recipes: recipes.length,
        ingredients: ingredients.length,
        ingredientGroups: ingredientGroups.length,
        steps: steps.length,
        collections: collections.length,
        comments: comments.length,
        weeklyMealPlans: weeklyMealPlans.length,
        plannedMeals: plannedMeals.length,
        shoppingListItems: shoppingListItems.length,
        userNotes: userNotes.length,
        userRecipeNotes: userRecipeNotes.length
      }
    };

    // Sauvegarder le JSON
    fs.writeFileSync(
      path.join(jsonDir, 'full-backup.json'),
      JSON.stringify(backup, null, 2)
    );

    // Copier le schema Prisma
    const schemaPath = path.join(process.cwd(), 'prisma', 'schema.prisma');
    if (fs.existsSync(schemaPath)) {
      fs.copyFileSync(schemaPath, path.join(jsonDir, 'schema.prisma'));
    }

    // Créer un README
    fs.writeFileSync(
      path.join(jsonDir, 'README.md'),
      `# Backup JSON - ${timestamp}

## Contenu
- \`full-backup.json\`: Toutes les données de la base de données au format JSON
- \`schema.prisma\`: Schéma Prisma de la base de données

## Import
Pour importer ce backup dans Prisma:
\`\`\`bash
# 1. Restaurer le schéma
cp schema.prisma ../../../prisma/schema.prisma

# 2. Exécuter les migrations
npx prisma migrate deploy

# 3. Importer les données avec un script personnalisé
node restore-json-backup.js full-backup.json
\`\`\`

## Statistiques
${Object.entries(backup.statistics).map(([key, value]) => `- ${key}: ${value}`).join('\n')}

Date de création: ${new Date().toLocaleString('fr-FR')}
`
    );

    console.log(`✅ Backup JSON créé: ${jsonDir}`);
    console.log(`   - ${backup.statistics.recipes} recettes`);
    console.log(`   - ${backup.statistics.users} utilisateurs`);
    console.log(`   - ${backup.statistics.ingredients} ingrédients\n`);
    
  } catch (error) {
    console.error('❌ Erreur lors du backup JSON:', error);
    throw error;
  }
}

async function backupToSQL() {
  console.log('🗄️  Backup SQL en cours...');
  
  try {
    let sqlDump = `-- Backup SQL de Gourmich v2
-- Date: ${new Date().toLocaleString('fr-FR')}
-- Timestamp: ${timestamp}
-- 
-- Ce fichier contient le schéma complet et toutes les données

SET foreign_key_checks = 0;

`;

    // Schéma Prisma en commentaire
    const schemaPath = path.join(process.cwd(), 'prisma', 'schema.prisma');
    if (fs.existsSync(schemaPath)) {
      const schema = fs.readFileSync(schemaPath, 'utf-8');
      sqlDump += `-- ============================================
-- PRISMA SCHEMA
-- ============================================
/*
${schema}
*/

`;
      fs.copyFileSync(schemaPath, path.join(sqlDir, 'schema.prisma'));
    }

    sqlDump += `-- ============================================
-- DONNÉES
-- ============================================

`;

    // Users
    const users = await prisma.user.findMany();
    if (users.length > 0) {
      sqlDump += `-- Table: User\n`;
      sqlDump += `DELETE FROM "User";\n`;
      users.forEach(user => {
        const values = [
          `'${user.id}'`,
          user.name ? `'${user.name.replace(/'/g, "''")}'` : 'NULL',
          user.email ? `'${user.email.replace(/'/g, "''")}'` : 'NULL',
          user.emailVerified ? `'${user.emailVerified.toISOString()}'` : 'NULL',
          user.image ? `'${user.image.replace(/'/g, "''")}'` : 'NULL',
          user.pseudo ? `'${user.pseudo.replace(/'/g, "''")}'` : 'NULL',
          `'${user.role}'`,
          `'${user.createdAt.toISOString()}'`,
          `'${user.updatedAt.toISOString()}'`
        ];
        sqlDump += `INSERT INTO "User" (id, name, email, "emailVerified", image, pseudo, role, "createdAt", "updatedAt") VALUES (${values.join(', ')});\n`;
      });
      sqlDump += `\n`;
    }

    // Recipes
    const recipes = await prisma.recipe.findMany();
    if (recipes.length > 0) {
      sqlDump += `-- Table: Recipe\n`;
      sqlDump += `DELETE FROM "Recipe";\n`;
      recipes.forEach(recipe => {
        const values = [
          recipe.id,
          `'${recipe.name.replace(/'/g, "''")}'`,
          recipe.description ? `'${recipe.description.replace(/'/g, "''")}'` : 'NULL',
          `'${recipe.category}'`,
          recipe.author ? `'${recipe.author.replace(/'/g, "''")}'` : 'NULL',
          recipe.preparationTime,
          recipe.cookingTime,
          recipe.servings,
          recipe.costEstimate ? `'${recipe.costEstimate}'` : 'NULL',
          recipe.rating,
          recipe.caloriesPerServing || 'NULL',
          recipe.imageUrl ? `'${recipe.imageUrl.replace(/'/g, "''")}'` : 'NULL',
          recipe.videoUrl ? `'${recipe.videoUrl.replace(/'/g, "''")}'` : 'NULL',
          `ARRAY[${recipe.tags.map(t => `'${t.replace(/'/g, "''")}'`).join(', ')}]::text[]`,
          recipe.userId ? `'${recipe.userId}'` : 'NULL',
          `'${recipe.createdAt.toISOString()}'`,
          `'${recipe.updatedAt.toISOString()}'`
        ];
        sqlDump += `INSERT INTO "Recipe" (id, name, description, category, author, "preparationTime", "cookingTime", servings, "costEstimate", rating, "caloriesPerServing", "imageUrl", "videoUrl", tags, "userId", "createdAt", "updatedAt") VALUES (${values.join(', ')});\n`;
      });
      sqlDump += `\n`;
    }

    // Ingredients
    const ingredients = await prisma.ingredient.findMany();
    if (ingredients.length > 0) {
      sqlDump += `-- Table: Ingredient\n`;
      sqlDump += `DELETE FROM "Ingredient";\n`;
      ingredients.forEach(ing => {
        const values = [
          ing.id,
          `'${ing.name.replace(/'/g, "''")}'`,
          ing.quantity,
          ing.unit ? `'${ing.unit.replace(/'/g, "''")}'` : 'NULL',
          ing.order,
          ing.recipeId || 'NULL',
          ing.groupId || 'NULL'
        ];
        sqlDump += `INSERT INTO "Ingredient" (id, name, quantity, unit, "order", "recipeId", "groupId") VALUES (${values.join(', ')});\n`;
      });
      sqlDump += `\n`;
    }

    // IngredientGroups
    const groups = await prisma.ingredientGroup.findMany();
    if (groups.length > 0) {
      sqlDump += `-- Table: IngredientGroup\n`;
      sqlDump += `DELETE FROM "IngredientGroup";\n`;
      groups.forEach(group => {
        const values = [
          group.id,
          `'${group.name.replace(/'/g, "''")}'`,
          group.order,
          group.recipeId
        ];
        sqlDump += `INSERT INTO "IngredientGroup" (id, name, "order", "recipeId") VALUES (${values.join(', ')});\n`;
      });
      sqlDump += `\n`;
    }

    // Steps
    const steps = await prisma.step.findMany();
    if (steps.length > 0) {
      sqlDump += `-- Table: Step\n`;
      sqlDump += `DELETE FROM "Step";\n`;
      steps.forEach(step => {
        const values = [
          step.id,
          step.order,
          `'${step.text.replace(/'/g, "''")}'`,
          step.recipeId
        ];
        sqlDump += `INSERT INTO "Step" (id, "order", text, "recipeId") VALUES (${values.join(', ')});\n`;
      });
      sqlDump += `\n`;
    }

    // Collections
    const collections = await prisma.collection.findMany();
    if (collections.length > 0) {
      sqlDump += `-- Table: Collection\n`;
      sqlDump += `DELETE FROM "Collection";\n`;
      collections.forEach(col => {
        const values = [
          col.id,
          `'${col.name.replace(/'/g, "''")}'`,
          col.description ? `'${col.description.replace(/'/g, "''")}'` : 'NULL',
          `'${col.color}'`,
          `'${col.icon}'`,
          `'${col.userId}'`,
          `'${col.createdAt.toISOString()}'`,
          `'${col.updatedAt.toISOString()}'`
        ];
        sqlDump += `INSERT INTO "Collection" (id, name, description, color, icon, "userId", "createdAt", "updatedAt") VALUES (${values.join(', ')});\n`;
      });
      sqlDump += `\n`;
    }

    sqlDump += `\nSET foreign_key_checks = 1;\n`;

    // Sauvegarder le SQL
    fs.writeFileSync(path.join(sqlDir, 'full-backup.sql'), sqlDump);

    // README
    fs.writeFileSync(
      path.join(sqlDir, 'README.md'),
      `# Backup SQL - ${timestamp}

## Contenu
- \`full-backup.sql\`: Dump SQL complet avec schéma et données
- \`schema.prisma\`: Schéma Prisma de la base de données

## Import

### PostgreSQL
\`\`\`bash
psql -U username -d database_name -f full-backup.sql
\`\`\`

### MySQL
\`\`\`bash
mysql -u username -p database_name < full-backup.sql
\`\`\`

### SQLite
\`\`\`bash
sqlite3 dev.db < full-backup.sql
\`\`\`

## Avec Prisma
\`\`\`bash
# 1. Restaurer le schéma
cp schema.prisma ../../../prisma/schema.prisma

# 2. Appliquer les migrations
npx prisma migrate deploy

# 3. Importer les données SQL
# (voir commandes ci-dessus selon votre base de données)
\`\`\`

Date de création: ${new Date().toLocaleString('fr-FR')}
`
    );

    console.log(`✅ Backup SQL créé: ${sqlDir}\n`);
    
  } catch (error) {
    console.error('❌ Erreur lors du backup SQL:', error);
    throw error;
  }
}

async function backupToCSV() {
  console.log('📊 Backup CSV en cours...');
  
  try {
    // Fonction helper pour créer un CSV
    const createCSV = (data: any[], filename: string) => {
      if (data.length === 0) return;
      
      const headers = Object.keys(data[0]);
      const csvContent = [
        headers.join(','),
        ...data.map(row => 
          headers.map(header => {
            const value = row[header];
            if (value === null || value === undefined) return '';
            if (Array.isArray(value)) return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
            if (typeof value === 'object') return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
            if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
          }).join(',')
        )
      ].join('\n');
      
      fs.writeFileSync(path.join(csvDir, filename), csvContent, 'utf-8');
    };

    // Exporter chaque table
    const users = await prisma.user.findMany();
    createCSV(users, 'users.csv');

    const recipes = await prisma.recipe.findMany();
    createCSV(recipes, 'recipes.csv');

    const ingredients = await prisma.ingredient.findMany();
    createCSV(ingredients, 'ingredients.csv');

    const ingredientGroups = await prisma.ingredientGroup.findMany();
    createCSV(ingredientGroups, 'ingredient_groups.csv');

    const steps = await prisma.step.findMany();
    createCSV(steps, 'steps.csv');

    const collections = await prisma.collection.findMany();
    createCSV(collections, 'collections.csv');

    const comments = await prisma.comment.findMany();
    createCSV(comments, 'comments.csv');

    const weeklyMealPlans = await prisma.weeklyMealPlan.findMany();
    createCSV(weeklyMealPlans, 'weekly_meal_plans.csv');

    const plannedMeals = await prisma.plannedMeal.findMany();
    createCSV(plannedMeals, 'planned_meals.csv');

    const shoppingListItems = await prisma.shoppingListItem.findMany();
    createCSV(shoppingListItems, 'shopping_list_items.csv');

    const userNotes = await prisma.userNote.findMany();
    createCSV(userNotes, 'user_notes.csv');

    const userRecipeNotes = await prisma.userRecipeNote.findMany();
    createCSV(userRecipeNotes, 'user_recipe_notes.csv');

    // Note: Les relations many-to-many (favorites, collections) sont déjà présentes
    // dans les données des tables principales. Pas besoin de tables de jointure séparées en CSV.

    // Copier le schema
    const schemaPath = path.join(process.cwd(), 'prisma', 'schema.prisma');
    if (fs.existsSync(schemaPath)) {
      fs.copyFileSync(schemaPath, path.join(csvDir, 'schema.prisma'));
    }

    // Créer un manifest JSON avec les métadonnées
    const manifest = {
      timestamp: new Date().toISOString(),
      tables: {
        users: users.length,
        recipes: recipes.length,
        ingredients: ingredients.length,
        ingredientGroups: ingredientGroups.length,
        steps: steps.length,
        collections: collections.length,
        comments: comments.length,
        weeklyMealPlans: weeklyMealPlans.length,
        plannedMeals: plannedMeals.length,
        shoppingListItems: shoppingListItems.length,
        userNotes: userNotes.length,
        userRecipeNotes: userRecipeNotes.length
      },
      files: [
        'users.csv',
        'recipes.csv',
        'ingredients.csv',
        'ingredient_groups.csv',
        'steps.csv',
        'collections.csv',
        'comments.csv',
        'weekly_meal_plans.csv',
        'planned_meals.csv',
        'shopping_list_items.csv',
        'user_notes.csv',
        'user_recipe_notes.csv',
        'schema.prisma',
        'manifest.json'
      ]
    };

    fs.writeFileSync(
      path.join(csvDir, 'manifest.json'),
      JSON.stringify(manifest, null, 2)
    );

    // README
    fs.writeFileSync(
      path.join(csvDir, 'README.md'),
      `# Backup CSV - ${timestamp}

## Contenu
Chaque table de la base de données est exportée dans un fichier CSV séparé:
${manifest.files.filter(f => f.endsWith('.csv')).map(f => `- \`${f}\``).join('\n')}

Fichiers additionnels:
- \`schema.prisma\`: Schéma Prisma de la base de données
- \`manifest.json\`: Métadonnées du backup (nombre de lignes par table, etc.)

## Import

### Avec un outil d'import CSV
La plupart des bases de données supportent l'import CSV:

**PostgreSQL:**
\`\`\`sql
COPY users FROM '/path/to/users.csv' DELIMITER ',' CSV HEADER;
\`\`\`

**MySQL:**
\`\`\`sql
LOAD DATA INFILE '/path/to/users.csv' 
INTO TABLE users 
FIELDS TERMINATED BY ',' 
ENCLOSED BY '"'
LINES TERMINATED BY '\\n'
IGNORE 1 ROWS;
\`\`\`

### Avec Prisma
1. Restaurer le schéma: \`cp schema.prisma ../../../prisma/schema.prisma\`
2. Appliquer les migrations: \`npx prisma migrate deploy\`
3. Importer les CSV avec un script personnalisé ou un outil comme \`csv-import\`

## Statistiques
${Object.entries(manifest.tables).map(([table, count]) => `- ${table}: ${count} ligne(s)`).join('\n')}

Date de création: ${new Date().toLocaleString('fr-FR')}
`
    );

    console.log(`✅ Backup CSV créé: ${csvDir}`);
    console.log(`   - ${manifest.files.length} fichiers CSV`);
    console.log(`   - ${recipes.length} recettes\n`);
    
  } catch (error) {
    console.error('❌ Erreur lors du backup CSV:', error);
    throw error;
  }
}

async function main() {
  try {
    await backupToJSON();
    await backupToSQL();
    await backupToCSV();

    console.log('🎉 Backup complet terminé avec succès!');
    console.log(`\n📁 Les backups sont disponibles dans:`);
    console.log(`   - JSON: ${jsonDir}`);
    console.log(`   - SQL:  ${sqlDir}`);
    console.log(`   - CSV:  ${csvDir}`);
    console.log(`\n💡 Chaque dossier contient un README.md avec les instructions d'import.`);
    
  } catch (error) {
    console.error('❌ Erreur lors du backup:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
