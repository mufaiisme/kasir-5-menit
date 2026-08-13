# Kasir 5 Menit — PHASE 5B

PHASE 5B menghubungkan POS dengan Supabase untuk menyimpan transaksi.

Flow:
menu → cart → pembayaran → insert transactions → insert transaction_items → success → reset cart

Tidak ada perubahan schema database pada phase ini.

Catatan: transaksi dibuat terlebih dahulu, lalu item dibuat. Jika insert item gagal, aplikasi mencoba menghapus transaksi yang baru dibuat.
