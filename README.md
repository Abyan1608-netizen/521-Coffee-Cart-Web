# 521 Coffee Cart — Website

Website publik 521 Coffee Cart: tirai pembuka, Cerita, Menu yang digulir dengan stiker interaktif, Kabar (dengan headline), Testimoni, Lokasi & jam buka, dan panel Pesan lewat reseller terdekat atau aplikasi pesan antar.

- **Satu file:** `web/index.html` (huruf Paralucent, logo 521, foto, dan data menu/kabar sudah tertanam di dalamnya). Animasi memakai GSAP dari cdnjs.
- **Tampil rapi** di HP (potret & lanskap), tablet, dan desktop.
- **Terbit otomatis:** setiap push ke `main`, GitHub Actions menerbitkan folder `web/` ke GitHub Pages (`.github/workflows/pages.yml`).

## Mengubah isi — dari aplikasi 521 (otomatis)
Website mengambil data terbaru dari server aplikasi (`https://coffee521-api.coffee521.workers.dev/kdata.js`) setiap dibuka dan tiap 1 menit:

| Diubah di aplikasi (HP Owner) | Tampil di website |
|---|---|
| Atur → Identitas toko, Jam buka toko · Kabar → Info toko & kontak | Nama, lokasi, jam & jadwal buka, WhatsApp, Instagram, Maps |
| Menu (harga, deskripsi, kategori, tandai **Habis**) | Kartu menu & panel Pesan (menu Habis tidak bisa dipesan) |
| Kabar & promo (promo, diskon, kegiatan, kabar, testimoni) | Bagian Kabar & Testimoni (draf tidak tampil) |
| Pesan → reseller & link ShopeeFood/GoFood/GrabFood | Panel Pesan |
| **Atur → Website** | Judul & teks tampilan awal, pita teks, Cerita, judul Menu/Kabar/Testimoni, teks Lokasi & kaki halaman, tampil/sembunyikan bagian |

Desain, foto, ikon, dan urutan bagian tetap dari `web/index.html`. Bila server tidak bisa dihubungi, isi bawaan di file ini yang tampil.
Kode sinkronnya ditambahkan oleh `tools/patch_sinkron_aplikasi.py` (jalankan ulang bila `web/index.html` diganti dengan versi baru dari Claude).

Supaya tirai pembuka tetap mulus: data terakhir disimpan di HP/komputer pengunjung (langsung tampil saat dibuka lagi), dan pada kunjungan pertama tirai menunggu data paling lama ±3 detik. Data yang datang saat tirai masih tertutup dipasang di balik tirai; saat tirai sedang membuka, pemasangan menunggu sampai tirai selesai.

**Ringan di HP:** `tools/optimasi_hp.py` (otomatis saat terbit) menjeda animasi yang sedang tidak terlihat, menghentikan perhitungan yang terulang tiap frame, dan memakai foto yang sama persis tanpa ditulis berulang. Tampilan tidak berubah.

Uji otomatis (Playwright): `tools/uji/uji-sinkron-aplikasi.js` (isi ikut aplikasi) dan `tools/uji/uji-tirai-pembuka.js <jeda-data-ms> <jumlah-muat>` (tirai tidak hilang mendadak).

## Mengubah desain
Desain diatur dari halaman **Pengaturan** di versi Claude (artifact "Kabar 521 Coffee"). Setelah diterbitkan di sana, salin hasilnya ke `web/index.html`, jalankan `python3 tools/patch_sinkron_aplikasi.py`, lalu push ke `main`.

Versi website sebelumnya (React + Vite, hero video + liquid glass) tetap tersimpan di riwayat git, commit `46f2a98`.

Aplikasi kasir & server ada di repo terpisah: `Abyan1608-netizen/521-Coffee-Cart`.
