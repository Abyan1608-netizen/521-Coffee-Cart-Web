import { useEffect, useState } from "react";
import AnimatedHeading from "./components/AnimatedHeading";
import FadeIn from "./components/FadeIn";
import Reveal from "./components/Reveal";
import { DAYS, WEEK_ORDER, fmtDate, igLink, initial, loadLive, rupiah, visiblePosts, waLink, type Data, type MenuItem, type Post } from "./data";

const VIDEO = "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260403_050628_c4e32401-fab4-4a27-b7a8-6e9291cd5959.mp4";
const PAD = "px-6 md:px-12 lg:px-16";
const LINKS = [
  ["Cerita", "#cerita"],
  ["Menu", "#menu"],
  ["Kabar", "#kabar"],
  ["Lokasi", "#lokasi"],
];

export default function App() {
  const [data, setData] = useState<Data>(initial);
  useEffect(() => {
    loadLive().then((d) => d && setData(d));
  }, []);
  const { store } = data;
  const wa = waLink(store.wa);
  const posts = visiblePosts(data.posts);
  const testi = (store.testi || []).filter((t) => !t.draft && t.text);

  return (
    <div className="bg-black text-white font-sans">
      <Hero wa={wa} />
      <Story store={data.store} />
      <Menu menu={data.menu} waNum={store.wa} />
      {posts.length > 0 && <News posts={posts} />}
      {testi.length > 0 && <Quote text={testi[0].text} name={testi[0].name} role={testi[0].role} />}
      <Visit data={data} wa={wa} />
      <Footer data={data} />
    </div>
  );
}

/* ---------------- Hero ---------------- */
function Hero({ wa }: { wa: string }) {
  return (
    <section className="relative min-h-screen h-[100svh] flex flex-col overflow-hidden">
      <video className="absolute inset-0 w-full h-full object-cover" src={VIDEO} autoPlay loop muted playsInline />

      <div className={`relative z-10 ${PAD} pt-6`}>
        <nav className="liquid-glass rounded-xl px-4 py-2 flex items-center justify-between">
          <a href="#" className="text-2xl font-semibold tracking-tight">521</a>
          <div className="hidden md:flex items-center gap-8">
            {LINKS.map(([t, h]) => (
              <a key={h} href={h} className="text-sm transition-colors hover:text-gray-300">{t}</a>
            ))}
          </div>
          <a href={wa} target="_blank" rel="noopener" className="bg-white text-black px-6 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-gray-100">
            Pesan Sekarang
          </a>
        </nav>
      </div>

      <div className={`relative z-10 ${PAD} flex-1 flex flex-col justify-end pb-12 lg:pb-16`}>
        <div className="lg:grid lg:grid-cols-2 lg:items-end">
          <div>
            <AnimatedHeading
              text={"Kopi untuk teman\nbelajar & bekerja."}
              className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-normal mb-4"
              style={{ letterSpacing: "-0.04em" }}
            />
            <FadeIn delay={800} duration={1000}>
              <p className="text-base md:text-lg text-gray-300 mb-5">
                Kopi 100% Arabika dari gerobak kecil di Ciledug – Pinang. Buka setiap hari, pagi sampai malam.
              </p>
            </FadeIn>
            <FadeIn delay={1200} duration={1000}>
              <div className="flex flex-wrap gap-4">
                <a href={wa} target="_blank" rel="noopener" className="bg-white text-black px-8 py-3 rounded-lg font-medium">Pesan Sekarang</a>
                <a href="#menu" className="liquid-glass border border-white/20 text-white px-8 py-3 rounded-lg font-medium transition-colors hover:bg-white hover:text-black">
                  Lihat Menu
                </a>
              </div>
            </FadeIn>
          </div>
          <FadeIn delay={1400} duration={1000} className="flex items-end justify-start lg:justify-end mt-8 lg:mt-0">
            <div className="liquid-glass border border-white/20 px-6 py-3 rounded-xl">
              <p className="text-lg md:text-xl lg:text-2xl font-light">Ngopi. Belajar. Bekerja.</p>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}

/* ---------------- bagian bawah ---------------- */
function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="text-sm font-medium uppercase tracking-[0.18em] text-gray-300 mb-4">{children}</p>;
}
function H2({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <h2 className={`text-3xl md:text-5xl lg:text-6xl font-normal ${className}`} style={{ letterSpacing: "-0.04em", lineHeight: 1.05 }}>
      {children}
    </h2>
  );
}

