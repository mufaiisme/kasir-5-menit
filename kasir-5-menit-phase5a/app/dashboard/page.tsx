import { getBusinessContext } from '@/lib/business-context';
import { createClient } from '@/lib/supabase/server';
import PosClient from '@/components/pos-client';

export default async function DashboardPage() {
  const { business } = await getBusinessContext();
  const supabase = await createClient();

  const { data: menus, error } = await supabase
    .from('menus')
    .select('*')
    .eq('business_id', business.id)
    .eq('active', true)
    .order('category')
    .order('name');

  if (error) {
    throw new Error(`Gagal mengambil menu: ${error.message}`);
  }

  return (
    <PosClient
      businessId={business.id}
      businessName={business.name}
      menus={(menus ?? []) as any}
    />
  );
}
