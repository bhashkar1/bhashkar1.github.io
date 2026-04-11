(function(){
  /* CSS-based cursor — always visible, no canvas issues */
  var dot  = document.getElementById('cursor-dot');
  var ring = document.getElementById('cursor-ring');
  var hue = 0;
  var mx = -500, my = -500;
  var rx = -500, ry = -500;
  var visible = false;

  window.addEventListener('mousemove', function(e){
    mx = e.clientX; my = e.clientY;
    if(!visible){ rx=mx; ry=my; visible=true; }
    if(dot){  dot.style.left  = mx+'px'; dot.style.top  = my+'px'; }
  });
  window.addEventListener('mouseout', function(e){
    if(!e.relatedTarget && !e.toElement){ visible=false; if(dot){dot.style.top='-100px';} if(ring){ring.style.top='-100px';} }
  });

  /* Color cycling loop */
  function colorLoop(){
    hue = (hue + 1.2) % 360;
    if(visible){
      /* ease ring toward cursor */
      rx += (mx - rx) * 0.12;
      ry += (my - ry) * 0.12;
      if(ring){ ring.style.left=rx+'px'; ring.style.top=ry+'px'; ring.style.borderColor='hsla('+hue+',80%,60%,0.8)'; }
      if(dot){ dot.style.background='hsl('+hue+',90%,62%)'; }
    }
    requestAnimationFrame(colorLoop);
  }
  colorLoop();

  /* Canvas particle trail */
  var cc = document.getElementById('cc');
  if(cc){
    var ctx = cc.getContext('2d');
    var W = window.innerWidth, H = window.innerHeight;
    cc.width=W; cc.height=H;
    window.addEventListener('resize',function(){ W=window.innerWidth; H=window.innerHeight; cc.width=W; cc.height=H; });

    var particles=[], prevMx=-500, prevMy=-500;

    function Particle(x,y,vx,vy,h){
      this.x=x; this.y=y;
      this.vx=vx*(0.3+Math.random()*0.5)+(Math.random()-0.5)*3;
      this.vy=vy*(0.3+Math.random()*0.5)+(Math.random()-0.5)*3;
      this.hue=h+(Math.random()-0.5)*50;
      this.sat=70+Math.random()*20; this.lit=50+Math.random()*15;
      this.alpha=0.8+Math.random()*0.2; this.size=2+Math.random()*3;
      this.decay=0.015+Math.random()*0.02; this.life=1;
    }
    Particle.prototype.update=function(){ this.x+=this.vx; this.y+=this.vy; this.vx*=0.92; this.vy*=0.92; this.life-=this.decay; this.alpha*=0.96; };
    Particle.prototype.draw=function(){ ctx.beginPath(); ctx.arc(this.x,this.y,Math.max(this.size*this.life,0.1),0,Math.PI*2); ctx.fillStyle='hsla('+this.hue+','+this.sat+'%,'+this.lit+'%,'+(this.alpha*this.life)+')'; ctx.fill(); };
    Particle.prototype.dead=function(){ return this.life<=0.01; };

    function particleLoop(){
      requestAnimationFrame(particleLoop);
      ctx.clearRect(0,0,W,H);
      var dx=mx-prevMx, dy=my-prevMy, speed=Math.sqrt(dx*dx+dy*dy);
      if(visible && speed>0.8){
        var count=Math.min(3+Math.floor(speed*0.3),12);
        for(var i=0;i<count;i++) particles.push(new Particle(mx,my,dx,dy,hue));
      }
      prevMx=mx; prevMy=my;
      for(var i=particles.length-1;i>=0;i--){ particles[i].update(); particles[i].draw(); if(particles[i].dead()) particles.splice(i,1); }
    }
    particleLoop();
  }

  /* Volume strip */
  var vs=document.getElementById('volstrip');
  if(vs){
    var vx=vs.getContext('2d');
    function dv(){var vW=vs.offsetWidth||window.innerWidth;vs.width=vW;vs.height=52;var g=vx.createLinearGradient(0,0,0,52);g.addColorStop(0,'#F5F0E8');g.addColorStop(1,'#EDE7D9');vx.fillStyle=g;vx.fillRect(0,0,vW,52);var L=[{a:9,f:.018,p:0,c:'rgba(107,30,46,.52)',w:1.5},{a:5,f:.030,p:1.4,c:'rgba(201,150,58,.36)',w:1},{a:13,f:.011,p:2.7,c:'rgba(107,30,46,.15)',w:2.5}];function en(x){return 1+.6*Math.sin(x*.005)*Math.cos(x*.0019);}L.forEach(function(l){vx.beginPath();vx.strokeStyle=l.c;vx.lineWidth=l.w;vx.lineJoin='round';for(var x=0;x<=vW;x++){var e=en(x),y=26+Math.sin(x*l.f+l.p)*l.a*e+Math.sin(x*l.f*2.1+l.p*.55)*l.a*.32*e;x===0?vx.moveTo(x,y):vx.lineTo(x,y);}vx.stroke();});}
    dv(); window.addEventListener('resize',dv);
  }

  /* Typing animation */
  var ph=['monetary transmission mechanisms','financial frictions in emerging markets','central bank communication & markets','DSGE models with credit constraints','fiscal-monetary policy interactions'];
  var tel=document.getElementById('tt'),pi=0,ci=0,isDel=false,pau=false;
  function type(){if(!tel)return;var cur=ph[pi];if(pau){setTimeout(type,1950);pau=false;return;}if(!isDel){tel.textContent=cur.slice(0,++ci);if(ci===cur.length){pau=true;isDel=true;setTimeout(type,1950);return;}setTimeout(type,44);}else{tel.textContent=cur.slice(0,--ci);if(ci===0){isDel=false;pi=(pi+1)%ph.length;setTimeout(type,350);return;}setTimeout(type,24);}}
  setTimeout(type,800);

  /* Scroll reveal */
  var revs=document.querySelectorAll('.rev');
  var obs=new IntersectionObserver(function(entries){entries.forEach(function(e){if(e.isIntersecting){e.target.classList.add('vis');obs.unobserve(e.target);}});},{threshold:.08,rootMargin:'0px 0px -28px 0px'});
  revs.forEach(function(el){obs.observe(el);});

  /* Abstract toggles */
  document.querySelectorAll('.abt').forEach(function(btn){btn.addEventListener('click',function(){var exp=btn.getAttribute('aria-expanded')==='true';btn.setAttribute('aria-expanded',String(!exp));btn.nextElementSibling.hidden=exp;});});

  /* Hamburger */
  var hbtn=document.getElementById('hbtn'),mm=document.getElementById('mobMenu');
  if(hbtn&&mm){hbtn.addEventListener('click',function(){var o=mm.classList.toggle('open');var sp=hbtn.querySelectorAll('span');if(o){sp[0].style.transform='translateY(6.5px) rotate(45deg)';sp[1].style.opacity='0';sp[2].style.transform='translateY(-6.5px) rotate(-45deg)';}else{sp[0].style.transform='';sp[1].style.opacity='';sp[2].style.transform='';}});document.querySelectorAll('.mob-lnk').forEach(function(l){l.addEventListener('click',function(){mm.classList.remove('open');var sp=hbtn.querySelectorAll('span');sp[0].style.transform='';sp[1].style.opacity='';sp[2].style.transform='';});});}
})();
