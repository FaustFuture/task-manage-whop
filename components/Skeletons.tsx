// Skeleton components that match the actual content being loaded

// Board card skeleton - matches BoardList board cards
export function BoardSkeleton() {
  return (
    <div className="group p-6 bg-zinc-800 rounded-lg border border-zinc-700 animate-pulse">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-zinc-700 rounded-lg">
          <div className="w-6 h-6 bg-zinc-600 rounded" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="h-5 bg-zinc-700 rounded w-3/4 mb-2" />
          <div className="h-4 bg-zinc-700 rounded w-1/2" />
        </div>
      </div>
    </div>
  );
}

// List skeleton - matches List component structure
export function ListSkeleton() {
  return (
    <div className="flex-shrink-0 w-72 bg-zinc-800 rounded-lg p-4 flex flex-col animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="h-5 bg-zinc-700 rounded w-24" />
        <div className="w-4 h-4 bg-zinc-700 rounded" />
      </div>

      {/* Add card button skeleton */}
      <div className="h-10 bg-zinc-700 rounded-lg mb-3" />

      {/* Card skeletons */}
      <div className="space-y-2">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    </div>
  );
}

// Card skeleton - matches CardItem structure
export function CardSkeleton() {
  return (
    <div className="bg-zinc-900 p-3 rounded-lg border border-zinc-700 animate-pulse">
      {/* Title */}
      <div className="h-5 bg-zinc-800 rounded w-3/4 mb-2" />

      {/* Description */}
      <div className="h-4 bg-zinc-800 rounded w-full mb-1" />
      <div className="h-4 bg-zinc-800 rounded w-5/6 mb-2" />

      {/* Footer with subtask count and avatars */}
      <div className="flex items-center justify-between">
        <div className="h-4 bg-zinc-800 rounded w-12" />
        <div className="flex -space-x-2">
          <div className="w-6 h-6 rounded-full bg-zinc-800" />
          <div className="w-6 h-6 rounded-full bg-zinc-800" />
        </div>
      </div>
    </div>
  );
}

// Subtask skeleton - matches CardModal subtask items
export function SubtaskSkeleton() {
  return (
    <div className="flex items-center gap-3 p-3 bg-zinc-800 rounded-lg animate-pulse">
      {/* Checkbox */}
      <div className="flex-shrink-0 w-5 h-5 rounded border-2 border-zinc-600 bg-zinc-700" />

      {/* Text */}
      <div className="flex-1 h-4 bg-zinc-700 rounded" />

      {/* Delete button placeholder */}
      <div className="w-4 h-4 bg-zinc-700 rounded" />
    </div>
  );
}
