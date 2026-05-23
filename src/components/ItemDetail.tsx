'use client';
import { useState } from 'react';
import { ArrowLeft, Check, Star, Trash2, ExternalLink } from 'lucide-react';
import { createClient } from '@/lib/supabase-client';
import type { Item } from '@/lib/types';

export default function ItemDetail({
  item,
  onClose,
  onChanged,
}: {
  item: Item;
  onClose: () => void;
  onChanged: () => void;
}) {
  const supabase = createClient();
  const [rating, setRating] = useState(item.rating ?? 0);

  const markVisited = async () => {
    await supabase
      .from('items')
      .update({
        visited: !item.visited,
        visited_at: !item.visited ? new Date().toISOString() : null,
        rating: !item.visited && rating ? rating : null,
      })
      .eq('id', item.id);
    onChanged();
    onClose();
  };

  const updateRating = async (newRating: number) => {
    setRating(newRating);
    await supabase.from('items').update({ rating: newRating }).eq('id', item.id);
    onChanged();
  };

  const deleteItem = async () => {
    if (!confirm('Delete this item?')) return;
    await supabase.from('items').delete().eq('id', item.id);
    onChanged();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
      <div className="max-w-md mx-auto">
        <div className={`relative aspect-[4/3] ${item.image_url ? '' : 'bg-gradient-to-br from-amber-700 to-stone-800'}`}>
          {item.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
          ) : null}
          <button
            onClick={onClose}
            className="absolute top-3 left-3 w-9 h-9 rounded-full bg-black/50 text-white flex items-center justify-center backdrop-blur"
          >
            <ArrowLeft size={18} />
          </button>
          <button
            onClick={deleteItem}
            className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/50 text-white flex items-center justify-center backdrop-blur"
          >
            <Trash2 size={16} />
          </button>
        </div>

        <div className="p-5">
          <h1 className="text-2xl font-semibold">{item.title}</h1>
          {item.subtitle && <p className="text-stone-500 mt-1">{item.subtitle}</p>}

          {item.category === 'product' && item.price && (
            <p className="text-lg font-medium mt-3">฿{item.price.toLocaleString()}</p>
          )}

          {item.note && (
            <div className="mt-5">
              <p className="text-xs uppercase tracking-wide text-stone-400 mb-2">Note</p>
              <p className="text-sm bg-stone-50 p-3 rounded-lg whitespace-pre-wrap">{item.note}</p>
            </div>
          )}

          {item.external_url && (
            <a
              href={item.external_url}
              target="_blank"
              rel="noopener"
              className="inline-flex items-center gap-2 mt-4 text-sm text-stone-700 underline"
            >
              <ExternalLink size={14} />
              Open link
            </a>
          )}

          {item.visited && (
            <div className="mt-5">
              <p className="text-xs uppercase tracking-wide text-stone-400 mb-2">My rating</p>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button key={n} onClick={() => updateRating(n)}>
                    <Star
                      size={28}
                      fill={n <= rating ? '#f59e0b' : 'none'}
                      stroke={n <= rating ? '#f59e0b' : '#a8a29e'}
                    />
                  </button>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={markVisited}
            className={`w-full mt-6 py-3 rounded-lg font-medium text-sm flex items-center justify-center gap-2 ${
              item.visited
                ? 'bg-stone-100 text-stone-700'
                : 'bg-stone-900 text-white'
            }`}
          >
            <Check size={16} />
            {item.visited ? 'Mark as not done' : 'Mark as done'}
          </button>
        </div>
      </div>
    </div>
  );
}
