import snap from "./data.json";

/* Data toko. Bawaan: salinan saat website dibuat (src/data.json).
   Bila server 521 bisa dihubungi, menu & promo terbaru yang diterbitkan HP Owner langsung dipakai. */
export const API = "https://coffee521-api.coffee521.workers.dev";

export type MenuItem = { n: string; p: number | string; c?: string; s?: string; d?: string; col?: string; img?: string };
export type Post = {
  id: string; type: string; title: string; body?: string; badge?: string;
  start?: string; end?: string; date?: string; time?: string; place?: string; img?: string; dval?: number | string;
};
export type Sched = { on: boolean; o: string; c: string };
export type Testi = { id: string; name: string; role?: string; text: string; stars?: number; draft?: boolean };
export type Store = { name: string; tagline?: string; hours?: string; place?: string; wa?: string; ig?: string; maps?: string; sched?: Sched[]; testi?: Testi[] };
export type Data = { store: Store; menu: MenuItem[]; posts: Post[] };

const HIDE = new Set<string>((snap as { hide?: string[] }).hide || []);
const MENU_IMG: Record<string, string> = Object.fromEntries((snap.menu as MenuItem[]).filter((m) => m.img).map((m) => [m.n, m.img!]));

export const initial: Data = {
  store: snap.store as Store,
  menu: snap.menu as MenuItem[],
  posts: (snap.posts as Post[]).filter((p) => !HIDE.has(p.id)),
};

const media = (u?: string) => (!u ? "" : /^(https?:|data:)/.test(u) ? u : `${API}/${u.replace(/^\//, "")}`);

type RawK = { store?: Store & Record<string, unknown>; menu?: MenuItem[]; posts?: (Post & { draft?: boolean })[] };

/** Ambil data terbaru (script /kdata.js milik server 521). Gagal = tetap pakai data bawaan. */
export function loadLive(): Promise<Data | null> {
  return new Promise((resolve) => {
    const s = document.createElement("script");
    s.src = `${API}/kdata.js?t=${Math.floor(Date.now() / 60000)}`;
    s.async = true;
    const done = (d: Data | null) => { s.remove(); resolve(d); };
    const timer = setTimeout(() => done(null), 8000);
    s.onerror = () => { clearTimeout(timer); done(null); };
    s.onload = () => {
      clearTimeout(timer);
      const k = (window as unknown as { __K?: RawK }).__K;
      if (!k || !Array.isArray(k.menu) || !k.menu.length || !k.store) return done(null);
      const st = k.store;
      done({
        store: { name: st.name || initial.store.name, tagline: st.tagline, hours: st.hours, place: st.place, wa: st.wa, ig: st.ig, maps: st.maps, sched: st.sched, testi: st.testi },
        menu: k.menu.map((m) => ({ ...m, img: media(m.img) || MENU_IMG[m.n] || "" })),
        posts: (k.posts || []).filter((p) => !p.draft && !HIDE.has(p.id)).map((p) => ({ ...p, img: media(p.img) })),
      });
    };
    document.head.appendChild(s);
  });
}

export const rupiah = (v: number | string) => "Rp" + (Number(v) || 0).toLocaleString("id-ID");

export function waLink(wa?: string, text = "Halo 521 Coffee Cart, saya mau pesan ☕") {
  let n = String(wa || "").replace(/\D/g, "");
  if (n.startsWith("0")) n = "62" + n.slice(1);
  return n ? `https://wa.me/${n}?text=${encodeURIComponent(text)}` : "#lokasi";
}
export const igLink = (ig?: string) => (ig ? `https://instagram.com/${ig.replace(/^@/, "")}` : "");

const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

/** Promo yang masih berlaku, kegiatan yang belum lewat, lalu kabar terbaru (maks. 6). */
export function visiblePosts(posts: Post[]): Post[] {
  const t = today();
  const promo = posts.filter((p) => p.type === "promo" && (!p.end || p.end >= t));
  const event = posts.filter((p) => p.type === "event" && (!p.date || p.date >= t));
  const news = posts.filter((p) => p.type !== "promo" && p.type !== "event");
  return [...promo, ...event, ...news].slice(0, 6);
}

export const fmtDate = (d?: string) => {
  if (!d) return "";
  const [y, m, dd] = d.split("-").map(Number);
  if (!y || !m || !dd) return d;
  return new Date(y, m - 1, dd).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
};

/** sched[0] = Minggu (sama seperti aplikasi). Ditampilkan Senin → Minggu. */
export const DAYS = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
export const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0];
