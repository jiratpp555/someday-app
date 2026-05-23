'use client';
import { Coffee, MapPin, ShoppingBag, Check, Star } from 'lucide-react';
import type { Item, Category } from '@/lib/types';

const iconMap = { cafe: Coffee, place: MapPin, product: ShoppingBag };
const gradientMap: Record<Category, string> = {
  cafe: 'from-amber-700 to-stone-800',
  place: 'from-sky-500 to-blue-700',
  product: 'from-rose-400 to-pink-600',
};

export default function ItemCard({ item, onClick }: { item: Item; onClick: () => void }) {
  const Icon = iconMap[item.category];
  return (
    <button
      onClick={onClick}
      className="text-left bg-stone-50 rounded-xl overflow-hidden hover:shadow-md transition group"
    >
      <div
        className={`relative aspect-square ${
          item.image_url ? '' : `bg-gradient-to-br ${gradientMap[item.category]}`
        }`}
      >
        {item.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Icon className="text-white/40" size={40} />
          </div>
        )}
        {item.visited && (
          <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center">
            <Check size={14} strokeWidth={3} />
          </div>
        )}
        {item.visited && item.rating && (
          <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-0.5 rounded flex items-center gap-1">
            <Star size={10} fill="white" strokeWidth={0} />
            {item.rating}.0
          </div>
        )}
        {item.category === 'product' && item.price && (
          <div className="absolute bottom-2 right-2 bg-white/90 text-stone-900 text-xs font-medium px-2 py-1 rounded">
            ฿{item.price.toLocaleString()}
          </div>
        )}
      </div>
      <div className="p-2.5">
        <p className="font-medium text-sm truncate">{item.title}</p>
        {item.subtitle && (
          <p className="text-xs text-stone-500 truncate mt-0.5">{item.subtitle}</p>
        )}
      </div>
    </button>
  );
}
