"""Sinkron website ↔ aplikasi 521 (Atur & Kabar di HP Owner). Sekali jalan, aman diulang.
Website mengambil https://coffee521-api.coffee521.workers.dev/kdata.js (data yang diterbitkan HP Owner) lalu menimpa:
nama toko, tagline, lokasi, jam & jadwal buka, WhatsApp, Instagram, Maps, menu & harga (+ habis), promo/diskon/kabar/kegiatan,
testimoni, reseller, link ShopeeFood/GoFood/GrabFood, dan teks khusus website (Atur → Website).
Desain, foto, ikon, dan susunan halaman tetap dari web/index.html. Bila server tidak bisa dihubungi, isi bawaan tetap tampil."""
import pathlib, sys
P = pathlib.Path(__file__).resolve().parents[1] / "web/index.html"
s = P.read_text()
if "/*SINKRON-APLIKASI*/" in s:
    print("Sudah dipatch."); sys.exit(0)

def rep(old, new, count=1):
    global s
    n = s.count(old)
    if n != count:
        raise SystemExit(f"Jumlah cocok {n} != {count}: {old[:120]}")
    s = s.replace(old, new)

# foto dari server aplikasi (https) juga boleh dipakai
rep('const M=v=>!v?"":((S.media&&S.media[v])||(/^data:/.test(String(v))?v:""));',
    'const M=v=>!v?"":((S.media&&S.media[v])||(/^(data:|https:\\/\\/)/.test(String(v))?v:""));')
# menu yang ditandai Habis di kasir
rep('can=S.order.on&&it.order!==false,q=cart[it.id]||0', 'can=S.order.on&&it.order!==false&&!it.out,q=cart[it.id]||0')
rep("""+'<span>Pesan</span>'+(q?'<em>'+q+'</em>':"")+'</button>':"")+'</div></figcaption></figure>';""",
    """+'<span>Pesan</span>'+(q?'<em>'+q+'</em>':"")+'</button>':it.out?'<span class="pc-out">Habis hari ini</span>':"")+'</div></figcaption></figure>';""")
rep('const oItems=()=>S.menu.items.filter(m=>m.show!==false&&m.order!==false);', 'const oItems=()=>S.menu.items.filter(m=>m.show!==false&&m.order!==false&&!m.out);')
rep('.pc-add{--ring:rgba(255,48,10,.65)}', '.pc-out{flex:none;display:inline-flex;align-items:center;height:34px;padding:0 12px;border-radius:999px;background:rgba(10,10,10,.82);color:#fff;font:700 13px var(--f-d)}.pc-add{--ring:rgba(255,48,10,.65)}')

