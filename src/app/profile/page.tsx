import { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { ChefHat, Calendar, Heart, BookOpen, Shield, User as UserIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Mon profil | Gourmiso",
  description: "Gérez votre profil et vos recettes",
};

const roleLabels = {
  ADMIN: { label: "Administrateur", icon: Shield, color: "text-red-500", bg: "bg-red-50" },
  CONTRIBUTOR: { label: "Contributeur", icon: ChefHat, color: "text-amber-500", bg: "bg-amber-50" },
  READER: { label: "Lecteur", icon: UserIcon, color: "text-blue-500", bg: "bg-blue-50" },
};

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    include: {
      _count: {
        select: {
          recipes: true,
          favorites: true,
        },
      },
    },
  });

  if (!user) {
    redirect("/auth/signin");
  }

  const role = roleLabels[user.role as keyof typeof roleLabels] || roleLabels.READER;
  const RoleIcon = role.icon;

  return (
    <main className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-amber-500 to-orange-500">
        <div className="mx-auto max-w-screen-xl px-4 py-6 sm:px-6 sm:py-8">
          <Link href="/recipes" className="text-white/80 hover:text-white text-sm mb-4 inline-block">
            ← Retour aux recettes
          </Link>
          <div className="flex items-center gap-4 sm:gap-6">
            <Avatar className="h-20 w-20 sm:h-24 sm:w-24 border-4 border-white/30">
              <AvatarImage src={user.image || ""} alt={user.name || "User"} />
              <AvatarFallback className="text-2xl bg-white text-amber-500">
                {user.name?.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">{user.name}</h1>
              <p className="text-white/80">{user.email}</p>
              <div className={`inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full ${role.bg} ${role.color} text-sm font-medium`}>
                <RoleIcon className="h-4 w-4" />
                {role.label}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Stats */}
      <section className="mx-auto max-w-screen-xl px-4 py-8 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Mes recettes
              </CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{user._count.recipes}</div>
              <p className="text-xs text-muted-foreground mt-1">
                recettes créées
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Favoris
              </CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{user._count.favorites}</div>
              <p className="text-xs text-muted-foreground mt-1">
                recettes sauvegardées
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Membre depuis
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">
                {new Date(user.createdAt).toLocaleDateString("fr-FR", {
                  month: "long",
                  year: "numeric",
                })}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {Math.floor((Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24))} jours
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">Actions rapides</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Card className="hover:shadow-lg transition-shadow">
              <Link href="/profile/recipes">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-amber-100">
                      <ChefHat className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Mes recettes</CardTitle>
                      <CardDescription>Gérez vos créations culinaires</CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Link>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <Link href="/profile/favorites">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-red-100">
                      <Heart className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Mes favoris</CardTitle>
                      <CardDescription>Accédez à vos recettes sauvegardées</CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Link>
            </Card>
          </div>
        </div>

        {/* Role permissions info */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Vos permissions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                  Voir toutes les recettes
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                  Ajouter aux favoris
                </li>
                {(user.role === "CONTRIBUTOR" || user.role === "ADMIN") && (
                  <>
                    <li className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                      Créer des recettes
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                      Modifier vos recettes
                    </li>
                  </>
                )}
                {user.role === "ADMIN" && (
                  <>
                    <li className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                      Modifier toutes les recettes
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                      Gérer les utilisateurs
                    </li>
                  </>
                )}
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}

