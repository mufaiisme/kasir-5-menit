import { getBusinessContext } from '@/lib/business-context';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

const money = (value: number) =>
  `Rp ${Math.round(value || 0).toLocaleString('id-ID')}`;

const paymentLabel: Record<string, string> = {
  Cash: 'Cash',
  QRIS: 'QRIS',
  Transfer: 'Transfer',
  Debit: 'Debit',
  Kredit: 'Credit Card',
  'Credit Card': 'Credit Card',
};

export default async function TransactionsPage() {
  const { business } = await getBusinessContext();
  const supabase = await createClient();

  const { data: transactions, error } = await supabase
    .from('transactions')
    .select(
      'id, customer_name, table_number, subtotal, total, payment_method, amount_paid, change_amount, created_at'
    )
    .eq('business_id', business.id)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Gagal mengambil transaksi: ${error.message}`);
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <header className="border-b bg-white px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6">
          <div>
            <h1 className="text-xl font-bold text-emerald-600">
              {business.name}
            </h1>
            <p className="text-xs text-slate-500">
              Riwayat Transaksi
            </p>
          </div>

          <nav className="flex flex-wrap gap-1 sm:gap-2">
            <Link
              href="/dashboard"
              className="rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-100"
            >
              Kasir
            </Link>

            <Link
              href="/dashboard/menu"
              className="rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-100"
            >
              Menu
            </Link>

            <Link
              href="/dashboard/transactions"
              className="rounded-lg bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700"
            >
              Transaksi
            </Link>

            <Link
              href="/dashboard/laporan"
              className="rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-100"
            >
              Laporan
            </Link>

            <Link
              href="/dashboard/pengaturan"
              className="rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-100"
            >
              Pengaturan
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold">Transaksi</h2>
          <p className="mt-1 text-sm text-slate-500">
            Riwayat transaksi penjualan {business.name}.
          </p>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left">
              <thead className="border-b bg-slate-50">
                <tr className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th className="px-5 py-4">Waktu</th>
                  <th className="px-5 py-4">Pelanggan</th>
                  <th className="px-5 py-4">Meja</th>
                  <th className="px-5 py-4">Total</th>
                  <th className="px-5 py-4">Pembayaran</th>
                  <th className="px-5 py-4">Dibayar</th>
                  <th className="px-5 py-4 text-right">Aksi</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {!transactions || transactions.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-5 py-12 text-center text-sm text-slate-400"
                    >
                      Belum ada transaksi.
                    </td>
                  </tr>
                ) : (
                  transactions.map((transaction) => (
                    <tr
                      key={transaction.id}
                      className="text-sm hover:bg-slate-50"
                    >
                      <td className="px-5 py-4">
                        <div className="font-medium text-slate-700">
                          {new Date(transaction.created_at).toLocaleDateString(
                            'id-ID',
                            {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            }
                          )}
                        </div>

                        <div className="mt-1 text-xs text-slate-400">
                          {new Date(
                            transaction.created_at
                          ).toLocaleTimeString('id-ID', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        {transaction.customer_name || '-'}
                      </td>

                      <td className="px-5 py-4">
                        {transaction.table_number || '-'}
                      </td>

                      <td className="px-5 py-4 font-semibold text-emerald-600">
                        {money(transaction.total)}
                      </td>

                      <td className="px-5 py-4">
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                          {paymentLabel[transaction.payment_method] ||
                            transaction.payment_method}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        {money(transaction.amount_paid)}
                      </td>

                      <td className="px-5 py-4 text-right">
                        <Link
                          href={`/dashboard/transactions/${transaction.id}`}
                          className="font-medium text-blue-600 hover:text-blue-700"
                        >
                          Detail
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
