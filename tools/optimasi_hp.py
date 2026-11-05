"""Optimasi website 521 agar ringan di HP, TANPA mengubah tampilan atau kualitas gambar/huruf.
Dijalankan otomatis saat terbit (setelah tools/patch_sinkron_aplikasi.py). Aman diulang.
Tiap perbaikan berdiri sendiri: bila kodenya di web/index.html sudah berubah (versi baru dari Claude),
perbaikan itu dilewati dengan peringatan dan website tetap terbit normal.

Temuan pengukuran (HP Android disimulasikan, CPU 4x lebih lambat):
- Saat diam saja, prosesor HP sibuk ±55-65% terus-menerus (panas & boros baterai, terasa berat).
- Saat digulir: ±25 fps, banyak patah-patah.
Penyebab & perbaikannya:
 1. Tirai: setiap gulir mengukur ulang posisi tirai (memaksa browser menghitung ulang tata letak),
    dan setelah halaman digambar ulang, tirai lama yang sudah tidak terpakai terus berputar 60x/detik selamanya.
    → posisi dibaca sekali per frame dari angka gulir; saat tirai di luar layar, gulir diabaikan; tirai lama berhenti.
 2. Warna bilah atas: tiap frame gulir memeriksa elemen di bawah bilah (hit-test mahal).
    → diperiksa hanya saat batas bagian melewati bilah (hasil warna sama persis).
 2b. Menu yang bergeser: tiap frame menulis nilai yang tidak dipakai tampilan ke seluruh jalur menu → dihapus.
    Tirai juga menulis nilainya ke seluruh tampilan awal (±450 elemen ditata ulang tiap frame) → kini hanya ke kain tirai.
 3. Titik "live" berkedip memakai bayangan (box-shadow) yang harus digambar ulang prosesor tiap frame.
    → efek yang sama persis dibuat dengan lingkaran yang membesar & memudar (dikerjakan GPU).
 4. Animasi di bagian yang sedang tidak terlihat di layar (26 stiker, teks berjalan, stempel berputar, ikon biji kopi
    yang berubah bentuk, kartu foto yang bergantian) dijeda, lalu jalan lagi ±300px sebelum bagian itu masuk layar.
    Yang terlihat pengunjung tidak berubah. (Ikon biji kopi berubah bentuk sendiri memakan ±25% prosesor HP terus-menerus.)
 5. Foto tertanam (base64) ditulis berulang ke halaman (±7 MB teks di halaman HP).
    → setiap foto diubah sekali menjadi alamat lokal (blob) yang isinya byte foto yang sama persis.
"""
import pathlib, sys

P = pathlib.Path(__file__).resolve().parents[1] / "web/index.html"
s = P.read_text()
MARK = "/*OPTIMASI-HP-1*/"
if MARK in s:
    print("Optimasi HP sudah terpasang."); sys.exit(0)

done, skip = [], []


def opt(name, pairs):
    """Terapkan sekumpulan penggantian sekaligus; bila salah satu tidak cocok tepat 1x, lewati semuanya."""
    global s
    for old, _ in pairs:
        if s.count(old) != 1:
            skip.append(name); print(f"::warning::Optimasi '{name}' dilewati (kode di index.html berbeda)."); return
    for old, new in pairs:
        s = s.replace(old, new)
    done.append(name)


