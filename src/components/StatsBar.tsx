'use client';
import type { Item } from '@/lib/types';

export default function StatsBar({ items }: { items: Item[] }) {
  if (items.length === 0) return null;

  const done = items.filter((i) => i.visited).length;
  const total = items.length;
  const pct = Math.round((done / total) * 100);
  const avgRating =
    items.filter((i) => i.rating).length > 0
      ? (items.filter((i) => i.rating).reduce((s, i) => s + i.rating!, 0) /
          items.filter((i) => i.rating).length).toFixed(1)
      : null;

  return (
    <div className="mx-4 mb-3 bg-stone-50 rounded-xl p-3 space-y-2">
      <div className="flex items-center justify-between text-xs text-stone-500">
        <span>{done} / {total} done</span>
        <span className="font-medium text-stone-700">{pct}%</span>
      </div>
      <div className="h-1.5 bg-stone-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-emerald-500 rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      {avgRating && (
        <p className="text-xs text-stone-400">
          avg rating <span className="text-stone-600 font-medium">★ {avgRating}</span>
        </p>
      )}
    </div>
  );
}
