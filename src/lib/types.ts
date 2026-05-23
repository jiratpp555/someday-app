export type Category = 'cafe' | 'place' | 'product';

export type Item = {
  id: string;
  user_id: string;
  category: Category;
  title: string;
  subtitle: string | null;
  note: string | null;
  image_url: string | null;
  external_url: string | null;
  price: number | null;
  lat: number | null;
  lng: number | null;
  visited: boolean;
  visited_at: string | null;
  rating: number | null;
  review: string | null;
  created_at: string;
};

export const CATEGORIES: { value: Category; label: string; icon: string }[] = [
  { value: 'cafe', label: 'Cafés', icon: 'Coffee' },
  { value: 'place', label: 'Places', icon: 'MapPin' },
  { value: 'product', label: 'Products', icon: 'ShoppingBag' },
];
