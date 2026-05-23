'use client';
import { useEffect, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Plus, LogOut, LayoutGrid, Map, Coffee, MapPin, ShoppingBag } from 'lucide-react';
import { createClient } from '@/lib/supabase-client';
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

const navItems = [
  { href: '/cafe', label: 'Cafés', icon: Coffee },
  { href: '/place', label: 'Places', icon: MapPin },
  { href: '/product', label: 'Products', icon: ShoppingBag },
];

export default function CategoryView({ category }: { category: Category }) {
  const supabase = createClient();
  const pathname = usePathname();
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
    <div className="min-h-screen bg-[#fafaf9] md:flex">

      {/* ── DESKTOP SIDEBAR ── */}
      <aside className="hidden md:flex flex-col w-56 lg:w-64 border-r border-stone-100 fixed inset-y-0 bg-white z-10">
        <div className="px-5 pt-6 pb-5">
          <p className="text-lg font-semibold tracking-tight">Someday</p>
          <p className="text-xs text-stone-400 mt-0.5">Your wishlist</p>
        </div>
        <nav className="px-3 space-y-0.5 flex-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? 'bg-stone-100 text-stone-900'
                    : 'text-stone-500 hover:text-stone-800 hover:bg-stone-50'
                }`}
              >
                <Icon size={17} />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-stone-100">
          <button
            onClick={logout}
            className="flex items-center gap-2 text-sm text-stone-500 hover:text-stone-800 px-3 py-2 w-full rounded-lg hover:bg-stone-50 transition-colors"
          >
            <LogOut size={15} />
            Sign out
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <main className="flex-1 md:ml-56 lg:ml-64 pb-6">

        {/* Mobile header */}
        <header className="md:hidden px-4 pt-5 pb-3 flex items-start justify-between">
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
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                  view === 'map' ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-600'
                }`}
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

        {/* Mobile tab nav */}
        <nav className="md:hidden flex gap-1 px-4 pb-2">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                  active ? 'bg-stone-100 text-stone-900' : 'text-stone-500'
                }`}
              >
                <Icon size={16} />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Desktop header */}
        <header className="hidden md:flex items-center justify-between px-6 lg:px-8 pt-7 pb-4">
          <div>
            <h1 className="text-2xl font-semibold">{titleMap[category]}</h1>
            <p className="text-sm text-stone-500 mt-0.5">
              {items.length - doneCount} to do · {doneCount} done
            </p>
          </div>
          <div className="flex gap-2">
            {showMapToggle && (
              <button
                onClick={() => setView((v) => (v === 'grid' ? 'map' : 'grid'))}
                className={`h-10 px-4 rounded-full flex items-center gap-2 text-sm font-medium transition-colors ${
                  view === 'map' ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                {view === 'grid' ? <Map size={16} /> : <LayoutGrid size={16} />}
                {view === 'grid' ? 'Map' : 'Grid'}
              </button>
            )}
            <button
              onClick={() => setShowAdd(true)}
              className="h-10 px-4 rounded-full bg-stone-900 text-white flex items-center gap-2 text-sm font-medium hover:bg-stone-800 transition-colors"
            >
              <Plus size={16} />
              Add
            </button>
          </div>
        </header>

        {/* Stats bar */}
        <div className="px-4 md:px-6 lg:px-8">
          <StatsBar items={items} />
        </div>

        {/* Filter chips */}
        <div className="flex gap-1.5 px-4 md:px-6 lg:px-8 py-2 overflow-x-auto">
          {(['all', 'todo', 'done'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-full text-xs whitespace-nowrap border transition-colors ${
                filter === f
                  ? 'bg-stone-900 text-white border-stone-900'
                  : 'bg-white text-stone-600 border-stone-200 hover:border-stone-400'
              }`}
            >
              {f === 'all' ? 'All' : f === 'todo' ? 'To do' : 'Done'}
            </button>
          ))}
        </div>

        {/* Grid or Map */}
        {view === 'map' && showMapToggle ? (
          <div className="px-4 md:px-6 lg:px-8 pt-2">
            <MapView items={filtered} onSelect={setSelected} />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5 px-4 md:px-6 lg:px-8 pt-2">
              {filtered.map((item) => (
                <ItemCard key={item.id} item={item} onClick={() => setSelected(item)} />
              ))}
            </div>
            {filtered.length === 0 && (
              <div className="text-center py-20 text-stone-400 text-sm">
                Nothing here yet. {' '}
                <button onClick={() => setShowAdd(true)} className="underline text-stone-500">
                  Add your first one
                </button>
              </div>
            )}
          </>
        )}
      </main>

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
