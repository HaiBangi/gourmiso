import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function RecipeCardSkeleton() {
  return (
    <Card className="overflow-hidden border-0 bg-gradient-to-br from-white to-stone-50 dark:from-stone-900 dark:to-stone-950">
      <Skeleton className="aspect-[3/2] sm:aspect-[4/3] rounded-none" />
      <div className="p-2.5 sm:p-4">
        <Skeleton className="h-4 sm:h-6 w-3/4" />
        <Skeleton className="h-3 sm:h-4 w-1/3 mt-1 sm:mt-2" />
        <div className="flex gap-2 sm:gap-4 mt-2 sm:mt-3">
          <Skeleton className="h-3 sm:h-4 w-14 sm:w-20" />
          <Skeleton className="h-3 sm:h-4 w-14 sm:w-20" />
        </div>
      </div>
    </Card>
  );
}

export function RecipeListSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-6 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {Array.from({ length: 10 }).map((_, i) => (
        <RecipeCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function RecipeDetailSkeleton() {
  return (
    <div className="min-h-screen">
      {/* Hero Skeleton */}
      <Skeleton className="h-[30vh] sm:h-[40vh] min-h-[200px] sm:min-h-[300px] max-h-[500px] w-full rounded-none" />

      {/* Content Skeleton */}
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-6 sm:py-10">
        {/* Stats Bar Skeleton */}
        <div className="flex flex-wrap gap-4 sm:gap-6 mb-6 sm:mb-10 p-4 sm:p-6 rounded-2xl bg-stone-100 dark:bg-stone-900">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2 sm:gap-3">
              <Skeleton className="h-8 w-8 sm:h-10 sm:w-10 rounded-full" />
              <div>
                <Skeleton className="h-2 sm:h-3 w-12 sm:w-16 mb-1" />
                <Skeleton className="h-4 sm:h-5 w-10 sm:w-12" />
              </div>
            </div>
          ))}
        </div>

        {/* Description Skeleton */}
        <Skeleton className="h-5 sm:h-6 w-full mb-2" />
        <Skeleton className="h-5 sm:h-6 w-3/4 mb-6 sm:mb-10" />

        <div className="grid gap-6 sm:gap-8 md:grid-cols-5">
          {/* Ingredients Skeleton */}
          <Card className="md:col-span-2 border-0">
            <CardHeader>
              <Skeleton className="h-5 sm:h-6 w-24 sm:w-32" />
            </CardHeader>
            <CardContent className="space-y-2 sm:space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-3 sm:h-4 w-full" />
              ))}
            </CardContent>
          </Card>

          {/* Steps Skeleton */}
          <Card className="md:col-span-3 border-0">
            <CardHeader>
              <Skeleton className="h-5 sm:h-6 w-24 sm:w-32" />
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex gap-3 sm:gap-4">
                  <Skeleton className="h-6 w-6 sm:h-8 sm:w-8 rounded-full flex-shrink-0" />
                  <div className="flex-1">
                    <Skeleton className="h-3 sm:h-4 w-full mb-1 sm:mb-2" />
                    <Skeleton className="h-3 sm:h-4 w-3/4" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
