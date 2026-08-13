'use client';

import { useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { CartItem, Menu } from '@/lib/types';

const money = (n: number) => `Rp ${Math.round(n).toLocaleString('id-ID')}`;
const PAYMENT_METHODS = ['Cash', 'QRIS', 'Transfer', 'Debit', 'Credit Card'] as const;
type PaymentMethod = typeof PAYMENT_METHODS[number];

export default function PosClient({
  menus,
  businessName,
  businessId,
}: {
  menus: Menu[];
  businessName: string;
  businessId: string;
}) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('Semua');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [payment, setPayment] = useState<PaymentMethod>('Cash');
  const [paid, setPaid] = useState('');
  const [customer, setCustomer] = useState('');
  const [table, setTable] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ id: string; total: number } | null>(null);

  const supabase = createClient();
  const cats = ['Semua', ...Array.from(new Set(menus.map((m) => m.category).filter(Boolean)))];
  const shown = menus.filter(
    (m) =>
      m.active &&
      m.name.toLowerCase().includes(query.toLowerCase()) &&
      (category === 'Semua' || m.category === category),
  );

  const subtotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.menu.price * item.qty, 0),
    [cart],
  );
  const amountPaid = payment === 'Cash' ? Number(paid) || 0 : subtotal;
  const change = payment === 'Cash' ? Math.max(0, amountPaid - subtotal) : 0;
  const insufficient = payment === 'Cash' && amountPaid < subtotal;

  function add(menu: Menu) {
    setCart((current) => {
      const existing = current.find((item) => item.menu.id === menu.id);
      return existing
        ? current.map((item) =>
            item.menu.id === menu.id ? { ...item, qty: item.qty + 1 } : item,
          )
        : [...current, { menu, qty: 1 }];
    });
  }

  function changeQty(id: string, delta: number) {
    setCart((current) =>
      current.flatMap((item) =>
        item.menu.id === id
          ? [{ ...item, qty: item.qty + delta }].filter((next) => next.qty > 0)
          : [item],
      ),
    );
  }

  function resetForm() {
    setCart([]);
    setPaid('');
    setCustomer('');
    setTable('');
    setPayment('Cash');
    setError(null);
  }

  async function processPayment() {
    if (!cart.length || insufficient || saving) return;

    setSaving(true);
    setError(null);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) throw new Error('Sesi login tidak ditemukan. Silakan login kembali.');

      const { data: transaction, error: transactionError } = await supabase
        .from('transactions')
        .insert({
          business_id: businessId,
          cashier_id: user.id,
          customer_name: customer.trim() || null,
          table_number: table.trim() || null,
          subtotal,
          discount: 0,
          tax: 0,
          service: 0,
          total: subtotal,
          payment_method: payment,
          amount_paid: amountPaid,
          change_amount: change,
        })
        .select('id, total')
        .single();

      if (transactionError || !transaction) {
        throw new Error(transactionError?.message || 'Gagal menyimpan transaksi.');
      }

      const items = cart.map((item) => ({
        transaction_id: transaction.id,
        menu_id: item.menu.id,
        menu_name: item.menu.name,
        quantity: item.qty,
        unit_price: item.menu.price,
        subtotal: item.menu.price * item.qty,
      }));

      const { error: itemsError } = await supabase.from('transaction_items').insert(items);

      if (itemsError) {
        await supabase.from('transactions').delete().eq('id', transaction.id).eq('business_id', businessId);
        throw new Error(itemsError.message || 'Detail transaksi gagal disimpan. Transaksi dibatalkan.');
      }

      setSuccess({ id: transaction.id, total: Number(transaction.total) });
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan saat memproses transaksi.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">


      <main className="mx-auto grid max-w-7xl gap-5 p-4 lg:grid-cols-[1fr_380px]">
        <section className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              className="flex-1 rounded-xl border bg-white px-4 py-3"
              placeholder="Cari menu..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <div className="flex gap-2 overflow-x-auto">
              {cats.map((c) => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={`whitespace-nowrap rounded-full px-4 py-2 text-xs ${
                    category === c ? 'bg-emerald-600 text-white' : 'border bg-white'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
            {shown.map((menu) => (
              <button
                key={menu.id}
                onClick={() => add(menu)}
                className="rounded-xl border bg-white p-4 text-left shadow-sm transition hover:border-emerald-300"
              >
                <div className="text-sm font-semibold">{menu.name}</div>
                <div className="mt-2 text-xs text-slate-500">{menu.category}</div>
                <div className="mt-3 font-bold text-emerald-600">{money(menu.price)}</div>
              </button>
            ))}
            {!shown.length && <div className="col-span-full rounded-xl border bg-white p-8 text-center text-sm text-slate-400">Menu tidak ditemukan.</div>}
          </div>
        </section>

        <aside className="h-fit rounded-2xl border bg-white p-4 shadow-sm lg:sticky lg:top-20">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-bold">Keranjang</h2>
            <span className="text-xs text-slate-500">{cart.reduce((sum, item) => sum + item.qty, 0)} item</span>
          </div>

          {cart.length === 0 ? (
            <div className="py-12 text-center text-sm text-slate-400">Belum ada menu dipilih.</div>
          ) : (
            <div className="space-y-3">
              {cart.map((item) => (
                <div key={item.menu.id} className="flex items-center justify-between gap-3 border-b pb-3">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">{item.menu.name}</div>
                    <div className="text-xs text-slate-500">{money(item.menu.price)}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => changeQty(item.menu.id, -1)} className="h-7 w-7 rounded-full border">−</button>
                    <span className="w-5 text-center text-sm">{item.qty}</span>
                    <button onClick={() => changeQty(item.menu.id, 1)} className="h-7 w-7 rounded-full border">+</button>
                  </div>
                  <div className="w-20 text-right text-sm font-semibold">{money(item.menu.price * item.qty)}</div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-5 space-y-3 border-t pt-4">
            <input className="w-full rounded-lg border px-3 py-2 text-sm" placeholder="Nama pelanggan (opsional)" value={customer} onChange={(e) => setCustomer(e.target.value)} />
            <input className="w-full rounded-lg border px-3 py-2 text-sm" placeholder="Nomor meja (opsional)" value={table} onChange={(e) => setTable(e.target.value)} />

            <div className="flex justify-between text-sm"><span>Subtotal</span><b>{money(subtotal)}</b></div>
            <div className="flex justify-between text-base font-bold"><span>Total</span><span className="text-emerald-600">{money(subtotal)}</span></div>

            <div>
              <div className="mb-2 text-xs font-medium text-slate-600">Metode Pembayaran</div>
              <div className="grid grid-cols-2 gap-2">
                {PAYMENT_METHODS.map((method) => (
                  <button key={method} onClick={() => setPayment(method)} className={`rounded-lg border px-2 py-2 text-xs ${payment === method ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : ''}`}>
                    {method}
                  </button>
                ))}
              </div>
            </div>

            {payment === 'Cash' && (
              <div>
                <input type="number" min="0" className="w-full rounded-lg border px-3 py-2" placeholder="Jumlah bayar" value={paid} onChange={(e) => setPaid(e.target.value)} />
                <div className="mt-2 flex justify-between text-sm"><span>Kembalian</span><b>{money(change)}</b></div>
                {insufficient && subtotal > 0 && <p className="mt-1 text-xs text-red-600">Jumlah bayar masih kurang.</p>}
              </div>
            )}

            {error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">{error}</div>}

            <button disabled={!cart.length || insufficient || saving} onClick={processPayment} className="w-full rounded-xl bg-emerald-600 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40">
              {saving ? 'Menyimpan...' : 'Bayar'}
            </button>
          </div>
        </aside>
      </main>

      {success && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/40 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-emerald-100 text-xl text-emerald-700">✓</div>
            <h3 className="mt-4 text-lg font-bold">Transaksi berhasil</h3>
            <p className="mt-2 text-sm text-slate-500">Total {money(success.total)}</p>
            <p className="mt-1 break-all text-xs text-slate-400">ID: {success.id}</p>
            <button onClick={() => setSuccess(null)} className="mt-5 w-full rounded-lg bg-emerald-600 px-5 py-2 text-sm font-semibold text-white">Selesai</button>
          </div>
        </div>
      )}
    </div>
  );
}
