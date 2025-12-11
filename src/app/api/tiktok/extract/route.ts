import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { cache, cacheKeys } from "@/lib/cache";
async function getTikTokVideoInfo(videoUrl: string): Promise<{ 
  title: string; 
  description: string; 
  author: string;
  thumbnail: string;
}> {
  const cacheKey = cacheKeys.tiktokVideo(videoUrl);
  const cached = cache.get<{ title: string; description: string; author: string; thumbnail: string }>(cacheKey);
  if (cached) {
    console.log('TikTok Cache hit pour ' + videoUrl);
    return cached;
  }
  try {
    console.log('TikTok Extraction des metadonnees pour ' + videoUrl);
    const apiUrl = 'https://www.tikwm.com/api/?url=' + encodeURIComponent(videoUrl);
    const response = await fetch(apiUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });
    if (!response.ok) {
      throw new Error('Echec de recuperation: ' + response.status);
    }
    const data = await response.json();
    if (data.code !== 0 || !data.data) {
      throw new Error("Video TikTok introuvable ou inaccessible");
    }
    const videoData = data.data;
    const result = {
      title: videoData.title || "Video TikTok",
      description: videoData.title || "",
      author: videoData.author?.unique_id || videoData.author?.nickname || "TikTok",
      thumbnail: videoData.cover || videoData.origin_cover || "",
    };
    console.log('TikTok Metadonnees extraites: ' + result.author + ' - ' + result.title);
    // cache.set(cacheKey, result, 1000 * 60 * 60 * 24);
    return result;
  } catch (error) {
    console.error("[TikTok] Erreur:", error);
    throw new Error(
      'Erreur lors de extraction TikTok: ' + (error instanceof Error ? error.message : "Inconnue")
    );
  }
}
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Non authentifie" },
        { status: 401 }
      );
    }
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });
    if (!user || (user.role !== "ADMIN" && user.role !== "OWNER")) {
      return NextResponse.json(
        { error: "Acces refuse" },
        { status: 403 }
      );
    }
    const { videoUrl } = await request.json();
    if (!videoUrl) {
      return NextResponse.json(
        { error: "videoUrl est requis" },
        { status: 400 }
      );
    }
    if (!videoUrl.includes('tiktok.com')) {
      return NextResponse.json(
        { error: "URL TikTok invalide" },
        { status: 400 }
      );
    }
    console.log('API TikTok Traitement de ' + videoUrl);
    const videoInfo = await getTikTokVideoInfo(videoUrl);
    return NextResponse.json({
      title: videoInfo.title,
      description: videoInfo.description,
      author: videoInfo.author,
      thumbnail: videoInfo.thumbnail,
    });
  } catch (error) {
    console.error("[API TikTok] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Une erreur est survenue" },
      { status: 500 }
    );
  }
}