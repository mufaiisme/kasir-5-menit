'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  {
    label: 'Kasir',
    href: '/dashboard',
  },
  {
    label: 'Menu',
    href: '/dashboard/menu',
  },
  {
    label: 'Transaksi',
    href: '/dashboard/transaksi',
  },
  {
    label: 'Laporan',
    href: '/dashboard/laporan',
  },
  {
    label: 'Pengaturan',
    href: '/dashboard/pengaturan',
  },
];

export default function AppNav({
  businessName,
}: {
  businessName: string;
}) {
  const pathname = usePathname();

  return (
    <header className="border-b bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">

        <div>
          <h1 className="font-bold text-emerald-600">
            {businessName}
          </h1>

          <p className="text-xs text-slate-500">
            Kasir 5 Menit
          </p>
        </div>

        <nav className="flex items-center gap-1">
          {navItems.map((item) => {
            const active =
              item.href === '/dashboard'
                ? pathname === '/dashboard'
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={
                  active
                    ? 'rounded-lg bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700'
                    : 'rounded-lg px-4 py-2 text-sm text-slate-600 hover:bg-slate-100'
                }
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

      </div>
    </header>
  );
}
