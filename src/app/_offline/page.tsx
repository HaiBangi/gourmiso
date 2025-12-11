import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mode Hors Ligne - Yumiso",
  description: "Vous êtes actuellement hors ligne",
};

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-stone-50 to-stone-100 dark:from-stone-900 dark:to-stone-950 px-4">
      <div className="max-w-md w-full text-center space-y-8">
        {/* Icon */}
        <div className="relative mx-auto w-32 h-32">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full opacity-20 animate-pulse"></div>
          <div className="relative bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full w-32 h-32 flex items-center justify-center shadow-2xl">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414"
              />
            </svg>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-4">
          <h1 className="text-3xl font-bold text-stone-900 dark:text-stone-100 font-serif">
            Mode Hors Ligne
          </h1>
          <p className="text-stone-600 dark:text-stone-400 text-lg">
            Vous n&apos;êtes pas connecté à Internet
          </p>
          <p className="text-stone-500 dark:text-stone-500 text-sm">
            Certaines fonctionnalités peuvent être limitées. Vos recettes favorites restent accessibles.
          </p>
        </div>

        {/* Action Button */}
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white rounded-lg font-medium shadow-lg transition-all transform hover:scale-105"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Réessayer
        </button>

        {/* Info */}
        <div className="pt-8 border-t border-stone-200 dark:border-stone-700">
          <p className="text-xs text-stone-400 dark:text-stone-600">
            💡 Conseil : Ajoutez Yumiso à votre écran d&apos;accueil pour un accès rapide
          </p>
        </div>
      </div>
    </div>
  );
}
