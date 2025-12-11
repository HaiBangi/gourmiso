/**
 * Cache simple en mémoire pour les appels API externes
 * Utile pour les tests et éviter les appels répétés
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

class SimpleCache {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private defaultTTL = 1000 * 60 * 60; // 1 heure par défaut

  /**
   * Récupère une valeur du cache
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Vérifier si l'entrée a expiré
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    console.log(`[Cache] ✅ HIT: ${key}`);
    return entry.data as T;
  }

  /**
   * Stocke une valeur dans le cache
   */
  set<T>(key: string, data: T, ttl?: number): void {
    const expiresAt = Date.now() + (ttl || this.defaultTTL);
    
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiresAt,
    });

    console.log(`[Cache] 💾 SET: ${key} (expire dans ${Math.round((ttl || this.defaultTTL) / 1000 / 60)}min)`);
  }

  /**
   * Supprime une entrée du cache
   */
  delete(key: string): void {
    this.cache.delete(key);
    console.log(`[Cache] 🗑️ DELETE: ${key}`);
  }

  /**
   * Vide tout le cache
   */
  clear(): void {
    const size = this.cache.size;
    this.cache.clear();
    console.log(`[Cache] 🧹 CLEAR: ${size} entrées supprimées`);
  }

  /**
   * Récupère des statistiques sur le cache
   */
  stats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}

// Instance singleton du cache
export const cache = new SimpleCache();

// Helpers pour créer des clés de cache
export const cacheKeys = {
  youtubeTranscript: (videoId: string) => `youtube:transcript:${videoId}`,
  youtubeInfo: (videoId: string) => `youtube:info:${videoId}`,
  tiktokVideo: (videoUrl: string) => `tiktok:video:${videoUrl}`, // TikTok cache key
  chatgptRecipe: (content: string) => `chatgpt:recipe:${content.substring(0, 100)}`,
};
