"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Shield, ChefHat, User, Loader2 } from "lucide-react";
import { updateUserRole } from "@/actions/users";

interface UserWithCount {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: string;
  createdAt: Date;
  _count: {
    recipes: number;
    favorites: number;
  };
}

interface UserRoleManagerProps {
  users: UserWithCount[];
  currentUserId: string;
}

const roleConfig = {
  ADMIN: { label: "Admin", icon: Shield, color: "bg-red-100 text-red-700" },
  CONTRIBUTOR: { label: "Contributeur", icon: ChefHat, color: "bg-amber-100 text-amber-700" },
  READER: { label: "Lecteur", icon: User, color: "bg-blue-100 text-blue-700" },
};

export function UserRoleManager({ users, currentUserId }: UserRoleManagerProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [loadingUserId, setLoadingUserId] = useState<string | null>(null);

  const handleRoleChange = async (userId: string, newRole: string) => {
    setLoadingUserId(userId);
    startTransition(async () => {
      await updateUserRole(userId, newRole as "ADMIN" | "CONTRIBUTOR" | "READER");
      setLoadingUserId(null);
      router.refresh();
    });
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="hidden sm:grid sm:grid-cols-5 gap-4 px-4 py-2 text-sm font-medium text-muted-foreground border-b">
        <div className="col-span-2">Utilisateur</div>
        <div>Recettes</div>
        <div>Favoris</div>
        <div>Rôle</div>
      </div>

      {/* Users */}
      {users.map((user) => {
        const role = roleConfig[user.role as keyof typeof roleConfig] || roleConfig.READER;
        const RoleIcon = role.icon;
        const isCurrentUser = user.id === currentUserId;
        const isLoading = loadingUserId === user.id && isPending;

        return (
          <div
            key={user.id}
            className="grid grid-cols-1 sm:grid-cols-5 gap-4 items-center p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
          >
            {/* User Info */}
            <div className="col-span-2 flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user.image || ""} alt={user.name || ""} />
                <AvatarFallback className="bg-amber-100 text-amber-600">
                  {user.name?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="font-medium truncate">
                  {user.name || "Sans nom"}
                  {isCurrentUser && (
                    <Badge variant="outline" className="ml-2 text-xs">
                      Vous
                    </Badge>
                  )}
                </p>
                <p className="text-sm text-muted-foreground truncate">{user.email}</p>
              </div>
            </div>

            {/* Stats - Mobile */}
            <div className="sm:hidden flex gap-4 text-sm text-muted-foreground">
              <span>{user._count.recipes} recettes</span>
              <span>{user._count.favorites} favoris</span>
            </div>

            {/* Stats - Desktop */}
            <div className="hidden sm:block text-sm">
              {user._count.recipes}
            </div>
            <div className="hidden sm:block text-sm">
              {user._count.favorites}
            </div>

            {/* Role Selector */}
            <div className="flex items-center gap-2">
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              <Select
                value={user.role}
                onValueChange={(value) => handleRoleChange(user.id, value)}
                disabled={isCurrentUser || isLoading}
              >
                <SelectTrigger className="w-full sm:w-[160px]">
                  <SelectValue>
                    <div className="flex items-center gap-2">
                      <RoleIcon className="h-4 w-4" />
                      {role.label}
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="READER">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-blue-500" />
                      Lecteur
                    </div>
                  </SelectItem>
                  <SelectItem value="CONTRIBUTOR">
                    <div className="flex items-center gap-2">
                      <ChefHat className="h-4 w-4 text-amber-500" />
                      Contributeur
                    </div>
                  </SelectItem>
                  <SelectItem value="ADMIN">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-red-500" />
                      Admin
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );
      })}
    </div>
  );
}

