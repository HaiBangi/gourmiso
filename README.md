# 🍳 Yumiso

Application moderne de gestion de recettes construite avec Next.js 16, proposant une interface élégante, des opérations CRUD complètes et un design responsive.

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38B2AC?style=flat-square&logo=tailwind-css)
![Prisma](https://img.shields.io/badge/Prisma-5-2D3748?style=flat-square&logo=prisma)

## ✨ Fonctionnalités

### 📖 Gestion des recettes
- ✅ **CRUD complet** - Créer, lire, modifier et supprimer des recettes
- ✅ **Ingrédients groupés** - Organisation par catégories (Farce, Sauce, Garniture...)
- ✅ **Ingrédients dynamiques** - Ajout/suppression d'ingrédients avec quantités et unités
- ✅ **Étapes de préparation** - Instructions numérotées et ordonnées
- ✅ **Images & Vidéos** - Intégration Unsplash API, liens YouTube/TikTok
- ✅ **Ajustement des portions** - Recalcul automatique des quantités d'ingrédients (1-20 personnes)
- ✅ **Collections** - Organiser ses recettes par thématique
- ✅ **Notes personnelles** - Ajouter des commentaires privés sur chaque recette

### 🤖 Intelligence Artificielle (Premium)
- ✅ **Import YouTube** - Génération automatique de recettes depuis transcriptions YouTube
- ✅ **Import TikTok** - Extraction de recettes depuis vidéos TikTok
- ✅ **Import Multi-URL** - Traitement parallélisé de plusieurs vidéos (max 3 simultanés)
- ✅ **Import Vocal/Texte** - Créer une recette depuis description textuelle ou vocale
- ✅ **Optimisation IA** - Amélioration automatique des ingrédients et étapes
- ✅ **Traduction automatique** - Pour recherche d'images Unsplash
- ✅ **Génération d'images** - Recherche automatique d'images pertinentes

### 📅 Planificateur de repas
- ✅ **Menus hebdomadaires** - Planification complète sur 7 jours
- ✅ **Génération IA de menus** - Création automatique de menus équilibrés
- ✅ **Mode mixte** - Combinaison recettes existantes + nouvelles recettes IA
- ✅ **Repas personnalisés** - Petit-déjeuner, déjeuner, dîner, collations
- ✅ **Calcul des calories** - Affichage du total par jour
- ✅ **Drag & Drop** - Réorganisation des repas par glisser-déposer
- ✅ **Partage de menus** - Inviter des contributeurs avec rôles (Lecteur/Contributeur)
- ✅ **Menus publics/privés** - Contrôle de visibilité

### 🛒 Liste de courses
- ✅ **Génération automatique** - À partir des menus planifiés
- ✅ **Optimisation IA** - Regroupement et addition intelligente des ingrédients
- ✅ **Temps réel** - Synchronisation multi-utilisateurs pour courses partagées
- ✅ **Catégorisation** - Organisation par rayon (Légumes, Viandes, Épicerie...)
- ✅ **Checkbox interactives** - Cocher les articles achetés avec sauvegarde locale

### 🏷️ Organisation
- ✅ **Catégories** - Plat principal, Entrée, Dessert, Boisson, etc.
- ✅ **Tags / Mots-clés** - Système de tags avec autocomplétion (asiatique, végétarien, rapide...)
- ✅ **Filtres rapides** - Badges cliquables pour les catégories principales
- ✅ **Recherche avancée** - Par nom, description, auteur ou tags
- ✅ **Tri personnalisé** - Par date, note, temps de préparation, nom
- ✅ **Pagination** - Navigation fluide avec préférence de tri sauvegardée

### 🔐 Authentification & Utilisateurs
- ✅ **Google OAuth** - Connexion sécurisée avec NextAuth.js v5
- ✅ **Rôles utilisateurs** - ADMIN / OWNER (Premium) / CONTRIBUTOR / READER
- ✅ **Profils personnalisés** - Pseudo modifiable, tableau de bord personnel
- ✅ **Gestion admin** - Page d'administration pour gérer les rôles
- ✅ **Protection des routes** - Middleware de sécurité pour les pages sensibles

### ⭐ Social & Engagement
- ✅ **Favoris** - Sauvegarder ses recettes préférées (❤️)
- ✅ **Commentaires** - Ajouter des avis avec notation étoiles
- ✅ **Partage social** - Twitter, Facebook, WhatsApp, copier le lien
- ✅ **Publication anonyme** - Option pour masquer son pseudo
- ✅ **Pages utilisateurs** - Profil public avec recettes créées

### 🎨 Interface & UX
- ✅ **Design moderne** - Composants ShadCN UI avec Tailwind CSS 4
- ✅ **100% Responsive** - Optimisé mobile, tablette et desktop
- ✅ **Bottom Sheets mobiles** - Formulaires adaptés aux petits écrans
- ✅ **Mode sombre** - Toggle thème clair/sombre/système
- ✅ **Animations fluides** - Transitions et hover states soignés
- ✅ **Loading states** - Skeletons et indicateurs de chargement
- ✅ **Tooltips contextuels** - Aide instantanée sur les fonctionnalités
- ✅ **PWA Ready** - Installation comme application native

### ⚡ Performance & SEO
- ✅ **Server-side rendering** - Next.js 16 App Router avec Server Components
- ✅ **Prisma ORM** - Requêtes optimisées avec connection pooling
- ✅ **Images optimisées** - Next/Image avec lazy loading
- ✅ **Revalidation automatique** - Server actions avec cache intelligent
- ✅ **Metadata dynamiques** - SEO optimisé pour chaque page
- ✅ **Service Worker** - Cache offline et performances améliorées

### 🔧 Développement & Maintenance
- ✅ **TypeScript strict** - Typage complet pour éviter les bugs
- ✅ **Backups automatiques** - Export JSON/SQL/CSV de la base de données
- ✅ **Scripts d'import** - Restauration facile depuis backups
- ✅ **Migration Prisma** - Gestion des changements de schéma
- ✅ **Logs détaillés** - Debugging facilité pour import YouTube/TikTok

## 🛠️ Stack Technique

| Couche | Technologie |
|--------|------------|
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router) |
| **Langage** | [TypeScript](https://www.typescriptlang.org/) |
| **Base de données** | [PostgreSQL](https://www.postgresql.org/) + [Prisma ORM](https://www.prisma.io/) + [Prisma Accelerate](https://www.prisma.io/data-platform/accelerate) |
| **Auth** | [NextAuth.js v5](https://authjs.dev/) (Auth.js) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) |
| **Composants** | [ShadCN UI](https://ui.shadcn.com/) |
| **Validation** | [Zod](https://zod.dev/) |
| **Icônes** | [Lucide React](https://lucide.dev/) |
| **Déploiement** | [Vercel](https://vercel.com/) |

## 🚀 Démarrage rapide

### Prérequis
- [Node.js](https://nodejs.org/) 18+ 
- npm, yarn ou pnpm

### Variables d'environnement

Créer un fichier `.env.local` à la racine du projet :

```bash
# Base de données
DATABASE_URL="file:./dev.db"  # SQLite en dev

# NextAuth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="votre-secret-aleatoire"

# Google OAuth
GOOGLE_CLIENT_ID="votre-client-id"
GOOGLE_CLIENT_SECRET="votre-client-secret"

# OpenAI API (pour fonctionnalités IA)
OPENAI_API_KEY="sk-..."

# Unsplash API (pour images automatiques)
UNSPLASH_ACCESS_KEY="votre-access-key"

# Proxy YouTube (optionnel - pour import YouTube en production)
PROXY_URL="http://user:pass@proxy.example.com:port"
```

### Installation

```bash
# Cloner le repo
git clone https://github.com/HaiBangi/yumiso.git
cd yumiso

# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.example .env.local
# Remplir les variables dans .env.local

# Initialiser la base de données
npx prisma db push

# Lancer le serveur de développement
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000) 🎉

## 📜 Scripts disponibles

| Commande | Description |
|----------|-------------|
| `npm run dev` | Serveur de développement |
| `npm run build` | Build production |
| `npm run start` | Serveur production |
| `npm run lint` | Linter ESLint |
| `npx prisma studio` | Interface Prisma Studio |
| `npx prisma db push` | Synchroniser le schéma |

## 🗃️ Modèle de données

### Recipe (Recette)
| Champ | Type | Description |
|-------|------|-------------|
| `id` | Int | Clé primaire |
| `name` | String | Nom de la recette |
| `description` | String? | Description optionnelle |
| `category` | String | Catégorie (MAIN_DISH, DESSERT, etc.) |
| `author` | String | Auteur de la recette |
| `tags` | String[] | Mots-clés (asiatique, végétarien, etc.) |
| `imageUrl` | String? | URL de l'image |
| `videoUrl` | String? | URL de la vidéo |
| `preparationTime` | Int | Temps de préparation (min) |
| `cookingTime` | Int | Temps de cuisson (min) |
| `rating` | Int | Note 0-10 |
| `servings` | Int | Nombre de portions |
| `userId` | String? | Auteur (relation User) |

### User (Utilisateur)
| Champ | Type | Description |
|-------|------|-------------|
| `id` | String | Clé primaire (cuid) |
| `name` | String? | Nom complet |
| `pseudo` | String | Pseudo affiché |
| `email` | String | Email unique |
| `role` | Role | ADMIN / CONTRIBUTOR / READER |

## 🏷️ Catégories disponibles

| Valeur | Label |
|--------|-------|
| `MAIN_DISH` | Plat principal |
| `STARTER` | Entrée |
| `DESSERT` | Dessert |
| `SIDE_DISH` | Accompagnement |
| `SOUP` | Soupe |
| `SALAD` | Salade |
| `BEVERAGE` | Boisson |
| `SNACK` | En-cas |

---

## 👑 Fonctionnalités Premium

### Rôles utilisateurs
- **READER** - Consultation uniquement
- **CONTRIBUTOR** - Création et modification de recettes
- **OWNER** (Premium) - Accès complet aux fonctionnalités IA
- **ADMIN** - Gestion complète de l'application

### Fonctionnalités réservées OWNER/ADMIN
Toutes les fonctionnalités IA sont protégées côté **serveur** (API routes) et **client** (UI) :

✨ **Import YouTube/TikTok** - Génération depuis vidéos  
✨ **Import Multi-URL** - Traitement parallélisé  
✨ **Import Vocal/Texte** - Création depuis description  
✨ **Génération de menus** - Création automatique de menus équilibrés  
✨ **Génération de repas** - Création de repas personnalisés  
✨ **Optimisation IA** - Amélioration des recettes et listes de courses

**Sécurité** :
- ✅ Vérification du rôle sur chaque endpoint API (`/api/*`)
- ✅ Boutons désactivés avec tooltips explicatifs pour non-Premium
- ✅ Messages d'erreur 403 si tentative d'accès direct
- ✅ Badge "�� Premium" visible sur l'interface

---

## 📝 Licence

Ce projet est open source sous licence [MIT](LICENSE).

---

Made with ❤️ and 🍳 by the Yumiso team
