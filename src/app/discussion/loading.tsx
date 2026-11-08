import { Skeleton } from "@/components/ui/skeleton";

export default function DiscussionLoading() {
  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-4 animate-in fade-in duration-300">
      <div className="flex justify-between items-center">
        <Skeleton className="h-6 w-36 rounded-lg" />
        <Skeleton className="h-6 w-48 rounded-lg" />
      </div>
      <Skeleton className="h-[600px] w-full rounded-3xl" />
    </div>
  );
}

