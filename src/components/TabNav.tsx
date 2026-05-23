'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Coffee, MapPin, ShoppingBag } from 'lucide-react';

const tabs = [
  { href: '/cafe', label: 'Cafés', icon: Coffee },
  { href: '/place', label: 'Places', icon: MapPin },
  { href: '/product', label: 'Products', icon: ShoppingBag },
];

export default function TabNav() {
  const pathname = usePathname();
  return (
    <nav className="flex gap-1 px-4 pb-2">
      {tabs.map(({ href, label, icon: Icon }) => {
        const active = pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-sm font-medium transition ${
              active
                ? 'bg-stone-100 text-stone-900'
                : 'text-stone-500 hover:text-stone-700'
            }`}
          >
            <Icon size={16} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
