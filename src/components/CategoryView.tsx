'use client';
import { useEffect, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { Plus, LogOut, LayoutGrid, Map } from 'lucide-react';
import { createClient } from '@/lib/supabase-client';
import TabNav from './TabNav';
import ItemCard from './ItemCard';
import AddItemModal from './AddItemModal';
import ItemDetail from './ItemDetail';
import StatsBar from './StatsBar';
import type { Category, Item } from '@/lib/types';

const MapView = dynamic(() => import('./MapView'), { ssr: false });

const titleMap: Record<Category, string> = {
  cafe: 'Cafés',
  place: 'Places',
  product: 'Products',
};

export default function CategoryView({ category }: { category: Category }) {
  const supabase = createClient();
  const [items, setItems] = useState<Item[]>([]);
  const [filter, setFilter] = useState<'all' | 'todo' | 'done'>('all');
  const [view, setView] = useState<'grid' | 'map'>('grid');
  const [showAdd, setShowAdd] = useState(false);
  const [selected, setSelected] = useState<Item | null>(null);

  const showMapToggle = category === 'cafe' || category === 'place';

  const load = useCallback(async () => {
    const { data } = await supabase
      .from('items')
      .select('*')
      .eq('category', category)
      .order('created_at', { ascending: false });
    setItems((data as Item[]) ?? []);
  }, [category, supabase]);

  useEffect(() => { load(); }, [load]);

  const logout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  const filtered = items.filter((i) =>
    filter === 'all' ? true : filter === 'done' ? i.visited : !i.visited
  );
  const doneCount = items.filter((i) => i.visited).length;

  return (
    <div className="max-w-md mx-auto pb-20">
      <header className="px-4 pt-5 pb-3 flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold">{titleMap[category]}</h1>
          <p className="text-xs text-stone-500 mt-0.5">
            {items.length - doneCount} to do · {doneCount} done
          </p>
        </div>
        <div className="flex gap-2">
          {showMapToggle && (
            <button
              onClick={() => setView((v) => (v === 'grid' ? 'map' : 'grid'))}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition ${
                view === 'map'
                  ? 'bg-stone-900 text-white'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
              title={view === 'grid' ? 'Show map' : 'Show grid'}
            >
              {view === 'grid' ? <Map size={18} /> : <LayoutGrid size={18} />}
            </button>
          )}
          <button
            onClick={() => setShowAdd(true)}
            className="w-10 h-10 rounded-full bg-stone-900 text-white flex items-center justify-center"
          >
            <Plus size={20} />
          </button>
          <button
            onClick={logout}
            className="w-10 h-10 rounded-full bg-stone-100 text-stone-600 flex items-center justify-center"
          >
            <LogOut size={16} />
          </button>
        </div>
      </header>

      <TabNav />

      <StatsBar items={items} />

      <div className="flex gap-1.5 px-4 py-3 overflow-x-auto">
        {(['all', 'todo', 'done'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 rounded-full text-xs whitespace-nowrap border ${
              filter === f
                ? 'bg-stone-900 text-white border-stone-900'
                : 'bg-white text-stone-600 border-stone-200'
            }`}
          >
            {f === 'all' ? 'All' : f === 'todo' ? 'To do' : 'Done'}
          </button>
        ))}
      </div>

      {view === 'map' && showMapToggle ? (
        <MapView items={filtered} onSelect={setSelected} />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-2 px-4">
            {filtered.map((item) => (
              <ItemCard key={item.id} item={item} onClick={() => setSelected(item)} />
            ))}
          </div>
          {filtered.length === 0 && (
            <div className="text-center py-16 text-stone-400 text-sm">
              Nothing here yet. Tap + to add your first one.
            </div>
          )}
        </>
      )}

      {showAdd && (
        <AddItemModal
          category={category}
          onClose={() => setShowAdd(false)}
          onAdded={load}
        />
      )}

      {selected && (
        <ItemDetail item={selected} onClose={() => setSelected(null)} onChanged={load} />
      )}
    </div>
  );
}
