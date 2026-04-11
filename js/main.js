(function(){

  /* ── 1. CSS Cursor ── */
  var dot  = document.getElementById('cursor-dot');
  var ring = document.getElementById('cursor-ring');
  var mx = window.innerWidth/2, my = window.innerHeight/2;
  var rx = mx, ry = my;
  var visible = false;
  var hue = 42;

  window.addEventListener('mousemove', function(e){ mx=e.clientX; my=e.clientY; visible=true; if(dot){dot.style.left=mx+'px';dot.style.top=my+'px';} });
  window.addEventListener('mouseout',  function(e){ if(!e.relatedTarget&&!e.toElement) visible=false; });
  window.addEventListener('mouseenter',function(){ visible=true; });

  (function cursorLoop(){
    hue=(hue+0.4)%360;
    rx+=(mx-rx)*0.13; ry+=(my-ry)*0.13;
    if(ring){
      ring.style.left=rx+'px'; ring.style.top=ry+'px';
      var r=Math.round(180+60*Math.sin(hue*Math.PI/180));
      var g=Math.round(100+50*Math.sin((hue+120)*Math.PI/180));
      var b=Math.round(50+80*Math.sin((hue+240)*Math.PI/180));
      ring.style.borderColor='rgba('+r+','+g+','+b+',0.9)';
      ring.style.boxShadow='0 0 12px 2px rgba('+r+','+g+','+b+',0.35)';
    }
    if(dot&&visible){
      var dr=Math.round(210+45*Math.sin((hue+60)*Math.PI/180));
      var dg=Math.round(140+40*Math.sin((hue+180)*Math.PI/180));
      var db=Math.round(30+60*Math.sin((hue+300)*Math.PI/180));
      dot.style.background='rgb('+dr+','+dg+','+db+')';
      dot.style.boxShadow='0 0 8px 3px rgba('+dr+','+dg+','+db+',0.7)';
    }
    requestAnimationFrame(cursorLoop);
  })();

  /* ── 2. Create a NEW canvas on top of everything for the network ── */
  var nc = document.createElement('canvas');
  nc.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:99997;';
  document.body.appendChild(nc);
  var ctx = nc.getContext('2d');
  var W = window.innerWidth, H = window.innerHeight;
  nc.width=W; nc.height=H;

  window.addEventListener('resize',function(){
    W=window.innerWidth; H=window.innerHeight;
    nc.width=W; nc.height=H;
    initBg();
  });

  /* ── Background ambient nodes ── */
  var bgNodes=[];
  function initBg(){
    bgNodes=[];
    for(var i=0;i<60;i++){
      bgNodes.push({
        x:Math.random()*W, y:Math.random()*H,
        vx:(Math.random()-.5)*0.22, vy:(Math.random()-.5)*0.22,
        r:1.5+Math.random()*2, pulse:Math.random()*Math.PI*2
      });
    }
  }
  initBg();

  /* ── Trail nodes spawned by cursor ── */
  var trail=[];
  var MAX_TRAIL=40;
  var prevMx=mx, prevMy=my, spawnAcc=0;

  /* ── Main draw loop ── */
  function draw(){
    requestAnimationFrame(draw);
    ctx.clearRect(0,0,W,H);

    /* move bg nodes */
    for(var i=0;i<bgNodes.length;i++){
      var n=bgNodes[i];
      n.x+=n.vx; n.y+=n.vy; n.pulse+=0.02;
      if(n.x<0||n.x>W)n.vx*=-1;
      if(n.y<0||n.y>H)n.vy*=-1;
      if(visible){
        var cdx=n.x-mx,cdy=n.y-my,cd=Math.sqrt(cdx*cdx+cdy*cdy);
        if(cd<110){var f=(1-cd/110)*0.014;n.vx+=cdx*f;n.vy+=cdy*f;}
        var sp=Math.sqrt(n.vx*n.vx+n.vy*n.vy);
        if(sp>0.6){n.vx*=0.6/sp;n.vy*=0.6/sp;}
      }
    }

    /* bg node connections */
    for(var i=0;i<bgNodes.length;i++){
      for(var j=i+1;j<bgNodes.length;j++){
        var dx=bgNodes[i].x-bgNodes[j].x,dy=bgNodes[i].y-bgNodes[j].y;
        var d=Math.sqrt(dx*dx+dy*dy);
        if(d<130){
          ctx.beginPath();
          ctx.moveTo(bgNodes[i].x,bgNodes[i].y);
          ctx.lineTo(bgNodes[j].x,bgNodes[j].y);
          ctx.strokeStyle='rgba(107,30,46,'+(0.12*(1-d/130))+')';
          ctx.lineWidth=0.7;
          ctx.stroke();
        }
      }
    }

    /* bg nodes draw */
    for(var i=0;i<bgNodes.length;i++){
      var n=bgNodes[i];
      var a=0.3+0.15*Math.sin(n.pulse);
      ctx.beginPath(); ctx.arc(n.x,n.y,n.r,0,Math.PI*2);
      ctx.fillStyle='rgba(107,30,46,'+a+')'; ctx.fill();
      if(visible){
        var cdx=n.x-mx,cdy=n.y-my,cd=Math.sqrt(cdx*cdx+cdy*cdy);
        if(cd<120){
          ctx.beginPath(); ctx.arc(n.x,n.y,n.r*3,0,Math.PI*2);
          ctx.fillStyle='rgba(201,150,58,'+(0.22*(1-cd/120))+')'; ctx.fill();
        }
      }
    }

    /* spawn trail node every 16px of movement */
    var dmx=mx-prevMx,dmy=my-prevMy,dist=Math.sqrt(dmx*dmx+dmy*dmy);
    if(visible&&dist>0.2){ spawnAcc+=dist; }
    if(spawnAcc>=16&&visible){
      trail.push({x:mx,y:my,vx:(Math.random()-.5)*0.3,vy:(Math.random()-.5)*0.3,life:1,decay:0.003+Math.random()*0.002,r:2.5+Math.random()*2});
      if(trail.length>MAX_TRAIL) trail.shift();
      spawnAcc=0;
    }
    prevMx=mx; prevMy=my;

    /* age trail */
    for(var i=0;i<trail.length;i++){
      trail[i].life-=trail[i].decay;
      trail[i].x+=trail[i].vx; trail[i].y+=trail[i].vy;
    }
    /* remove dead */
    for(var i=trail.length-1;i>=0;i--){ if(trail[i].life<=0) trail.splice(i,1); }

    /* trail-to-trail connections — THE NETWORK */
    for(var i=0;i<trail.length;i++){
      for(var j=i+1;j<trail.length;j++){
        var dx=trail[i].x-trail[j].x,dy=trail[i].y-trail[j].y;
        var d=Math.sqrt(dx*dx+dy*dy);
        if(d<100){
          var a=Math.min(trail[i].life,trail[j].life)*0.7*(1-d/100);
          ctx.beginPath();
          ctx.moveTo(trail[i].x,trail[i].y);
          ctx.lineTo(trail[j].x,trail[j].y);
          ctx.strokeStyle='rgba(201,150,58,'+a+')';
          ctx.lineWidth=1.0;
          ctx.stroke();
        }
      }
      /* trail connects to bg nodes */
      for(var j=0;j<bgNodes.length;j++){
        var dx=trail[i].x-bgNodes[j].x,dy=trail[i].y-bgNodes[j].y;
        var d=Math.sqrt(dx*dx+dy*dy);
        if(d<85){
          var a=trail[i].life*0.35*(1-d/85);
          ctx.beginPath();
          ctx.moveTo(trail[i].x,trail[i].y);
          ctx.lineTo(bgNodes[j].x,bgNodes[j].y);
          ctx.strokeStyle='rgba(107,30,46,'+a+')';
          ctx.lineWidth=0.7; ctx.stroke();
        }
      }
    }

    /* draw trail nodes */
    for(var i=0;i<trail.length;i++){
      var t=trail[i];
      /* outer glow */
      ctx.beginPath(); ctx.arc(t.x,t.y,t.r*t.life*3,0,Math.PI*2);
      ctx.fillStyle='rgba(201,150,58,'+(t.life*0.07)+')'; ctx.fill();
      /* core dot */
      ctx.beginPath(); ctx.arc(t.x,t.y,t.r*t.life,0,Math.PI*2);
      ctx.fillStyle='rgba(201,150,58,'+(t.life*0.95)+')'; ctx.fill();
    }

    /* live edge: cursor → last trail node */
    if(visible&&trail.length>0){
      var last=trail[trail.length-1];
      ctx.beginPath(); ctx.moveTo(mx,my); ctx.lineTo(last.x,last.y);
      ctx.strokeStyle='rgba(201,150,58,'+(last.life*0.5)+')';
      ctx.lineWidth=1.2; ctx.stroke();
    }
  }
  draw();

  /* ── Volume strip (original #cc canvas) ── */
  var vs=document.getElementById('volstrip');
  if(vs){
    var vx=vs.getContext('2d');
    function dv(){var vW=vs.offsetWidth||window.innerWidth;vs.width=vW;vs.height=52;var g=vx.createLinearGradient(0,0,0,52);g.addColorStop(0,'#F5F0E8');g.addColorStop(1,'#EDE7D9');vx.fillStyle=g;vx.fillRect(0,0,vW,52);var L=[{a:9,f:.018,p:0,c:'rgba(107,30,46,.52)',w:1.5},{a:5,f:.030,p:1.4,c:'rgba(201,150,58,.36)',w:1},{a:13,f:.011,p:2.7,c:'rgba(107,30,46,.15)',w:2.5}];function en(x){return 1+.6*Math.sin(x*.005)*Math.cos(x*.0019);}L.forEach(function(l){vx.beginPath();vx.strokeStyle=l.c;vx.lineWidth=l.w;vx.lineJoin='round';for(var x=0;x<=vW;x++){var e=en(x),y=26+Math.sin(x*l.f+l.p)*l.a*e+Math.sin(x*l.f*2.1+l.p*.55)*l.a*.32*e;x===0?vx.moveTo(x,y):vx.lineTo(x,y);}vx.stroke();});} dv();window.addEventListener('resize',dv);
  }

  /* ── Typing ── */
  var ph=['monetary transmission mechanisms','financial frictions in emerging markets','central bank communication & markets','DSGE models with credit constraints','fiscal-monetary policy interactions'];
  var tel=document.getElementById('tt'),pi=0,ci=0,isDel=false,pau=false;
  function type(){if(!tel)return;var cur=ph[pi];if(pau){setTimeout(type,1950);pau=false;return;}if(!isDel){tel.textContent=cur.slice(0,++ci);if(ci===cur.length){pau=true;isDel=true;setTimeout(type,1950);return;}setTimeout(type,44);}else{tel.textContent=cur.slice(0,--ci);if(ci===0){isDel=false;pi=(pi+1)%ph.length;setTimeout(type,350);return;}setTimeout(type,24);}}
  setTimeout(type,800);

  /* ── Scroll reveal ── */
  var revs=document.querySelectorAll('.rev');
  var obs=new IntersectionObserver(function(entries){entries.forEach(function(e){if(e.isIntersecting){e.target.classList.add('vis');obs.unobserve(e.target);}});},{threshold:.08,rootMargin:'0px 0px -28px 0px'});
  revs.forEach(function(el){obs.observe(el);});

  /* ── Abstract toggles ── */
  document.querySelectorAll('.abt').forEach(function(btn){btn.addEventListener('click',function(){var exp=btn.getAttribute('aria-expanded')==='true';btn.setAttribute('aria-expanded',String(!exp));btn.nextElementSibling.hidden=exp;});});

  /* ── Hamburger ── */
  var hbtn=document.getElementById('hbtn'),mm=document.getElementById('mobMenu');
  if(hbtn&&mm){hbtn.addEventListener('click',function(){var o=mm.classList.toggle('open');var sp=hbtn.querySelectorAll('span');if(o){sp[0].style.transform='translateY(6.5px) rotate(45deg)';sp[1].style.opacity='0';sp[2].style.transform='translateY(-6.5px) rotate(-45deg)';}else{sp[0].style.transform='';sp[1].style.opacity='';sp[2].style.transform='';}});document.querySelectorAll('.mob-lnk').forEach(function(l){l.addEventListener('click',function(){mm.classList.remove('open');var sp=hbtn.querySelectorAll('span');sp[0].style.transform='';sp[1].style.opacity='';sp[2].style.transform='';});});}
})();
