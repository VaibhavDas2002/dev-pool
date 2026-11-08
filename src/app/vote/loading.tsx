import { Skeleton } from "@/components/ui/skeleton";

export default function VoteLoading() {
  return (
    <div className="max-w-5xl mx-auto py-10 px-4 sm:px-6 lg:px-8 space-y-6 animate-in fade-in duration-300">
      <Skeleton className="h-6 w-36 rounded-lg" />
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <Skeleton className="h-14 w-72 rounded-2xl" />
        <Skeleton className="h-14 w-44 rounded-2xl" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-5 space-y-4">
          <Skeleton className="h-72 w-full rounded-3xl" />
        </div>
        <div className="lg:col-span-7 space-y-4">
          <Skeleton className="h-96 w-full rounded-3xl" />
        </div>
      </div>
    </div>
  );
}

