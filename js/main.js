(function(){
"use strict";

/* ══════════════════════════════════════════
   CURSOR — always-visible dot + ring
   Colour CONTINUOUSLY cycles burgundy→gold→burgundy
   Cycle speeds up on mouse movement
══════════════════════════════════════════ */
const cc=document.getElementById('cc'),ctx=cc.getContext('2d');
let W=window.innerWidth,H=window.innerHeight;
cc.width=W;cc.height=H;
window.addEventListener('resize',()=>{W=window.innerWidth;H=window.innerHeight;cc.width=W;cc.height=H;});

let mx=W/2,my=H/2,pmx=mx,pmy=my,spd=0;
const pts=[];
let cycleT=0;

window.addEventListener('mousemove',e=>{
  pmx=mx;pmy=my;mx=e.clientX;my=e.clientY;
  const dx=mx-pmx,dy=my-pmy;
  spd=Math.sqrt(dx*dx+dy*dy);
});

function lerpColor(t){
  const r=Math.round(107+t*(201-107));
  const g=Math.round(30 +t*(150-30));
  const b=Math.round(46 +t*(58-46));
  return {r,g,b};
}

class P{
  constructor(x,y,vx,vy,s){
    this.x=x;this.y=y;
    this.vx=vx+(Math.random()-.5)*1.1;
    this.vy=vy+(Math.random()-.5)*1.1;
    this.ph=Math.random()*Math.PI*2;
    this.amp=(.3+Math.random()*.65)*Math.min(s*.15,5);
    this.fq=.08+Math.random()*.07;
    const ct=Math.max(0,Math.min(1,cycleT+(Math.random()-.5)*.3));
    const c=lerpColor(0.5-0.5*Math.cos(ct*Math.PI*2));
    this.r=c.r;this.g=c.g;this.b=c.b;
    this.al=.45+Math.random()*.3;
    this.sz=1.1+Math.random()*2;
    this.dc=.021+Math.random()*.02;
    this.life=1;this.tick=0;
    const len=Math.sqrt(vx*vx+vy*vy)||1;
    this.nx=-vy/len;this.ny=vx/len;
  }
  update(){
    this.tick++;this.ph+=this.fq;
    const osc=Math.sin(this.ph)*this.amp*Math.exp(-this.tick*.034);
    this.x+=this.vx*.67+this.nx*osc;
    this.y+=this.vy*.67+this.ny*osc;
    this.life-=this.dc;this.al*=.963;
    this.vx*=.91;this.vy*=.91;
  }
  draw(){
    ctx.beginPath();ctx.arc(this.x,this.y,this.sz*this.life,0,Math.PI*2);
    ctx.fillStyle=`rgba(${this.r},${this.g},${this.b},${this.al*this.life})`;ctx.fill();
  }
  dead(){return this.life<=.01;}
}

let ls=0;
window.addEventListener('mousemove',e=>{
  const now=performance.now();
  if(now-ls<15)return;ls=now;
  const dx=mx-pmx,dy=my-pmy;
  const cnt=Math.min(2+Math.floor(spd*.2),6);
  for(let i=0;i<cnt;i++) pts.push(new P(e.clientX,e.clientY,dx*.27,dy*.27,spd));
});

function loop(){
  ctx.clearRect(0,0,W,H);
  // advance cycle — base slow pulse, faster with movement
  const boost=Math.min(spd*.0012,.018);
  cycleT+=(0.004+boost);
  if(cycleT>1) cycleT=0;
  spd*=.84;
  const displayT=0.5-0.5*Math.cos(cycleT*Math.PI*2);
  const c=lerpColor(displayT);
  for(let i=pts.length-1;i>=0;i--){
    pts[i].update();pts[i].draw();
    if(pts[i].dead())pts.splice(i,1);
  }
  // outer ring
  ctx.beginPath();ctx.arc(mx,my,13,0,Math.PI*2);
  ctx.strokeStyle=`rgba(${c.r},${c.g},${c.b},.35)`;
  ctx.lineWidth=1.5;ctx.stroke();
  // solid dot — always visible
  ctx.beginPath();ctx.arc(mx,my,4,0,Math.PI*2);
  ctx.fillStyle=`rgb(${c.r},${c.g},${c.b})`;
  ctx.fill();
  requestAnimationFrame(loop);
}
loop();

/* ══ VOLATILITY STRIP ══ */
const vs=document.getElementById('volstrip'),vctx=vs.getContext('2d');
function drawVol(){
  const vW=vs.offsetWidth||window.innerWidth;
  vs.width=vW;vs.height=52;
  const g=vctx.createLinearGradient(0,0,0,52);
  g.addColorStop(0,'#F5F0E8');g.addColorStop(1,'#EDE7D9');
  vctx.fillStyle=g;vctx.fillRect(0,0,vW,52);
  const lines=[
    {amp:9, freq:.018,phase:0,   color:'rgba(107,30,46,.52)',lw:1.5},
    {amp:5, freq:.030,phase:1.4, color:'rgba(201,150,58,.36)',lw:1},
    {amp:13,freq:.011,phase:2.7, color:'rgba(107,30,46,.15)',lw:2.5},
  ];
  function env(x){return 1+.6*Math.sin(x*.005)*Math.cos(x*.0019);}
  lines.forEach(l=>{
    vctx.beginPath();vctx.strokeStyle=l.color;vctx.lineWidth=l.lw;vctx.lineJoin='round';
    for(let x=0;x<=vW;x++){
      const e=env(x);
      const y=26+Math.sin(x*l.freq+l.phase)*l.amp*e+Math.sin(x*l.freq*2.1+l.phase*.55)*l.amp*.32*e;
      x===0?vctx.moveTo(x,y):vctx.lineTo(x,y);
    }
    vctx.stroke();
  });
}
drawVol();
window.addEventListener('resize',drawVol);

/* ══ TYPING ══ */
const phrases=['monetary transmission mechanisms','financial frictions in emerging markets','central bank communication & markets','DSGE models with credit constraints','fiscal-monetary policy interactions'];
const tel=document.getElementById('tt');
let pi=0,ci=0,del=false,pau=false;
function type(){
  if(!tel)return;
  const cur=phrases[pi];
  if(pau){setTimeout(type,1950);pau=false;return;}
  if(!del){
    tel.textContent=cur.slice(0,++ci);
    if(ci===cur.length){pau=true;del=true;setTimeout(type,1950);return;}
    setTimeout(type,44);
  }else{
    tel.textContent=cur.slice(0,--ci);
    if(ci===0){del=false;pi=(pi+1)%phrases.length;setTimeout(type,350);return;}
    setTimeout(type,24);
  }
}
setTimeout(type,800);

/* ══ SCROLL REVEAL ══ */
const revs=document.querySelectorAll('.rev');
const obs=new IntersectionObserver(entries=>{
  entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('vis');obs.unobserve(e.target);}});
},{threshold:.08,rootMargin:'0px 0px -28px 0px'});
revs.forEach(el=>obs.observe(el));

/* ══ ABSTRACTS ══ */
document.querySelectorAll('.abt').forEach(btn=>{
  btn.addEventListener('click',()=>{
    const exp=btn.getAttribute('aria-expanded')==='true';
    btn.setAttribute('aria-expanded',String(!exp));
    btn.nextElementSibling.hidden=exp;
  });
});

/* ══ MOBILE MENU ══ */
const hbtn=document.getElementById('hbtn'),mobMenu=document.getElementById('mobMenu');
if(hbtn&&mobMenu){
  hbtn.addEventListener('click',()=>{
    const open=mobMenu.classList.toggle('open');
    const sp=hbtn.querySelectorAll('span');
    if(open){sp[0].style.transform='translateY(6.5px) rotate(45deg)';sp[1].style.opacity='0';sp[2].style.transform='translateY(-6.5px) rotate(-45deg)';}
    else{sp[0].style.transform='';sp[1].style.opacity='';sp[2].style.transform='';}
  });
  document.querySelectorAll('.mob-lnk').forEach(l=>l.addEventListener('click',()=>{
    mobMenu.classList.remove('open');
    const sp=hbtn.querySelectorAll('span');
    sp[0].style.transform='';sp[1].style.opacity='';sp[2].style.transform='';
  }));
}

})();
