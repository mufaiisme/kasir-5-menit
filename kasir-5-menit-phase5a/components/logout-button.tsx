'use client';
import {useState} from 'react'; import {useRouter} from 'next/navigation'; import {createClient} from '@/lib/supabase/client';
export default function LogoutButton(){const [loading,setLoading]=useState(false);const router=useRouter();const supabase=createClient();return <button onClick={async()=>{setLoading(true);await supabase.auth.signOut();router.push('/login');router.refresh()}} disabled={loading} className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 disabled:opacity-50">{loading?'Keluar...':'Logout'}</button>}
