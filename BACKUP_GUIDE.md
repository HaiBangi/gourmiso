# 🗄️ Système de Backup Complet - Gourmich v2

Ce système de backup crée **3 formats différents** pour garantir la portabilité maximale et la facilité de restauration sur n'importe quelle base de données.

## 📋 Formats de Backup

### 1. JSON (Recommandé pour Prisma)
- ✅ **Format universel** et facile à lire
- ✅ **Preserve les relations** complexes
- ✅ **Facile à inspecter** et à modifier manuellement
- ✅ Inclut le schéma Prisma complet
- 📁 Dossier : `backups/json/[timestamp]/`

### 2. SQL (Compatible avec toutes les bases de données)
- ✅ **Import direct** dans PostgreSQL, MySQL, SQLite
- ✅ **Dump SQL standard** avec CREATE TABLE et INSERT
- ✅ Inclut le schéma Prisma en commentaires
- ✅ **Portable** entre différents SGBD
- 📁 Dossier : `backups/sql/[timestamp]/`

### 3. CSV (Format standard pour l'analyse et migration)
- ✅ **Import facile** dans Excel, Google Sheets, etc.
- ✅ **Compatible** avec tous les outils d'import CSV
- ✅ Un fichier par table pour une **flexibilité maximale**
- ✅ Inclut un manifest JSON avec les métadonnées
- 📁 Dossier : `backups/csv/[timestamp]/`

## 🚀 Utilisation

### Créer un backup complet

```bash
npm run db:backup:full
```

Cette commande va créer **automatiquement** les 3 formats de backup dans des dossiers horodatés.

**Résultat :**
```
backups/
├── json/
│   └── 2025-12-19_14-30-00/
│       ├── full-backup.json
│       ├── schema.prisma
│       └── README.md
├── sql/
│   └── 2025-12-19_14-30-00/
│       ├── full-backup.sql
│       ├── schema.prisma
│       └── README.md
└── csv/
    └── 2025-12-19_14-30-00/
        ├── users.csv
        ├── recipes.csv
        ├── ingredients.csv
        ├── ... (un fichier par table)
        ├── schema.prisma
        ├── manifest.json
        └── README.md
```

## 📥 Restauration

### Depuis JSON (Recommandé)

```bash
# 1. Restaurer le schéma Prisma
cp backups/json/[timestamp]/schema.prisma prisma/schema.prisma

# 2. Appliquer les migrations
npx prisma migrate deploy

# 3. Restaurer les données
npm run db:restore:json backups/json/[timestamp]/full-backup.json
```

### Depuis SQL

**PostgreSQL :**
```bash
psql -U username -d database_name -f backups/sql/[timestamp]/full-backup.sql
```

**MySQL :**
```bash
mysql -u username -p database_name < backups/sql/[timestamp]/full-backup.sql
```

**SQLite :**
```bash
sqlite3 prisma/dev.db < backups/sql/[timestamp]/full-backup.sql
```

### Depuis CSV

Les fichiers CSV peuvent être importés dans n'importe quel outil :
- **PostgreSQL** : `COPY` command
- **MySQL** : `LOAD DATA INFILE`
- **Excel/Google Sheets** : Import direct
- **Power BI / Tableau** : Analyse de données

Voir le README dans chaque dossier CSV pour les commandes spécifiques.

## 🔐 Contenu du Backup

Chaque backup inclut **TOUTES** les tables de la base de données :

### Tables principales
- ✅ **Users** : Utilisateurs avec rôles et authentification
- ✅ **Recipes** : Recettes complètes avec tous les champs
- ✅ **Ingredients** : Ingrédients individuels
- ✅ **IngredientGroups** : Groupes d'ingrédients (pâte, garniture, etc.)
- ✅ **Steps** : Étapes de préparation
- ✅ **Collections** : Collections personnalisées d'utilisateurs
- ✅ **Comments** : Commentaires sur les recettes
- ✅ **Notes** : Notes personnelles des utilisateurs

### Planification de repas
- ✅ **WeeklyMealPlans** : Plans de repas hebdomadaires
- ✅ **PlannedMeals** : Repas individuels planifiés
- ✅ **ShoppingListItems** : Listes de courses

