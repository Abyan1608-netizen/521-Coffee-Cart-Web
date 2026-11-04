# 521 Coffee Cart — Website (konsep baru)

Website publik 521 Coffee Cart: hero video layar penuh dengan efek *liquid glass*, lalu Cerita, Menu, Promo & Kabar, Testimoni, dan Lokasi/Jam buka.

- **Teknologi:** React + TypeScript, Tailwind CSS, Vite. Huruf: Inter (Google Fonts).
- **Data:** menu, promo, kabar, jam buka diambil langsung dari server 521 (`/kdata.js`, data yang diterbitkan HP Owner di aplikasi). Bila server tidak bisa dihubungi, dipakai salinan bawaan di `src/data.json`.
- **Terbit otomatis:** setiap push ke `main`, GitHub Actions membangun dan menerbitkan ke GitHub Pages (`.github/workflows/pages.yml`).

## Menjalankan di komputer
```bash
npm install
npm run dev      # buka http://localhost:5173
npm run build    # hasil di folder dist/
```

## Mengubah isi
| Yang diubah | Di mana |
|---|---|
| Judul, teks hero, tombol | `src/App.tsx` → `Hero` |
| Video latar | `src/App.tsx` → konstanta `VIDEO` |
| Teks Cerita | `src/App.tsx` → `Story` |
| Menu, promo, kabar, jam buka | Lewat aplikasi 521 (Atur & Kabar di HP Owner) — website ikut otomatis |
| Warna & efek kaca | `src/index.css` (`.liquid-glass`) |

Aplikasi kasir & server ada di repo terpisah: `Abyan1608-netizen/521-Coffee-Cart`.
