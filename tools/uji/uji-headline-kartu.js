// Uji v3: keterangan kartu menu, foto kartu, dan headline Kabar persis dari aplikasi (tanpa sisa isi lama website)
// Jalankan: node tools/uji/uji-headline-kartu.js  (website disajikan di http://127.0.0.1:8097)
const {chromium,devices}=require('playwright');const fs=require('fs');const W=ms=>new Promise(r=>setTimeout(r,ms));
const G='/tmp/claude-0/-home-claude/ff7c566e-7b36-53ac-96e7-ed70e572208b/scratchpad/gsap/node_modules/gsap/dist/';
const JPG=fs.readFileSync('/home/claude/521-coffee-cart/assets/hero.jpg');
let fails=0;const ok=(c,m)=>{console.log((c?'  ✔ ':'  ✘ GAGAL: ')+m);if(!c)fails++};
const K=(over)=>Object.assign({store:{name:'521 Coffee Cart',web:{}},menu:[
  {n:'Palm Sugar',p:15000,c:'Kopi Susu',s:'170 ml',lb:'Kopi Susu Botol · 250 ml',img:'media/'+'a'.repeat(32)+'.jpg'},
  {n:'Butterscotch',p:20000,c:'Kopi Susu',s:'170 ml',lb:''},
  {n:'Black Caffe',p:13000,c:'Coffee'},                       // tanpa ukuran di aplikasi → tidak boleh memakai "180 ml" lama
  {n:'Menu Baru',p:18000,c:'Non Coffee',s:'200 ml'}],
  posts:[{id:'k1',type:'promo',title:'Promo lama',created:'2026-11-01'},{id:'k2',type:'event',title:'Nobar Final LIPIA',date:'2099-01-01',created:'2026-10-01'},{id:'k3',type:'news',title:'Kabar terbaru',date:'2026-11-05',created:'2026-11-05'}]},over||{});
(async()=>{const b=await chromium.launch();
 async function load(k){const ctx=await b.newContext({...devices['Pixel 7']});
  await ctx.route('https://cdnjs.cloudflare.com/**',r=>{const f=r.request().url().split('/').pop();r.fulfill({contentType:'text/javascript',body:fs.readFileSync(G+f)})});
  await ctx.route('https://coffee521-api.coffee521.workers.dev/kdata.js*',r=>r.fulfill({contentType:'text/javascript',body:'window.__KREV=9;window.__K='+JSON.stringify(k)+';'}));
  await ctx.route('https://coffee521-api.coffee521.workers.dev/media/**',r=>r.fulfill({contentType:'image/jpeg',body:JPG}));
  const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));await p.goto('http://127.0.0.1:8097/index.html');await W(4500);p.errs=errs;return p}
 const cards=p=>p.evaluate(()=>Object.fromEntries([...document.querySelectorAll('.pc')].map(f=>[f.querySelector('.pc-n').textContent,{sub:f.querySelector('.pc-sub').textContent,img:(f.querySelector('.pc-in img')||{}).src||''}])));
 const head=p=>p.evaluate(()=>{const t=document.querySelector('.nh-t');return t?t.textContent:''});
 console.log('1) Kartu menu');
 let p=await load(K());let C=await cards(p);
 ok(C['Palm Sugar'].sub==='Kopi Susu Botol · 250 ml','keterangan tulisan sendiri');
 ok(/coffee521-api.*\/media\/a{32}\.jpg$/.test(C['Palm Sugar'].img),'foto dari aplikasi');
 ok(C['Butterscotch'].sub==='','tanpa keterangan');
 ok(C['Butterscotch'].img!==''&&!/coffee521-api/.test(C['Butterscotch'].img),'tanpa foto dari aplikasi → foto bawaan website');
 ok(C['Black Caffe'].sub==='Coffee','ukuran kosong di aplikasi → tidak memakai ukuran lama website: "'+C['Black Caffe'].sub+'"');
 ok(C['Menu Baru'].sub==='Non Coffee · 200 ml','menu baru dari aplikasi');
 console.log('2) Headline');
 ok(await head(p)==='Kabar terbaru','otomatis (aplikasi belum memilih) = kabar terbaru: '+await head(p));
 ok(p.errs.length===0,'tanpa error JS');await p.context().close();
 p=await load(K({store:{name:'521',web:{news:{headMode:'pick',headId:'k2'}}}}));ok(await head(p)==='Nobar Final LIPIA','pilih kabar tertentu: '+await head(p));await p.context().close();
 p=await load(K({store:{name:'521',web:{news:{headMode:'off'}}}}));ok(await head(p)==='','tanpa headline');await p.context().close();
 p=await load(K({store:{name:'521',web:{news:{headMode:'pick',headId:'hilang'}}}}));ok(await head(p)==='Kabar terbaru','kabar pilihan sudah dihapus → kembali otomatis');await p.context().close();
 console.log(fails?'\nHASIL: '+fails+' GAGAL':'\nSEMUA LULUS');await b.close();process.exit(fails?1:0)})();
