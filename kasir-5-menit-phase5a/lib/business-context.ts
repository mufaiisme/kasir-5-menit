import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Business, BusinessMember } from '@/lib/types';
export interface BusinessContextResult { user:any; business:Business; membership:BusinessMember; }
export async function getBusinessContext():Promise<BusinessContextResult>{
 const supabase=await createClient();
 const {data:{user},error:userError}=await supabase.auth.getUser();
 if(userError||!user) redirect('/login');
 const {data:membershipData,error:membershipError}=await supabase.from('business_members').select('*').eq('user_id',user.id).maybeSingle();
 if(membershipError||!membershipData) redirect('/onboarding');
 const {data:businessData,error:businessError}=await supabase.from('businesses').select('*').eq('id',membershipData.business_id).maybeSingle();
 if(businessError||!businessData) throw new Error('Business data not found for current user membership.');
 return {user,business:businessData as Business,membership:membershipData as BusinessMember};
}
