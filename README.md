# 🍳 Gourmiso

A modern, elegant recipe management application built with Next.js 16, featuring a beautiful UI, full CRUD operations, and a responsive design.

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38B2AC?style=flat-square&logo=tailwind-css)
![Prisma](https://img.shields.io/badge/Prisma-5-2D3748?style=flat-square&logo=prisma)

## ✨ Features

- **📖 Recipe Management** - Create, read, update, and delete recipes
- **🔍 Search & Filter** - Search by name, author, or description with category filters
- **🏷️ Categories** - Organize recipes by type (Main Dish, Starter, Dessert, etc.)
- **⭐ Ratings** - Rate your recipes from 0 to 10
- **📱 Responsive Design** - Beautiful on desktop, tablet, and mobile
- **🎨 Modern UI** - Clean design with ShadCN components and Tailwind CSS
- **⚡ Fast** - Server-side rendering with Next.js App Router
- **🔄 Real-time Updates** - Server actions with automatic revalidation
- **🔐 Authentication** - Google OAuth with NextAuth.js v5
- **👥 User Roles** - Admin, Contributor, Reader with granular permissions
- **❤️ Favorites** - Save your favorite recipes
- **👤 User Profiles** - Personal dashboard with your recipes and favorites

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router) |
| **Language** | [TypeScript](https://www.typescriptlang.org/) |
| **Database** | [PostgreSQL](https://www.postgresql.org/) with [Prisma ORM](https://www.prisma.io/) + [Prisma Accelerate](https://www.prisma.io/data-platform/accelerate) |
| **Auth** | [NextAuth.js v5](https://authjs.dev/) (Auth.js) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) |
| **Components** | [ShadCN UI](https://ui.shadcn.com/) |
| **Validation** | [Zod](https://zod.dev/) |
| **Icons** | [Lucide React](https://lucide.dev/) |

## 📁 Project Structure

```
gourmiso/
├── prisma/
│   ├── schema.prisma          # Database schema
│   ├── migrations/            # Database migrations
│   ├── seed.ts                # Seed data script
│   └── import-old-recipes.ts  # Import script for legacy data
├── src/
│   ├── app/
│   │   ├── api/recipes/       # REST API endpoints
│   │   │   ├── route.ts       # GET all, POST create
│   │   │   └── [id]/route.ts  # GET, PUT, DELETE by ID
│   │   ├── recipes/
│   │   │   ├── page.tsx       # Recipe list page
│   │   │   ├── loading.tsx    # Loading skeleton
│   │   │   └── [id]/
│   │   │       ├── page.tsx   # Recipe detail page
│   │   │       ├── loading.tsx
│   │   │       └── not-found.tsx
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Home (redirects to /recipes)
│   ├── components/
│   │   ├── ui/                # ShadCN UI components
│   │   └── recipes/           # Recipe-specific components
│   │       ├── recipe-card.tsx
│   │       ├── recipe-list.tsx
│   │       ├── recipe-detail.tsx
│   │       ├── recipe-form.tsx
│   │       ├── recipe-filters.tsx
│   │       ├── recipe-skeleton.tsx
│   │       └── delete-recipe-dialog.tsx
│   ├── actions/
│   │   └── recipes.ts         # Server actions
│   ├── lib/
│   │   ├── db.ts              # Prisma client
│   │   ├── utils.ts           # Utility functions
│   │   └── validations.ts     # Zod schemas
│   └── types/
│       └── recipe.ts          # TypeScript types
├── public/
│   └── pattern.svg            # Background pattern
└── package.json
```

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+ 
- npm, yarn, or pnpm

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/gourmiso.git
   cd gourmiso
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up the database**
   ```bash
   npx prisma migrate dev --name init
   ```

4. **Seed the database** (optional)
   ```bash
   npm run db:seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📜 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run db:migrate` | Run Prisma migrations |
| `npm run db:seed` | Seed the database |
| `npm run db:studio` | Open Prisma Studio |
| `npm run db:reset` | Reset database and run migrations |

## 🗃️ Database Schema

### Recipe
| Field | Type | Description |
|-------|------|-------------|
| `id` | Int | Primary key |
| `name` | String | Recipe name |
| `description` | String? | Optional description |
| `category` | String | Category enum |
| `author` | String | Recipe author |
| `imageUrl` | String? | Image URL |
| `videoUrl` | String? | Video URL |
| `preparationTime` | Int | Prep time in minutes |
| `cookingTime` | Int | Cook time in minutes |
| `rating` | Int | Rating 0-10 |
| `servings` | Int | Number of servings |
| `createdAt` | DateTime | Creation timestamp |
| `updatedAt` | DateTime | Update timestamp |

### Ingredient
| Field | Type | Description |
|-------|------|-------------|
| `id` | Int | Primary key |
| `name` | String | Ingredient name |
| `quantity` | Float? | Optional quantity |
| `unit` | String? | Unit (g, ml, etc.) |
| `recipeId` | Int | Foreign key to Recipe |

### Step
| Field | Type | Description |
|-------|------|-------------|
| `id` | Int | Primary key |
| `order` | Int | Step order |
| `text` | String | Step instructions |
| `recipeId` | Int | Foreign key to Recipe |

## 🏷️ Categories

| Value | Label (FR) |
|-------|------------|
| `MAIN_DISH` | Plat principal |
| `STARTER` | Entrée |
| `DESSERT` | Dessert |
| `SIDE_DISH` | Accompagnement |
| `SOUP` | Soupe |
| `SALAD` | Salade |
| `BEVERAGE` | Boisson |
| `SNACK` | En-cas |

## 🔌 API Endpoints

### GET `/api/recipes`
Get all recipes with optional filtering.

**Query Parameters:**
- `category` - Filter by category

**Response:** Array of Recipe objects with ingredients and steps

### POST `/api/recipes`
Create a new recipe.

**Body:** Recipe data with ingredients and steps arrays

### GET `/api/recipes/[id]`
Get a single recipe by ID.

### PUT `/api/recipes/[id]`
Update a recipe by ID.

### DELETE `/api/recipes/[id]`
Delete a recipe by ID.

## 🎨 Customization

### Adding New Categories

1. Update the enum in `src/types/recipe.ts`
2. Add labels in component files (`recipe-card.tsx`, `recipe-detail.tsx`, etc.)
3. Add colors in `categoryColors` objects

### Styling

- Global styles: `src/app/globals.css`
- Theme variables defined using CSS custom properties
- Tailwind configuration in `tailwind.config.ts`

## 🗺️ Roadmap

### 🔐 Authentification & Utilisateurs
- [x] **Connexion utilisateur** - Google OAuth pour sauvegarder ses recettes favorites ✅
- [x] **Profils cuisinier** - Chaque auteur a sa page avec ses recettes ✅
- [x] **Rôles** - Admin (CRUD tout) / Contributeur (ajouter) / Lecteur (voir) ✅

### ⭐ Engagement & Social
- [x] **Favoris** - Sauvegarder ses recettes préférées (❤️) ✅
- [ ] **Commentaires** - Ajouter des avis et astuces sous chaque recette
- [ ] **Système de votes** - Noter les recettes (pas juste l'auteur)
- [ ] **Partage social** - Boutons Twitter, WhatsApp, Facebook, copier le lien
- [ ] **"J'ai fait cette recette"** - Compteur de réalisations

### 🔍 Recherche & Filtres avancés
- [ ] **Recherche par ingrédient** - "Qu'est-ce que je peux faire avec du poulet ?"
- [ ] **Filtres multiples** - Temps, difficulté, régime (végé, sans gluten...)
- [ ] **Tri avancé** - Par popularité, date, temps de préparation
- [ ] **Tags personnalisés** - #rapide #économique #healthy #comfort-food

### 📱 Expérience mobile
- [ ] **PWA** - Installation sur téléphone comme une vraie app
- [ ] **Mode cuisine** - Écran qui reste allumé, navigation par étape, gros boutons
- [ ] **Commandes vocales** - "Étape suivante" pendant la cuisine
- [ ] **Mode hors-ligne** - Accéder aux recettes favorites sans internet

### 🛒 Planification & Courses
- [ ] **Liste de courses auto** - Générer depuis une recette
- [ ] **Planificateur de repas** - Calendrier semaine avec drag & drop
- [ ] **Ajustement portions** - Recalculer les quantités automatiquement
- [ ] **Fusion listes** - Combiner les ingrédients de plusieurs recettes

### 📊 Analytics & Gamification
- [ ] **Statistiques perso** - Recettes cuisinées, catégories préférées
- [ ] **Badges** - "Premier Bo Bun", "10 desserts réalisés", "Chef asiatique"
- [ ] **Streak cuisine** - "Tu as cuisiné 7 jours d'affilée !"
- [ ] **Leaderboard** - Top contributeurs du mois

### 🤖 Intelligence & Automatisation
- [ ] **Import par URL** - Coller un lien Marmiton/750g → import auto
- [ ] **OCR photo** - Prendre en photo une recette papier → import
- [ ] **Suggestions IA** - "Basé sur tes goûts, essaie..."
- [ ] **Chatbot recette** - "Donne-moi une idée de plat rapide ce soir"

### 🎨 Personnalisation & UX
- [ ] **Thèmes** - Dark mode, couleurs personnalisées
- [ ] **Collections** - Créer des dossiers (Asiatique, Rapide, Fêtes...)

---

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React Framework
- [ShadCN UI](https://ui.shadcn.com/) - Beautiful UI components
- [Prisma](https://www.prisma.io/) - Next-generation ORM
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS
- [Unsplash](https://unsplash.com/) - Recipe images

---

Made with ❤️ and 🍳
