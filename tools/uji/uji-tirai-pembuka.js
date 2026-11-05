// Uji tirai pembuka + data live: tirai harus membuka pelan (bukan hilang mendadak) dan isi tidak berganti di depan mata
// node curtain.js <delayDataMs> [reloads]
const {chromium,devices}=require('playwright');const fs=require('fs');
const W=ms=>new Promise(r=>setTimeout(r,ms));const G='/tmp/claude-0/-home-claude/ff7c566e-7b36-53ac-96e7-ed70e572208b/scratchpad/gsap/node_modules/gsap/dist/';
const base=JSON.parse(fs.readFileSync('/home/claude/521-coffee-cart/data/kdata.json','utf8'));delete base.team;
base.store.web=Object.assign({},base.store.web||{},{hero:{title:"Judul dari aplikasi"}});
const delay=+process.argv[2]||800,loads=+process.argv[3]||2,tag=process.argv[4]||'x';
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({...devices['Pixel 7']});
 await ctx.route('https://cdnjs.cloudflare.com/**',r=>{const f=r.request().url().split('/').pop();r.fulfill({contentType:'text/javascript',body:fs.readFileSync(G+f)})});
 let rev=5;
 await ctx.route('https://coffee521-api.coffee521.workers.dev/kdata.js*',async r=>{await W(delay);if(process.env.FAIL)return r.abort();r.fulfill({contentType:'text/javascript',body:'window.__KREV='+rev+';window.__K='+JSON.stringify(base)+';'})});
 await ctx.route('https://coffee521-api.coffee521.workers.dev/media/**',r=>r.fulfill({contentType:'image/jpeg',body:fs.readFileSync('/home/claude/521-coffee-cart/assets/hero.jpg')}));
 const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
 let fail=0;
 for(let n=0;n<loads;n++){
  if(n>0&&process.env.NEWREV){rev=6;base.store.web.hero.title='Judul aplikasi baru'}
  await p.goto('http://127.0.0.1:8097/index.html',{waitUntil:'commit'});await p.waitForSelector('.hero');const t0=Date.now();const S=[];let prev=null;
  for(let i=0;i<55;i++){const s=await p.evaluate(()=>{const h=document.querySelector('.hero');return{cg:!!(h&&h.classList.contains('curtain-go')),cl:h?h.style.getPropertyValue('--close'):'',title:(document.querySelector('.hero .h1')||{}).textContent||'',ph:window.__k521intro|0}});
    s.t=Date.now()-t0;S.push(s);if(n===0&&[3,8,14,20,30].includes(i))await p.screenshot({path:`/home/claude/work/v21/cur_${tag}_${n}_${i}.png`});await W(90)}
  if(process.env.TRACE)console.log(S.map(s=>s.t+':'+(s.cl||'-').slice(0,4)+(s.cg?'':'*')+'p'+s.ph+(s.title[0]==='J'?'J':'')).join(' '));
  // analisis: tirai tertutup (--close≈1) lalu harus turun bertahap; lompatan besar (>0.35 dalam satu sampel) = hilang mendadak
  let jump=0,vis=[];for(let i=1;i<S.length;i++){const a=parseFloat(S[i-1].cl),c=parseFloat(S[i].cl);const dt=(S[i].t-S[i-1].t)/1000;if(!isNaN(a)&&!isNaN(c)&&a-c>0.2&&(a-c)/dt>3)jump++;
    if(S[i-1].cg&&!S[i].cg&&parseFloat(S[i-1].cl)>0.05&&S[i].ph<2)jump++;
    if(S[i].title!==S[i-1].title)vis.push({t:S[i].t,cl:S[i-1].cl,from:S[i-1].title.slice(0,20),to:S[i].title.slice(0,20)})}
  // judul berganti saat tirai tidak menutup penuh = terlihat pengunjung
  const seen=process.env.LATE?[]:vis.filter(v=>parseFloat(v.cl)<0.98||v.cl==='');
  const first=S[0].title,last=S[S.length-1].title;
  const want=process.env.FAIL?/teman/:(n>0&&process.env.NEWREV)?/baru/:/aplikasi/;const ok=!jump&&!seen.length&&want.test(last);if(!ok)fail++;
  console.log(`[${tag}] muat#${n+1}: lompatan tirai=${jump} gantiJudulTerlihat=${seen.length} judulAwal="${first.slice(0,24)}" judulAkhir="${last.slice(0,24)}" closeTrace=${S.filter((_,i)=>i%5===0).map(s=>(s.cl||'-').slice(0,4)+(s.cg?'':'*')).join(',')} ${ok?'OK':'GAGAL'}`);
  if(seen.length)console.log('   terlihat:',JSON.stringify(seen));
 }
 console.log('errors',errs);console.log(fail?'HASIL: GAGAL':'HASIL: LULUS');await b.close();process.exit(fail?1:0)})();