function Story({ store }: { store: Data["store"] }) {
  const facts = [
    ["100%", "Arabika", "Semua racikan kopi kami memakai kopi Arabika."],
    [store.hours || "05.00–21.00", "Buka setiap hari", "Dari pagi buta sampai malam."],
    ["Ciledug", store.place || "Ciledug – Pinang, Tangerang", "Gerobak kecil, dekat dengan kamu."],
  ];
  return (
    <section id="cerita" className={`${PAD} py-24 md:py-32`}>
      <div className="lg:grid lg:grid-cols-2 lg:gap-16 lg:items-end">
        <Reveal>
          <Eyebrow>Cerita 521</Eyebrow>
          <H2>
            {store.tagline || "Teman kamu, belajar & bekerja"}.
            <span className="text-gray-300"> Satu botol kopi yang menemani tugas, rapat, dan obrolan panjang.</span>
          </H2>
        </Reveal>
        <Reveal delay={150} className="mt-10 lg:mt-0">
          <p className="text-base md:text-lg text-gray-300 max-w-xl lg:ml-auto">
            Kopi botolan 100% Arabika dari 521 Coffee Cart di {store.place || "Ciledug – Pinang, Tangerang"}. Pesan lewat WhatsApp, ambil saat lewat, bawa ke kelas atau ke kantor.
          </p>
        </Reveal>
      </div>
      <div className="mt-14 grid gap-4 md:grid-cols-3">
        {facts.map(([big, label, txt], i) => (
          <Reveal key={label} delay={i * 120}>
            <div className="liquid-glass border border-white/20 rounded-2xl p-6 md:p-8 h-full">
              <p className="text-4xl md:text-5xl font-normal mb-3" style={{ letterSpacing: "-0.04em" }}>{big}</p>
              <p className="text-lg font-medium mb-1">{label}</p>
              <p className="text-gray-300">{txt}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function Menu({ menu, waNum }: { menu: MenuItem[]; waNum?: string }) {
  return (
    <section id="menu" className={`${PAD} py-24 md:py-32 border-t border-white/10`}>
      <Reveal className="md:flex md:items-end md:justify-between gap-8 mb-12">
        <div>
          <Eyebrow>Menu</Eyebrow>
          <H2>Racikan kami.</H2>
        </div>
        <p className="text-base md:text-lg text-gray-300 max-w-md mt-4 md:mt-0">
          Dikemas dalam botol, siap dibawa ke kelas atau ke kantor.
        </p>
      </Reveal>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {menu.map((m, i) => (
          <Reveal key={m.n} delay={(i % 4) * 110}>
            <MenuCard m={m} waNum={waNum} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function MenuCard({ m, waNum }: { m: MenuItem; waNum?: string }) {
  const col = m.col || "#8b5e3c";
  return (
    <article className="group relative aspect-[3/4] rounded-2xl overflow-hidden border border-white/10">
      {m.img ? (
        <img src={m.img} alt={m.n} loading="lazy" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
      ) : (
        <div className="absolute inset-0" style={{ background: `radial-gradient(120% 90% at 30% 20%, ${col} 0%, #1a0f08 70%, #000 100%)` }}>
          <p className="absolute left-6 top-6 right-6 text-5xl md:text-6xl font-semibold leading-[0.95]" style={{ letterSpacing: "-0.05em" }}>
            {m.n}
          </p>
        </div>
      )}
      <div className="absolute inset-x-3 bottom-3">
      <div className="liquid-glass rounded-xl p-4" style={{ background: "rgba(0,0,0,0.6)" }}>
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="text-xl font-semibold tracking-tight">{m.n}</h3>
          <p className="text-lg font-semibold whitespace-nowrap">{rupiah(m.p)}</p>
        </div>
        <p className="text-sm text-gray-300 mt-0.5">{[m.c, m.s].filter(Boolean).join(" · ")}</p>
        {m.d && <p className="text-sm text-gray-200 mt-2 line-clamp-2">{m.d}</p>}
        <a
          href={waLink(waNum, `Halo 521 Coffee Cart, saya mau pesan ${m.n} ☕`)}
          target="_blank"
          rel="noopener"
          className="mt-3 inline-block text-sm font-medium border-b border-white/40 hover:border-white"
        >
          Pesan {m.n} →
        </a>
      </div>
      </div>
    </article>
  );
}

const TYPE: Record<string, string> = { promo: "Promo", event: "Kegiatan", news: "Kabar" };

function News({ posts }: { posts: Post[] }) {
  return (
    <section id="kabar" className={`${PAD} py-24 md:py-32 border-t border-white/10`}>
      <Reveal className="mb-12">
        <Eyebrow>Promo & Kabar</Eyebrow>
        <H2>Yang sedang terjadi di 521.</H2>
      </Reveal>
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((p, i) => (
          <Reveal key={p.id} delay={(i % 3) * 110}>
            <article className="liquid-glass border border-white/20 rounded-2xl overflow-hidden h-full flex flex-col">
              {p.img ? (
                <img src={p.img} alt="" loading="lazy" className="w-full aspect-[4/3] object-cover" />
              ) : (
                <DateBlock p={p} />
              )}
              <div className="p-6 flex flex-col gap-3 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.14em] bg-white text-black rounded-md px-2 py-1">{TYPE[p.type] || "Kabar"}</span>
                  {p.badge && <span className="text-xs font-semibold uppercase tracking-[0.1em] border border-white/30 rounded-md px-2 py-1">{p.badge}</span>}
                </div>
                <h3 className="text-2xl font-semibold tracking-tight">{p.title}</h3>
                {p.body && <p className="text-gray-300">{p.body}</p>}
                <PostMeta p={p} />
              </div>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function DateBlock({ p }: { p: Post }) {
  const d = p.type === "event" ? p.date : p.end;
  const [y, m, dd] = (d || "").split("-").map(Number);
  const ok = y && m && dd;
  const month = ok ? new Date(y, m - 1, dd).toLocaleDateString("id-ID", { month: "long" }) : "";
  return (
    <div className="w-full aspect-[4/3] flex flex-col justify-end p-6 border-b border-white/10" style={{ background: "radial-gradient(110% 90% at 20% 10%, #3a2414 0%, #120b06 60%, #000 100%)" }}>
      {ok ? (
        <>
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-gray-300">{p.type === "event" ? "Catat tanggalnya" : "Berlaku sampai"}</p>
          <p className="text-7xl md:text-8xl font-normal leading-none mt-2" style={{ letterSpacing: "-0.05em" }}>{dd}</p>
          <p className="text-2xl font-medium mt-1 capitalize">{month} {y}</p>
        </>
      ) : (
        <p className="text-5xl font-semibold leading-none" style={{ letterSpacing: "-0.05em" }}>{p.badge || "521"}</p>
      )}
    </div>
  );
}

function PostMeta({ p }: { p: Post }) {
  const bits: string[] = [];
  if (p.type === "event") {
    if (p.date) bits.push(fmtDate(p.date) + (p.time ? `, ${p.time}` : ""));
    if (p.place) bits.push(p.place);
  } else if (p.type === "promo" && p.end) {
    bits.push(`Berlaku sampai ${fmtDate(p.end)}`);
  }
  if (!bits.length) return null;
  return <p className="mt-auto pt-2 text-sm font-medium text-white">{bits.join(" · ")}</p>;
}

function Quote({ text, name, role }: { text: string; name: string; role?: string }) {
  return (
    <section className={`${PAD} py-24 md:py-36 border-t border-white/10`}>
      <Reveal className="max-w-5xl">
        <p className="text-3xl md:text-5xl lg:text-6xl font-normal" style={{ letterSpacing: "-0.04em", lineHeight: 1.1 }}>
          “{text}”
        </p>
        <p className="mt-8 text-lg font-medium">
          {name}
          {role && <span className="text-gray-300 font-normal"> · {role}</span>}
        </p>
      </Reveal>
    </section>
  );
}

function Visit({ data, wa }: { data: Data; wa: string }) {
  const { store } = data;
  const sched = Array.isArray(store.sched) && store.sched.length === 7 ? store.sched : null;
  const todayIdx = new Date().getDay();
  const ig = igLink(store.ig);
  return (
    <section id="lokasi" className={`${PAD} py-24 md:py-32 border-t border-white/10`}>
      <div className="relative rounded-3xl overflow-hidden border border-white/10 min-h-[560px] flex items-end">
        <video className="absolute inset-0 w-full h-full object-cover" src={VIDEO} autoPlay loop muted playsInline aria-hidden="true" />
        <div className="relative z-10 w-full p-4 md:p-8 lg:grid lg:grid-cols-2 lg:gap-6 lg:items-end">
          <Reveal>
            <div className="liquid-glass border border-white/20 rounded-2xl p-6 md:p-8" style={{ background: "rgba(0,0,0,0.6)" }}>
              <Eyebrow>Kunjungi kami</Eyebrow>
              <h2 className="text-3xl md:text-5xl font-normal mb-4" style={{ letterSpacing: "-0.04em", lineHeight: 1.05 }}>
                {store.place || "Ciledug – Pinang, Tangerang"}
              </h2>
              <p className="text-gray-200 mb-6">Mampir langsung, atau pesan lewat WhatsApp dan ambil saat lewat.</p>
              <div className="flex flex-wrap gap-3">
                <a href={wa} target="_blank" rel="noopener" className="bg-white text-black px-6 py-3 rounded-lg font-medium">Pesan lewat WhatsApp</a>
                {store.maps && (
                  <a href={store.maps} target="_blank" rel="noopener" className="liquid-glass border border-white/20 px-6 py-3 rounded-lg font-medium transition-colors hover:bg-white hover:text-black">
                    Buka Google Maps
                  </a>
                )}
                {ig && (
                  <a href={ig} target="_blank" rel="noopener" className="liquid-glass border border-white/20 px-6 py-3 rounded-lg font-medium transition-colors hover:bg-white hover:text-black">
                    Instagram
                  </a>
                )}
              </div>
            </div>
          </Reveal>
          <Reveal delay={150} className="mt-4 lg:mt-0">
            <div className="liquid-glass border border-white/20 rounded-2xl p-6 md:p-8" style={{ background: "rgba(0,0,0,0.6)" }}>
              <p className="text-lg font-semibold mb-3">Jam buka</p>
              {sched ? (
                <ul className="divide-y divide-white/10">
                  {WEEK_ORDER.map((d) => {
                    const x = sched[d];
                    return (
                      <li key={d} className={`flex justify-between py-2 ${d === todayIdx ? "font-semibold" : ""}`}>
                        <span>{DAYS[d]}{d === todayIdx ? " · hari ini" : ""}</span>
                        <span className={x.on ? "" : "text-gray-400"}>{x.on ? `${x.o.replace(":", ".")} – ${x.c.replace(":", ".")}` : "Tutup"}</span>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="text-gray-200">Setiap hari, {store.hours || "05.00–21.00"}</p>
              )}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function Footer({ data }: { data: Data }) {
  const ig = igLink(data.store.ig);
  return (
    <footer className={`${PAD} py-10 border-t border-white/10 flex flex-col md:flex-row md:items-center md:justify-between gap-6`}>
      <div>
        <p className="text-2xl font-semibold tracking-tight">521</p>
        <p className="text-sm text-gray-300 mt-1">© {new Date().getFullYear()} {data.store.name || "521 Coffee Cart"}</p>
      </div>
      <div className="flex flex-wrap gap-6 text-sm">
        {LINKS.map(([t, h]) => (
          <a key={h} href={h} className="transition-colors hover:text-gray-300">{t}</a>
        ))}
        {ig && <a href={ig} target="_blank" rel="noopener" className="transition-colors hover:text-gray-300">{data.store.ig}</a>}
      </div>
    </footer>
  );
}
