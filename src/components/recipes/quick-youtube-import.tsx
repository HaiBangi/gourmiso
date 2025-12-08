"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Youtube, Loader2 } from "lucide-react";

interface QuickYouTubeImportProps {
  onRecipeGenerated: (recipe: any) => void;
}

export function QuickYouTubeImport({ onRecipeGenerated }: QuickYouTubeImportProps) {
  const [showInput, setShowInput] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImport = async () => {
    if (!youtubeUrl.trim()) {
      setError("Veuillez entrer un lien YouTube");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Validation stricte du format d'URL YouTube
      const standardUrlMatch = youtubeUrl.match(
        /^https?:\/\/(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})(?:&.*)?$/
      );

      if (!standardUrlMatch) {
        throw new Error("Format d'URL invalide. Utilisez le format : https://www.youtube.com/watch?v=VIDEO_ID");
      }

      const videoId = standardUrlMatch[1];

      // Fonction pour récupérer la transcription avec retry
      const fetchTranscriptWithRetry = async (retries = 2): Promise<any> => {
        for (let attempt = 0; attempt <= retries; attempt++) {
          try {
            const transcriptRes = await fetch("/api/youtube/transcript", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ videoId }),
            });

            if (!transcriptRes.ok) {
              const data = await transcriptRes.json();
              throw new Error(data.error || "Erreur lors de la récupération de la transcription");
            }

            return await transcriptRes.json();
          } catch (err) {
            if (attempt < retries) {
              // Attendre 1 seconde avant de réessayer
              await new Promise(resolve => setTimeout(resolve, 1000));
              console.log(`Tentative ${attempt + 2}/${retries + 1}...`);
            } else {
              throw err;
            }
          }
        }
      };

      const transcriptData = await fetchTranscriptWithRetry();

      // Utiliser la meilleure qualité de thumbnail YouTube
      const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

      const recipeRes = await fetch("/api/youtube/generate-recipe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: transcriptData.title,
          description: transcriptData.description,
          transcript: transcriptData.transcript,
          videoUrl: youtubeUrl,
          imageUrl: thumbnailUrl,
        }),
      });

      if (!recipeRes.ok) {
        const data = await recipeRes.json();
        throw new Error(data.error || "Erreur lors de la génération de la recette");
      }

      const recipeData = await recipeRes.json();

      onRecipeGenerated(recipeData.recipe);
      
      setYoutubeUrl("");
      setShowInput(false);
      setError(null);
    } catch (err) {
      console.error("Erreur:", err);
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  };

  if (showInput) {
    return (
      <div className="flex-1 flex flex-col gap-2">
        <div className="flex gap-2 items-start">
          <Input
            type="url"
            placeholder="https://www.youtube.com/watch?v=..."
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !isLoading) {
                handleImport();
              }
              if (e.key === "Escape") {
                setShowInput(false);
                setYoutubeUrl("");
                setError(null);
              }
            }}
            className={`h-10 flex-1 min-w-0 ${error ? 'border-red-500 dark:border-red-500' : ''}`}
            disabled={isLoading}
            autoFocus
          />
          <Button
            onClick={handleImport}
            disabled={!youtubeUrl.trim() || isLoading}
            className="bg-red-600 hover:bg-red-700 text-white h-10 flex-shrink-0 px-3 sm:px-4"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="hidden sm:inline sm:ml-2">Import...</span>
              </>
            ) : (
              <>
                <Youtube className="h-4 w-4" />
                <span className="hidden sm:inline sm:ml-2">Importer</span>
              </>
            )}
          </Button>
        </div>
        {error && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex-shrink-0 mt-0.5">
              <svg className="h-5 w-5 text-red-600 dark:text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-red-800 dark:text-red-200">
                {error}
              </p>
            </div>
            <button
              onClick={() => setError(null)}
              className="flex-shrink-0 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200 transition-colors"
            >
              <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <Button
      onClick={() => setShowInput(true)}
      variant="outline"
      className="gap-2 bg-white dark:bg-stone-900 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-950/20 h-10"
    >
      <Youtube className="h-4 w-4" />
      <span className="hidden sm:inline">Import YouTube</span>
    </Button>
  );
}
