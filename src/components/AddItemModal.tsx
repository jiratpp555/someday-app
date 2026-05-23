'use client';
import { useState } from 'react';
import { X, Sparkles, Loader2, MapPin, CheckCircle2 } from 'lucide-react';
import { createClient } from '@/lib/supabase-client';
import type { Category } from '@/lib/types';

export default function AddItemModal({
  category,
  onClose,
  onAdded,
}: {
  category: Category;
  onClose: () => void;
  onAdded: () => void;
}) {
  const supabase = createClient();
  const [autoUrl, setAutoUrl] = useState('');
  const [fetching, setFetching] = useState(false);
  const [fetchError, setFetchError] = useState('');
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [note, setNote] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [externalUrl, setExternalUrl] = useState('');
  const [price, setPrice] = useState('');
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [geocoding, setGeocoding] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAutoFill = async () => {
    if (!autoUrl.trim()) return;
    setFetching(true);
    setFetchError('');
    try {
      const res = await fetch(`/api/og?url=${encodeURIComponent(autoUrl.trim())}`);
      const data = await res.json();
      if (data.error) { setFetchError('ดึงข้อมูลไม่ได้ ลองใส่เอง'); return; }
      if (data.title && !title) setTitle(data.title);
      if (data.image && !imageUrl) setImageUrl(data.image);
      if (!externalUrl) setExternalUrl(data.url ?? autoUrl.trim());
      if (data.description && !note) setNote(data.description);
    } catch {
      setFetchError('ดึงข้อมูลไม่ได้ ลองใส่เอง');
    } finally {
      setFetching(false);
    }
  };

  const handleGeocode = async () => {
    const query = [title, subtitle].filter(Boolean).join(', ');
    if (!query) return;
    setGeocoding(true);
    try {
      const res = await fetch(`/api/geocode?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (data.lat) { setLat(data.lat); setLng(data.lng); }
    } finally {
      setGeocoding(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from('items').insert({
      user_id: user.id,
      category,
      title,
      subtitle: subtitle || null,
      note: note || null,
      image_url: imageUrl || null,
      external_url: externalUrl || null,
      price: category === 'product' && price ? Number(price) : null,
      lat: lat ?? null,
      lng: lng ?? null,
    });
    setLoading(false);
    onAdded();
    onClose();
  };

  const subtitlePlaceholder = {
    cafe: 'Location (e.g. Thonglor)',
    place: 'Country or region',
    product: 'Brand or store',
  }[category];

  const showMap = category === 'cafe' || category === 'place';

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-stone-100">
          <h2 className="font-semibold">Add new</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-stone-100">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-3">
          {/* Auto-fill from URL */}
          <div className="flex gap-2">
            <input
              placeholder="Paste a link to auto-fill…"
              value={autoUrl}
              onChange={(e) => setAutoUrl(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAutoFill(); } }}
              className="flex-1 px-3 py-2.5 rounded-lg border border-stone-200 text-sm focus:outline-none focus:border-stone-400"
            />
            <button
              type="button"
              onClick={handleAutoFill}
              disabled={fetching || !autoUrl.trim()}
              className="px-3 py-2.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 disabled:opacity-40 flex items-center gap-1.5 text-sm font-medium shrink-0"
            >
              {fetching ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />}
              Fill
            </button>
          </div>
          {fetchError && <p className="text-xs text-red-500 -mt-1">{fetchError}</p>}

          <div className="border-t border-stone-100 pt-1" />

          <input
            placeholder="Name"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            autoFocus
            className="w-full px-3 py-2.5 rounded-lg border border-stone-200 text-sm focus:outline-none focus:border-stone-400"
          />

          {/* Subtitle + geocode button for cafe/place */}
          <div className="flex gap-2">
            <input
              placeholder={subtitlePlaceholder}
              value={subtitle}
              onChange={(e) => { setSubtitle(e.target.value); setLat(null); setLng(null); }}
              className="flex-1 px-3 py-2.5 rounded-lg border border-stone-200 text-sm focus:outline-none focus:border-stone-400"
            />
            {showMap && (
              <button
                type="button"
                onClick={handleGeocode}
                disabled={geocoding || (!title && !subtitle)}
                title="Find on map"
                className={`px-3 py-2.5 rounded-lg flex items-center gap-1 text-sm shrink-0 ${
                  lat ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-stone-100 hover:bg-stone-200 text-stone-600'
                } disabled:opacity-40`}
              >
                {geocoding ? <Loader2 size={15} className="animate-spin" /> : lat ? <CheckCircle2 size={15} /> : <MapPin size={15} />}
                {lat ? 'Pinned' : 'Pin'}
              </button>
            )}
          </div>

          <input
            placeholder="Image URL (optional)"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg border border-stone-200 text-sm focus:outline-none focus:border-stone-400"
          />
          {category === 'product' && (
            <input
              type="number"
              placeholder="Price (THB)"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-stone-200 text-sm focus:outline-none focus:border-stone-400"
            />
          )}
          <input
            placeholder="Link (Google Maps, store, etc.)"
            value={externalUrl}
            onChange={(e) => setExternalUrl(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg border border-stone-200 text-sm focus:outline-none focus:border-stone-400"
          />
          <textarea
            placeholder="Note (optional)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            className="w-full px-3 py-2.5 rounded-lg border border-stone-200 text-sm resize-none focus:outline-none focus:border-stone-400"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg bg-stone-900 text-white text-sm font-medium disabled:opacity-50"
          >
            {loading ? 'Saving…' : 'Save'}
          </button>
        </form>
      </div>
    </div>
  );
}