LIVE = r'''/*SINKRON-APLIKASI*/
/* ---------- data langsung dari aplikasi 521 (Atur & Kabar di HP Owner) ---------- */
const API="https://coffee521-api.coffee521.workers.dev";
let liveRev=0,liveWait=false;
const absU=u=>{u=String(u||"");return /^(https:|data:image\/)/.test(u)?u:/^media\/[a-f0-9]{32}\.(jpg|png|webp|gif|avif)$/.test(u)?API+"/"+u:""};
const str=v=>typeof v==="string"?v.trim():"";
const lc=v=>String(v||"").trim().toLowerCase();
function applyLive(K){
  if(!K||typeof K!=="object"||!K.store)return false;const st=K.store,Wb=st.web&&typeof st.web==="object"?st.web:{};
  ["name","tagline","place","hours","wa","ig","maps"].forEach(k=>{const v=str(st[k]);if(v)S.store[k]=v});
  if(Array.isArray(st.sched)&&st.sched.length===7)S.store.sched=st.sched.map(x=>({on:!!(x&&x.on),o:/^\d{2}:\d{2}$/.test(x&&x.o)?x.o:"05:00",c:/^\d{2}:\d{2}$/.test(x&&x.c)?x.c:"21:00"}));
  if(Array.isArray(K.menu)&&K.menu.length){const old=S.menu.items;
    S.menu.items=K.menu.filter(m=>m&&str(m.n)).slice(0,40).map((m,i)=>{const o=old.find(x=>lc(x.n)===lc(m.n));
      const it=o?Object.assign({},o):{id:"app-"+lc(m.n).replace(/[^a-z0-9]+/g,"-")+"-"+i,glyph:"",lead:"",after:"",show:true,order:true,col:/^#[0-9a-f]{6}$/i.test(m.col)?m.col:"#FF300A",img:absU(m.img)};
      it.n=str(m.n);it.p=Number(m.p)||0;["c","s","d"].forEach(k=>{if(str(m[k]))it[k]=str(m[k])});it.out=!!m.o;return it})}
  if(Array.isArray(K.posts)){const old=new Map(S.news.posts.map(p=>[p.id,p]));
    S.news.posts=K.posts.filter(p=>p&&p.id&&!p.draft).slice(0,40).map(p=>{const o=old.get(p.id)||{},x={};
      ["id","type","title","body","badge","start","end","date","time","place","code","created"].forEach(k=>x[k]=p[k]==null?"":String(p[k]));
      x.dval=Number(p.dval)||0;x.img=absU(p.img)||(o.img&&M(o.img)?o.img:"");x.draft=false;return x})}
  if(Array.isArray(st.testi)){const old=new Map(S.testi.items.map(t=>[t.id,t]));
    S.testi.items=st.testi.filter(t=>t&&!t.draft&&str(t.text)).slice(0,30).map(t=>({id:t.id||"t"+uid(),name:str(t.name),role:str(t.role),text:str(t.text),stars:Math.max(0,Math.min(5,+t.stars||5)),img:absU(t.img)||((old.get(t.id)||{}).img||""),draft:false}))}
  const O=st.order&&typeof st.order==="object"?st.order:null;
  if(O&&Array.isArray(O.resellers)){const old=S.resellers;
    S.resellers=O.resellers.filter(r=>r&&str(r.n)&&/^(0|62)8\d{7,12}$/.test(String(r.wa||"").replace(/\D/g,""))).map((r,i)=>{const o=old.find(x=>lc(x.name)===lc(r.n))||{};
      return{id:o.id||"r-"+i,name:str(r.n),area:str(r.w)||o.area||"",wa:str(r.wa),maps:/^https:\/\//.test(str(r.maps))?str(r.maps):(o.maps||""),note:str(r.loc)||o.note||"",on:true}})}
  if(O&&Array.isArray(O.shops))O.shops.forEach(x=>{const u=safeUrl(x&&x.url),lb=lc(x&&x.label);if(!lb)return;const c=S.order.channels.find(c=>lc(c.name)===lb||lb.indexOf(lc(c.id))===0);
    if(c){c.url=u;c.on=!!u}else if(u)S.order.channels.push({id:"ch"+uid(),name:str(x.label),url:u,on:true,hint:"Harga di aplikasi bisa berbeda."})});
  const T=(o,k,v)=>{v=str(v);if(v)o[k]=v.slice(0,1500)};
  if(Wb.hero)["eyebrow","title","sub","cta1","cta2"].forEach(k=>T(S.hero,k,Wb.hero[k]));
  if(Array.isArray(Wb.strip)&&Wb.strip.length)S.strip.items=Wb.strip.map(str).filter(Boolean).slice(0,12);
  if(Wb.story)["title","soft","body"].forEach(k=>T(S.story,k,Wb.story[k]));
  if(Wb.menu)["title","sub"].forEach(k=>T(S.menu,k,Wb.menu[k]));
  if(Wb.news)["title","sub"].forEach(k=>T(S.news,k,Wb.news[k]));
  if(Wb.testi)T(S.testi,"title",Wb.testi.title);
  if(Wb.visit)T(S.visit,"sub",Wb.visit.sub);
  if(Wb.footer)T(S.footer,"bio",Wb.footer.bio);
  if(Wb.show&&typeof Wb.show==="object")Object.keys(S.layout.show).forEach(k=>{if(k!=="hero")S.layout.show[k]=Wb.show[k]!==false});
  return true}
function liveRender(){if(opOpen||SV.on||$("#modal").innerHTML||cfgOpen){liveWait=true;return}liveWait=false;const y=window.scrollY;render();renderOrder();window.scrollTo(0,y);refreshST()}
function liveLoad(){if(window.claude&&claude.use)return;/* di editor Claude: pakai isi editor */
  const sc=document.createElement("script");sc.src=API+"/kdata.js?t="+Math.floor(Date.now()/30000);sc.async=true;
  sc.onload=()=>{sc.remove();const rev=+window.__KREV||0;if(!rev||rev===liveRev)return;liveRev=rev;try{if(applyLive(window.__K))liveRender()}catch(e){}};
  sc.onerror=()=>sc.remove();document.head.appendChild(sc)}
window.__k521={liveLoad,liveRender,st:()=>({S,opOpen,liveWait}),setOp:v=>{opOpen=v}};/* untuk uji otomatis */
'''
rep("/* ---------- mulai ---------- */", LIVE + "\n/* ---------- mulai ---------- */")
rep("render();renderOrder();brewLoop(true);firstPaint=false;",
    "render();renderOrder();brewLoop(true);firstPaint=false;\nliveLoad();setInterval(()=>{if(document.visibilityState==='visible')liveLoad();else if(liveWait)liveRender()},60000);\ndocument.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')liveLoad()});")
P.write_text(s)
print("OK: website kini mengikuti data aplikasi 521.")
