import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase-server';
import CategoryView from '@/components/CategoryView';

export default async function PlacePage() {
  const supabase = createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect('/login');
  return <CategoryView category="place" />;
}