# 1. Tirai --------------------------------------------------------------------------------------------
opt("tirai", [
    ('const read=()=>{const r=hero.getBoundingClientRect();tgt=ease(-r.top/(r.height*.95))};',
     MARK + 'let gT=0,gH=1,gAt=-1e9,need=0,vis=true;const geo=()=>{const r=hero.getBoundingClientRect();gT=r.top+window.scrollY;gH=r.height||gH;gAt=performance.now()};'
     'const read=()=>{if(!hero.isConnected)return;if(performance.now()-gAt>1000)geo();const v=ease(-(gT-window.scrollY)/(gH*.95));if(v===v)tgt=v};'),
    ('const put=(c,l)=>{hero.style.setProperty("--close",c.toFixed(4));hero.style.setProperty("--lag",l.toFixed(3))};',
     '/* nilai tirai dipasang langsung pada kain & logo tirai (bukan seluruh hero), jadi browser tidak menata ulang ±450 elemen tiap frame */'
     'const dEl=$$(".drape,.drape-logo",hero);const put=(c,l)=>{c=c.toFixed(4);l=l.toFixed(3);for(const e of dEl){e.style.setProperty("--close",c);e.style.setProperty("--lag",l)}};'),
    ('const tick=()=>{raf=0;if(!live)return;', 'const tick=()=>{raf=0;if(!live||!hero.isConnected)return;if(need){need=0;read()}'),
    ('const on=()=>{read();if(!raf)raf=requestAnimationFrame(tick)};',
     '/* gulir hanya menandai; posisi dibaca sekali per frame. Saat tirai di luar layar (tertutup penuh) gulir diabaikan */'
     'const on=()=>{if(!hero.isConnected||!vis)return;need=1;if(!raf)raf=requestAnimationFrame(tick)};'
     'const hio=("IntersectionObserver"in window)?new IntersectionObserver(es=>{vis=es[es.length-1].isIntersecting;if(!vis){need=0;tgt=1;if(live&&!raf&&cur!==tgt)raf=requestAnimationFrame(tick)}else on()}):null;if(hio)hio.observe(hero);'),
    ('window.addEventListener("scroll",on,{passive:true});window.addEventListener("resize",on);',
     'const onR=()=>{gAt=-1e9;on()};window.addEventListener("scroll",on,{passive:true});window.addEventListener("resize",onR);'),
    ('drapeOff=()=>{window.removeEventListener("scroll",on);window.removeEventListener("resize",on);',
     'drapeOff=()=>{if(hio)hio.disconnect();window.removeEventListener("scroll",on);window.removeEventListener("resize",onR);'),
])

# 2. Warna bilah atas ---------------------------------------------------------------------------------
# Warna hanya bergantung pada bagian mana yang ada tepat di bawah bilah. Pengamat (IntersectionObserver) pada garis tipis
# di bawah bilah memanggil navTone() persis saat batas bagian melewati garis itu, bukan tiap frame gulir.
opt("bilah-atas", [
    ('window.addEventListener("scroll",()=>{if(!navRaf)navRaf=requestAnimationFrame(navTone)},{passive:true});',
     '''if(!("IntersectionObserver"in window))window.addEventListener("scroll",()=>{if(!navRaf)navRaf=requestAnimationFrame(navTone)},{passive:true});
else(()=>{let io=null,q=0;const mk=()=>{q=0;if(io)io.disconnect();const inn=$(".nav-in");if(!inn)return;const r=inn.getBoundingClientRect(),H=innerHeight,y=Math.min(H-1,r.bottom+6);
  io=new IntersectionObserver(()=>{if(!navRaf)navRaf=requestAnimationFrame(navTone)},{rootMargin:(-Math.floor(y))+"px 0px "+(-Math.max(0,Math.floor(H-y-2)))+"px 0px"});
  $$("#root [data-sec],#root .foot").forEach(el=>io.observe(el))};
  const later=()=>{if(!q)q=requestAnimationFrame(mk)};new MutationObserver(later).observe(document.getElementById("root"),{childList:true});
  window.addEventListener("resize",later);later()})();'''),
])

# 2b. Menu bergeser: nilai "--v" ditulis ke seluruh jalur menu tiap frame padahal tidak dipakai tampilan mana pun
import re
if not re.search(r"var\(--v[,)\s]", s):
    opt("menu-geser", [
        ('track.style.setProperty("--v",gsap.utils.clamp(-40,40,v/-40).toFixed(1));', ''),
        ('skew(0);track.style.setProperty("--v","0")', 'skew(0)'),
    ])

# 3. Titik live ---------------------------------------------------------------------------------------
opt("titik-live", [
    ('.n-live i{width:8px;height:8px;border-radius:50%;background:var(--brand);animation:liveDot 1.9s ease-out infinite}',
     '.n-live i{width:8px;height:8px;border-radius:50%;background:var(--brand);position:relative;isolation:isolate}'
     '.n-live i::after{content:"";position:absolute;inset:0;z-index:-1;border-radius:50%;background:rgba(255,48,10,.55);animation:liveDot 1.9s ease-out infinite}'),
    ('@keyframes liveDot{0%{box-shadow:0 0 0 0 rgba(255,48,10,.55)}80%,100%{box-shadow:0 0 0 9px rgba(255,48,10,0)}}',
     '@keyframes liveDot{0%{transform:scale(1);opacity:1}80%,100%{transform:scale(3.25);opacity:0}}'),
])

