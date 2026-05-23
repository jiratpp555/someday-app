'use client';
import { useState, useRef } from 'react';
import { ArrowLeft, Check, Star, Trash2, ExternalLink, Pencil, X, Upload, ImageOff } from 'lucide-react';
import { createClient } from '@/lib/supabase-client';
import type { Item, Category } from '@/lib/types';

const BUCKET = 'item-photos';

const gradientMap: Record<Category, string> = {
  cafe: 'from-amber-700 to-stone-800',
  place: 'from-sky-500 to-blue-700',
  product: 'from-rose-400 to-pink-600',
};

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
  const fileInputRef = useRef<HTMLInputElement>(null);

  // View state
  const [rating, setRating] = useState(item.rating ?? 0);

  // Edit state
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(item.title);
  const [subtitle, setSubtitle] = useState(item.subtitle ?? '');
  const [note, setNote] = useState(item.note ?? '');
  const [imageUrl, setImageUrl] = useState(item.image_url ?? '');
  const [externalUrl, setExternalUrl] = useState(item.external_url ?? '');
  const [price, setPrice] = useState(item.price?.toString() ?? '');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const enterEdit = () => {
    setTitle(item.title);
    setSubtitle(item.subtitle ?? '');
    setNote(item.note ?? '');
    setImageUrl(item.image_url ?? '');
    setExternalUrl(item.external_url ?? '');
    setPrice(item.price?.toString() ?? '');
    setEditing(true);
  };

  const cancelEdit = () => setEditing(false);

  const uploadPhoto = async (file: File) => {
    setUploading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setUploading(false); return; }
    const ext = file.name.split('.').pop() ?? 'jpg';
    const path = `${user.id}/${item.id}-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from(BUCKET).upload(path, file, { upsert: true });
    if (!error) {
      const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
      setImageUrl(data.publicUrl);
    }
    setUploading(false);
  };

  const saveEdits = async () => {
    setSaving(true);
    // Clean up old storage photo if URL changed
    if (item.image_url && item.image_url !== imageUrl && item.image_url.includes(`/${BUCKET}/`)) {
      const path = item.image_url.split(`/${BUCKET}/`)[1];
      if (path) await supabase.storage.from(BUCKET).remove([path]);
    }
    await supabase.from('items').update({
      title: title.trim(),
      subtitle: subtitle.trim() || null,
      note: note.trim() || null,
      image_url: imageUrl || null,
      external_url: externalUrl.trim() || null,
      price: item.category === 'product' && price ? Number(price) : null,
    }).eq('id', item.id);
    setSaving(false);
    setEditing(false);
    onChanged();
  };

  const markVisited = async () => {
    await supabase.from('items').update({
      visited: !item.visited,
      visited_at: !item.visited ? new Date().toISOString() : null,
      rating: !item.visited && rating ? rating : null,
    }).eq('id', item.id);
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
    if (item.image_url?.includes(`/${BUCKET}/`)) {
      const path = item.image_url.split(`/${BUCKET}/`)[1];
      if (path) await supabase.storage.from(BUCKET).remove([path]);
    }
    await supabase.from('items').delete().eq('id', item.id);
    onChanged();
    onClose();
  };

  const displayImage = editing ? imageUrl : item.image_url;

  return (
    <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
      <div className="max-w-md mx-auto">

        {/* Image area */}
        <div className={`relative aspect-[4/3] ${displayImage ? '' : `bg-gradient-to-br ${gradientMap[item.category]}`}`}>
          {displayImage
            ? <img src={displayImage} alt={item.title} className="w-full h-full object-cover" /> // eslint-disable-line
            : null}

          {/* Top-left: back / cancel */}
          <button
            onClick={editing ? cancelEdit : onClose}
            className="absolute top-3 left-3 w-9 h-9 rounded-full bg-black/50 text-white flex items-center justify-center backdrop-blur"
          >
            {editing ? <X size={18} /> : <ArrowLeft size={18} />}
          </button>

          {/* Top-right: edit + delete (view mode) */}
          {!editing && (
            <div className="absolute top-3 right-3 flex gap-2">
              <button
                onClick={enterEdit}
                className="w-9 h-9 rounded-full bg-black/50 text-white flex items-center justify-center backdrop-blur"
              >
                <Pencil size={15} />
              </button>
              <button
                onClick={deleteItem}
                className="w-9 h-9 rounded-full bg-black/50 text-white flex items-center justify-center backdrop-blur"
              >
                <Trash2 size={16} />
              </button>
            </div>
          )}

          {/* Bottom photo controls (edit mode) */}
          {editing && (
            <div className="absolute bottom-3 left-3 flex gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadPhoto(f); e.target.value = ''; }}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="px-3 py-1.5 rounded-lg bg-black/60 text-white text-xs backdrop-blur flex items-center gap-1.5 disabled:opacity-50"
              >
                <Upload size={13} />
                {uploading ? 'Uploading…' : 'Upload photo'}
              </button>
              {imageUrl && (
                <button
                  type="button"
                  onClick={() => setImageUrl('')}
                  className="px-3 py-1.5 rounded-lg bg-black/60 text-white text-xs backdrop-blur flex items-center gap-1.5"
                >
                  <ImageOff size={13} />
                  Remove
                </button>
              )}
            </div>
          )}
        </div>

        <div className="p-5 space-y-3">
          {editing ? (
            <>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Name"
                className="w-full px-3 py-2.5 rounded-lg border border-stone-200 text-lg font-semibold focus:outline-none focus:border-stone-400"
              />
              <input
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="Location / Country / Brand"
                className="w-full px-3 py-2.5 rounded-lg border border-stone-200 text-sm focus:outline-none focus:border-stone-400"
              />
              {item.category === 'product' && (
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="Price (THB)"
                  className="w-full px-3 py-2.5 rounded-lg border border-stone-200 text-sm focus:outline-none focus:border-stone-400"
                />
              )}
              <input
                value={externalUrl}
                onChange={(e) => setExternalUrl(e.target.value)}
                placeholder="Link (Google Maps, store, etc.)"
                className="w-full px-3 py-2.5 rounded-lg border border-stone-200 text-sm focus:outline-none focus:border-stone-400"
              />
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Note (optional)"
                rows={3}
                className="w-full px-3 py-2.5 rounded-lg border border-stone-200 text-sm resize-none focus:outline-none focus:border-stone-400"
              />
              <button
                onClick={saveEdits}
                disabled={saving || !title.trim()}
                className="w-full py-3 rounded-lg bg-stone-900 text-white text-sm font-medium disabled:opacity-50"
              >
                {saving ? 'Saving…' : 'Save changes'}
              </button>
            </>
          ) : (
            <>
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
                  item.visited ? 'bg-stone-100 text-stone-700' : 'bg-stone-900 text-white'
                }`}
              >
                <Check size={16} />
                {item.visited ? 'Mark as not done' : 'Mark as done'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