### Relations
- ✅ **Favorites** : Relations utilisateur ↔ recettes favorites
- ✅ **CollectionRecipes** : Relations collection ↔ recettes

### Métadonnées
- ✅ **Schema Prisma** complet
- ✅ **Statistiques** : Nombre d'entrées par table
- ✅ **Timestamp** : Date et heure du backup
- ✅ **Instructions** : README avec guide de restauration

## 📊 Exemple de Statistiques

Un backup typique contient :
```
✅ 1 utilisateur(s)
✅ 150 recettes
✅ 800 ingrédients
✅ 50 groupes d'ingrédients
✅ 600 étapes
✅ 5 collections
✅ 20 commentaires
✅ 3 plans de repas hebdomadaires
✅ 15 repas planifiés
✅ 45 items de liste de courses
```

## ⚙️ Options Avancées

### Backup sélectif par format

Modifier `scripts/full-backup.ts` pour activer/désactiver certains formats :

```typescript
// Dans main()
await backupToJSON();   // Format JSON
// await backupToSQL();   // Désactivé
await backupToCSV();    // Format CSV
```

### Sauvegarde automatique

Ajouter à un cron job ou GitHub Actions :

```bash
# Backup quotidien à 2h du matin
0 2 * * * cd /path/to/project && npm run db:backup:full
```

## 🔄 Migration vers une autre base de données

### SQLite → PostgreSQL

1. Créer un backup complet : `npm run db:backup:full`
2. Utiliser le fichier SQL : `backups/sql/[timestamp]/full-backup.sql`
3. Adapter les types de données si nécessaire
4. Importer dans PostgreSQL

### PostgreSQL → MySQL

1. Utiliser le backup CSV pour plus de flexibilité
2. Importer table par table avec les outils MySQL
3. Vérifier les types de données (TEXT, TIMESTAMP, etc.)

### Vers n'importe quelle base

1. Utiliser le **backup JSON** pour la structure
2. Utiliser le **backup CSV** pour les données brutes
3. Créer un script de migration personnalisé si besoin

## 🛡️ Sécurité

**⚠️ ATTENTION :**
- Les backups contiennent des **données sensibles** (emails, mots de passe hachés)
- **NE PAS** commiter les backups dans Git
- Stocker les backups dans un **emplacement sécurisé**
- Chiffrer les backups pour le stockage à long terme

**Fichier `.gitignore` :**
```
backups/
!backups/.gitkeep
```

## 📝 Logs et Debugging

Tous les scripts affichent des logs détaillés :
- ✅ Progression en temps réel
- ✅ Nombre d'éléments traités par table
- ✅ Erreurs détaillées en cas de problème
- ✅ Statistiques finales

## 🆘 Support

Chaque dossier de backup contient un `README.md` spécifique avec :
- Instructions détaillées pour ce format
- Exemples de commandes d'import
- Statistiques du backup

## 📅 Recommandations

### Fréquence de backup
- **Développement** : Avant chaque migration majeure
- **Production** : Quotidien (automatisé)
- **Avant déploiement** : Toujours

### Rétention
- Garder les **7 derniers jours** en local
- Archiver les **backups mensuels** sur le cloud
- Tester la restauration **une fois par mois**

### Format recommandé par scénario
- **Migration Prisma** → JSON
- **Migration de base de données** → SQL
- **Analyse de données** → CSV
- **Archivage long terme** → Les 3 formats

## 🔧 Troubleshooting

### "Cannot find module 'tsx'"
```bash
npm install -D tsx
```

### "Foreign key constraint failed"
Les scripts désactivent temporairement les contraintes de clés étrangères. Si vous avez des erreurs, vérifiez que votre base de données le supporte.

### "Out of memory"
Pour les très grandes bases de données, augmentez la mémoire Node.js :
```bash
NODE_OPTIONS="--max-old-space-size=4096" npm run db:backup:full
```

## 📚 Ressources

- [Prisma Documentation](https://www.prisma.io/docs)
- [PostgreSQL COPY](https://www.postgresql.org/docs/current/sql-copy.html)
- [MySQL LOAD DATA](https://dev.mysql.com/doc/refman/8.0/en/load-data.html)

---

**Créé avec ❤️ pour Gourmich v2**
