import { Skeleton } from "@/components/ui/skeleton";

export default function ResultsLoading() {
  return (
    <div className="max-w-5xl mx-auto py-10 px-4 sm:px-6 lg:px-8 space-y-6 animate-in fade-in duration-300">
      <Skeleton className="h-6 w-36 rounded-lg" />
      <Skeleton className="h-10 w-64 rounded-xl" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Skeleton className="h-24 rounded-2xl" />
        <Skeleton className="h-24 rounded-2xl" />
        <Skeleton className="h-24 rounded-2xl" />
        <Skeleton className="h-24 rounded-2xl" />
      </div>
      <Skeleton className="h-80 w-full rounded-3xl" />
    </div>
  );
}

