import { getBusinessContext } from '@/lib/business-context';
import { createClient } from '@/lib/supabase/server';
import MenuManagerClient from '@/components/menu-manager-client';
import AppNav from '@/components/app-nav';

export default async function MenuPage() {
  const { business } = await getBusinessContext();

  const supabase = await createClient();

  const { data: menus } = await supabase
    .from('menus')
    .select('*')
    .eq('business_id', business.id)
    .order('created_at', { ascending: false });

  return (
    <div className="min-h-screen bg-slate-50">

      <AppNav businessName={business.name} />

      <main className="mx-auto max-w-6xl p-5">
        <MenuManagerClient
          initialMenus={menus || []}
          businessId={business.id}
        />
      </main>

    </div>
  );
}