# 4. Jeda animasi di luar layar ----------------------------------------------------------------------
opt("jeda-luar-layar", [
    ('/* ---------- mulai ---------- */',
     '''/* animasi di bagian yang tidak terlihat dijeda (jalan lagi ±300px sebelum masuk layar) */
(function(){if(!("IntersectionObserver"in window))return;const st=document.createElement("style");
  st.textContent=".k-off,.k-off *,.k-off ::before,.k-off ::after{animation-play-state:paused!important}";document.head.appendChild(st);
  const io=new IntersectionObserver(es=>es.forEach(e=>{const on=e.isIntersecting,t=e.target;
    if(t.pauseAnimations&&t.tagName.toLowerCase()==="svg"){try{on?t.unpauseAnimations():t.pauseAnimations()}catch(x){}}else t.classList.toggle("k-off",!on)}),{rootMargin:"250px"});
  let q=0;const scan=()=>{q=0;io.disconnect();const set=new Set();
    document.querySelectorAll("#root [data-sec],#root .foot").forEach(el=>set.add(el));
    try{document.getAnimations().forEach(a=>{const f=a.effect,t=f&&f.target;if(t&&t.closest&&t.closest("#root")&&f.getTiming().iterations===Infinity)set.add(t)})}catch(x){}
    document.querySelectorAll("#root svg").forEach(g=>{if(g.querySelector("animate,animateTransform,animateMotion"))set.add(g)});
    set.forEach(el=>io.observe(el))};
  const mo=new MutationObserver(()=>{if(!q)q=requestAnimationFrame(scan)});
  const go=()=>{const r=document.getElementById("root");if(r){mo.observe(r,{childList:true});scan()}};
  if(document.getElementById("root"))go();else document.addEventListener("DOMContentLoaded",go)})();
/* ---------- mulai ---------- */'''),
])

# 4b. Kartu foto di tampilan awal hanya bergantian saat terlihat (melanjutkan dari kartu terakhir saat kembali)
opt("kartu-hero", [
    ('if(document.hidden||!deck.isConnected){heroTimer=setTimeout(cycle,iv);return}',
     'if(document.hidden||!deck.isConnected||deck.closest(".k-off")){heroTimer=setTimeout(cycle,iv);return}'),
])

# 5. Foto tertanam → alamat blob (byte sama persis) ----------------------------------------------------
M_SYNC = 'const M=v=>!v?"":((S.media&&S.media[v])||(/^(data:|https:\\/\\/)/.test(String(v))?v:""));'
M_ASLI = 'const M=v=>!v?"":((S.media&&S.media[v])||(/^data:/.test(String(v))?v:""));'
M_BARU_HEAD = '''const MB={};function mURL(k){const d=S.media[k];if(typeof d!=="string"||!/^data:/.test(d))return d;const e=MB[k];if(e&&e.d===d)return e.u;
  try{const i=d.indexOf(","),meta=d.slice(5,i),mime=meta.split(";")[0]||"image/jpeg",raw=/;base64/.test(meta)?atob(d.slice(i+1)):decodeURIComponent(d.slice(i+1));
    const a=new Uint8Array(raw.length);for(let j=0;j<raw.length;j++)a[j]=raw.charCodeAt(j);const u=URL.createObjectURL(new Blob([a],{type:mime}));MB[k]={d,u};return u}catch(x){return d}}
'''
m_old = M_SYNC if s.count(M_SYNC) == 1 else M_ASLI
m_test = "(data:|https:\\/\\/)" if m_old == M_SYNC else "data:"
opt("foto-blob", [
    (m_old, M_BARU_HEAD + 'const M=v=>!v?"":((S.media&&S.media[v]&&mURL(v))||(/^' + m_test + '/.test(String(v))?v:""));'),
])

if not done:
    print("::warning::Tidak ada optimasi HP yang bisa dipasang."); sys.exit(0)
if "tirai" not in done:
    s = s.replace("/* ---------- mulai ---------- */", MARK + "\n/* ---------- mulai ---------- */", 1)
P.write_text(s)
print("OK optimasi HP:", ", ".join(done) + ((" | dilewati: " + ", ".join(skip)) if skip else ""))
