import Link from "next/link";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, Star, ChefHat } from "lucide-react";
import type { Recipe } from "@/types/recipe";

interface RecipeCardProps {
  recipe: Recipe;
}

const categoryLabels: Record<string, string> = {
  MAIN_DISH: "Plat principal",
  STARTER: "Entrée",
  DESSERT: "Dessert",
  SIDE_DISH: "Accompagnement",
  SOUP: "Soupe",
  SALAD: "Salade",
  BEVERAGE: "Boisson",
  SNACK: "En-cas",
};

const categoryColors: Record<string, string> = {
  MAIN_DISH: "bg-amber-500 text-white",
  STARTER: "bg-emerald-500 text-white",
  DESSERT: "bg-pink-500 text-white",
  SIDE_DISH: "bg-blue-500 text-white",
  SOUP: "bg-orange-500 text-white",
  SALAD: "bg-lime-500 text-white",
  BEVERAGE: "bg-cyan-500 text-white",
  SNACK: "bg-violet-500 text-white",
};

export function RecipeCard({ recipe }: RecipeCardProps) {
  const totalTime = recipe.preparationTime + recipe.cookingTime;

  return (
    <Link href={`/recipes/${recipe.id}`}>
      <Card className="group h-full flex flex-col overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/5 hover:-translate-y-1 border-0 bg-gradient-to-br from-white to-stone-50 dark:from-stone-900 dark:to-stone-950">
        {/* Image */}
        <div className="relative aspect-[6/6] overflow-hidden bg-stone-100 dark:bg-stone-800">
          {recipe.imageUrl ? (
            <Image
              src={recipe.imageUrl}
              alt={recipe.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <ChefHat className="h-16 w-16 text-stone-300 dark:text-stone-600" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <Badge
            className={`absolute top-3 left-3 border-0 shadow-md text-sm px-2.5 py-1 ${categoryColors[recipe.category] || "bg-stone-500 text-white"}`}
          >
            {categoryLabels[recipe.category] || recipe.category}
          </Badge>
          {recipe.rating > 0 && (
            <div className="absolute top-3 right-3 flex items-center gap-1.5 rounded-full bg-black/50 backdrop-blur-sm px-2.5 py-1 shadow-md">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              <span className="text-sm font-medium text-white">{recipe.rating}/10</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex flex-col flex-1 p-4">
          <h3 className="font-serif text-lg font-semibold leading-snug text-stone-900 dark:text-stone-100 line-clamp-2 group-hover:text-amber-600 transition-colors">
            {recipe.name}
          </h3>
          <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">par {recipe.author}</p>
          
          {/* Time & Servings */}
          <div className="flex items-center gap-4 text-sm text-stone-500 dark:text-stone-400 mt-3">
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              <span>{totalTime} min</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users className="h-4 w-4" />
              <span>{recipe.servings} pers.</span>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
