"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Youtube, Loader2 } from "lucide-react";
import { FaTiktok } from "react-icons/fa";

type Platform = "youtube" | "tiktok";

interface SocialImportFormProps {
  onClose: () => void;
  onRecipeGenerated: (recipe: any) => void;
  platform: Platform;
}

export function SocialImportForm({ 
  onClose, 
  onRecipeGenerated,
  platform 
}: SocialImportFormProps) {
  const [videoUrl, setVideoUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const platformConfig = {
    youtube: {
      name: "YouTube",
      icon: Youtube,
      color: "text-red-600 dark:text-red-500",
      bgColor: "bg-red-50 dark:bg-red-950/20",
      placeholder: "https://www.youtube.com/watch?v=...",
      urlPattern: /^https?:\/\/(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/|m\.youtube\.com\/watch\?v=)[a-zA-Z0-9_-]{11}/,
      extractEndpoint: "/api/youtube/transcript",
    },
    tiktok: {
      name: "TikTok",
      icon: FaTiktok,
      color: "text-[#000000] dark:text-white",
      bgColor: "bg-[#FE2C55]/10 dark:bg-white/10",
      placeholder: "https://www.tiktok.com/@username/video/...",
      urlPattern: /tiktok\.com/,
      extractEndpoint: "/api/tiktok/extract",
    },
  };

  const config = platformConfig[platform];
  const Icon = config.icon;

  const handleImport = async () => {
    if (!videoUrl.trim()) {
      setError(`Veuillez entrer un lien ${config.name}`);
      return;
    }

    if (!config.urlPattern.test(videoUrl)) {
      setError(`Format d'URL ${config.name} invalide`);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      let extractData;
      
      if (platform === "youtube") {
        const videoIdMatch = videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|m\.youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/);
        if (!videoIdMatch) {
          throw new Error("Impossible d'extraire l'ID de la vidéo YouTube");
        }
        const videoId = videoIdMatch[1];
        const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

        const response = await fetch(config.extractEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ videoId }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Erreur lors de l'extraction");
        }

        const data = await response.json();
        extractData = {
          ...data,
          videoUrl,
          imageUrl: thumbnailUrl,
        };
      } else {
        const response = await fetch(config.extractEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ videoUrl }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Erreur lors de l'extraction");
        }

        const data = await response.json();
        extractData = {
          ...data,
          transcript: data.description,
          videoUrl,
          imageUrl: data.thumbnail,
        };
      }

      const recipeRes = await fetch("/api/youtube/generate-recipe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: extractData.title,
          description: extractData.description,
          transcript: extractData.transcript,
          videoUrl: extractData.videoUrl,
          imageUrl: extractData.imageUrl,
          author: extractData.author || config.name,
        }),
      });

      if (!recipeRes.ok) {
        const data = await recipeRes.json();
        throw new Error(data.error || "Erreur lors de la génération de la recette");
      }

      const recipeData = await recipeRes.json();
      onRecipeGenerated(recipeData.recipe);
      
      setVideoUrl("");
      onClose();
      setError(null);
    } catch (err) {
      console.error("Erreur:", err);
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`p-4 rounded-lg border ${config.bgColor} border-stone-200 dark:border-stone-700`}>
      <div className="flex items-center gap-2 mb-3">
        <Icon className={`h-5 w-5 ${config.color}`} />
        <h3 className="font-medium text-stone-900 dark:text-stone-100">
          Importer depuis {config.name}
        </h3>
      </div>
      
      <div className="flex gap-2">
        <Input
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          placeholder={config.placeholder}
          className="flex-1 h-10 bg-white dark:bg-stone-700 border-stone-200 dark:border-stone-600 text-sm"
          disabled={isLoading}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !isLoading) {
              handleImport();
            }
          }}
        />
        <Button
          onClick={handleImport}
          disabled={isLoading}
          className={`h-10 px-4 ${config.color} ${config.bgColor} hover:opacity-80`}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Import...
            </>
          ) : (
            "Importer"
          )}
        </Button>
      </div>

      {error && (
        <div className="mt-3 p-3 rounded-lg bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}
    </div>
  );
}
