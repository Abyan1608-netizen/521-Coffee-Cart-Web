# 521 Coffee Cart — Website

Website publik 521 Coffee Cart: tirai pembuka, Cerita, Menu yang digulir dengan stiker interaktif, Kabar (dengan headline), Testimoni, Lokasi & jam buka, dan panel Pesan lewat reseller terdekat atau aplikasi pesan antar.

- **Satu file:** `web/index.html` (huruf Paralucent, logo 521, foto, dan data menu/kabar sudah tertanam di dalamnya). Animasi memakai GSAP dari cdnjs.
- **Tampil rapi** di HP (potret & lanskap), tablet, dan desktop.
- **Terbit otomatis:** setiap push ke `main`, GitHub Actions menerbitkan folder `web/` ke GitHub Pages (`.github/workflows/pages.yml`).

## Mengubah isi
Isi (teks, menu, harga, kabar, headline, reseller, warna, urutan bagian) diatur dari halaman **Pengaturan** di versi Claude (artifact "Kabar 521 Coffee"). Setelah diterbitkan di sana, salin ulang hasilnya ke `web/index.html` lalu push ke `main`.

Versi website sebelumnya (React + Vite, hero video + liquid glass) tetap tersimpan di riwayat git, commit `46f2a98`.

Aplikasi kasir & server ada di repo terpisah: `Abyan1608-netizen/521-Coffee-Cart`.
