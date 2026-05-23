'use client';
import 'leaflet/dist/leaflet.css';
import { useEffect, useRef } from 'react';
import L from 'leaflet';
import type { Item, Category } from '@/lib/types';

// Fix default marker icons broken by webpack
delete (L.Icon.Default.prototype as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const categoryColor: Record<Category, string> = {
  cafe: '#d97706',
  place: '#0ea5e9',
  product: '#f43f5e',
};

function makeIcon(category: Category, visited: boolean) {
  const color = visited ? '#10b981' : categoryColor[category];
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="36" viewBox="0 0 28 36">
      <path fill="${color}" stroke="white" stroke-width="2"
        d="M14 2C8.477 2 4 6.477 4 12c0 7.5 10 22 10 22s10-14.5 10-22c0-5.523-4.477-10-10-10z"/>
      <circle cx="14" cy="12" r="4" fill="white"/>
    </svg>`;
  return L.divIcon({
    html: svg,
    className: '',
    iconSize: [28, 36],
    iconAnchor: [14, 36],
    popupAnchor: [0, -36],
  });
}

export default function MapView({
  items,
  onSelect,
}: {
  items: Item[];
  onSelect: (item: Item) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  const mapped = items.filter((i) => i.lat != null && i.lng != null);

  useEffect(() => {
    if (!containerRef.current) return;
    if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; }

    const map = L.map(containerRef.current, { zoomControl: true });
    mapRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    if (mapped.length === 0) {
      map.setView([13.75, 100.5], 11);
    } else {
      const group = L.featureGroup();
      mapped.forEach((item) => {
        const marker = L.marker([item.lat!, item.lng!], {
          icon: makeIcon(item.category, item.visited),
        });
        marker.bindPopup(
          `<div style="min-width:120px">
            ${item.image_url ? `<img src="${item.image_url}" style="width:100%;height:72px;object-fit:cover;border-radius:6px;margin-bottom:6px"/>` : ''}
            <strong style="font-size:13px">${item.title}</strong>
            ${item.subtitle ? `<br/><span style="font-size:11px;color:#78716c">${item.subtitle}</span>` : ''}
          </div>`,
          { maxWidth: 180 }
        );
        marker.on('click', () => onSelect(item));
        marker.addTo(map);
        group.addLayer(marker);
      });
      map.fitBounds(group.getBounds().pad(0.3));
    }

    return () => { map.remove(); mapRef.current = null; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  return (
    <div>
      {mapped.length === 0 && (
        <p className="text-center text-sm text-stone-400 py-4 mb-2">
          No pinned locations yet — use the Pin button when adding items.
        </p>
      )}
      <div ref={containerRef} className="w-full rounded-2xl overflow-hidden" style={{ height: 'clamp(320px, 50vh, 560px)' }} />
    </div>
  );
}
