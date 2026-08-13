export type BusinessRole = 'owner' | 'cashier';
export interface Business { id:string; name:string; logo_url?:string; phone?:string; address?:string; tax:number; service:number; created_at?:string; }
export interface BusinessMember { id:string; business_id:string; user_id:string; role:BusinessRole; created_at?:string; }
export interface Menu { id:string; business_id:string; category_id?:string; name:string; category:string; price:number; active:boolean; created_at?:string; updated_at?:string; }
export interface CartItem { menu:Menu; qty:number; }
export interface CartCalculations { subtotal:number; discount:number; tax:number; service:number; total:number; }
export interface TransactionItem { id?:string; transaction_id?:string; menu_id:string; menu_name:string; quantity:number; unit_price:number; subtotal:number; }
export interface Transaction { id:string; business_id:string; cashier_id:string; customer_name:string; table_number?:string; subtotal:number; discount:number; tax:number; service:number; total:number; payment_method:'Cash'|'QRIS'|'Transfer'|'Debit'|'Kredit'; amount_paid:number; change_amount:number; created_at:string; items:TransactionItem[]; }
