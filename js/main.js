(function(){

  /* ── 1. CSS Cursor (dot + ring) — always visible ── */
  var dot  = document.getElementById('cursor-dot');
  var ring = document.getElementById('cursor-ring');
  var mx = window.innerWidth/2, my = window.innerHeight/2;
  var rx = mx, ry = my;
  var visible = false;
  var hue = 42; /* gold base hue — shifts like bond yield curve */

  window.addEventListener('mousemove', function(e){
    mx = e.clientX; my = e.clientY;
    visible = true;
    if(dot){ dot.style.left=mx+'px'; dot.style.top=my+'px'; }
  });
  window.addEventListener('mouseout', function(e){
    if(!e.relatedTarget && !e.toElement){ visible=false; }
  });
  window.addEventListener('mouseenter', function(){ visible=true; });

  /* ring easing + hue pulse — like oscillating time series */
  (function cursorLoop(){
    hue = (hue + 0.4) % 360;
    rx += (mx - rx) * 0.13;
    ry += (my - ry) * 0.13;
    if(ring){
      ring.style.left = rx+'px';
      ring.style.top  = ry+'px';
      /* ring color oscillates between gold → burgundy → teal — economist's palette */
      var r = Math.round(180 + 60*Math.sin(hue*Math.PI/180));
      var g = Math.round(100 + 50*Math.sin((hue+120)*Math.PI/180));
      var b = Math.round(50  + 80*Math.sin((hue+240)*Math.PI/180));
      var col = 'rgba('+r+','+g+','+b+',0.85)';
      ring.style.borderColor = col;
      ring.style.boxShadow   = '0 0 10px 1px rgba('+r+','+g+','+b+',0.25)';
    }
    if(dot && visible){
      var dr = Math.round(210 + 45*Math.sin((hue+60)*Math.PI/180));
      var dg = Math.round(140 + 40*Math.sin((hue+180)*Math.PI/180));
      var db = Math.round(30  + 60*Math.sin((hue+300)*Math.PI/180));
      dot.style.background = 'rgb('+dr+','+dg+','+db+')';
      dot.style.boxShadow  = '0 0 8px 3px rgba('+dr+','+dg+','+db+',0.6)';
    }
    requestAnimationFrame(cursorLoop);
  })();

  /* ── 2. Canvas — data-network background + particle trail ── */
  var cc = document.getElementById('cc');
  if(cc){
    var ctx = cc.getContext('2d');
    var W = window.innerWidth, H = window.innerHeight;
    cc.width=W; cc.height=H;
    window.addEventListener('resize',function(){ W=window.innerWidth; H=window.innerHeight; cc.width=W; cc.height=H; initNodes(); });

    /* Data nodes — like scatter plot / network graph */
    var nodes = [];
    var NODE_COUNT = 55;
    function initNodes(){
      nodes = [];
      for(var i=0;i<NODE_COUNT;i++){
        nodes.push({
          x: Math.random()*W, y: Math.random()*H,
          vx: (Math.random()-.5)*0.18, vy: (Math.random()-.5)*0.18,
          r: 1.2+Math.random()*1.8,
          pulse: Math.random()*Math.PI*2
        });
      }
    }
    initNodes();

    /* Particle trail */
    var particles=[], prevMx=mx, prevMy=my, trailHue=42;

    function Particle(x,y,vx,vy){
      this.x=x; this.y=y;
      this.vx=vx*0.35+(Math.random()-.5)*1.8;
      this.vy=vy*0.35+(Math.random()-.5)*1.8;
      /* Data-inspired: gold, burgundy, slate */
      var palette=[
        [201,150,58], [107,30,46], [80,110,140],
        [180,160,100],[140,60,70],[60,90,130]
      ];
      var c=palette[Math.floor(Math.random()*palette.length)];
      this.r=c[0]; this.g=c[1]; this.b=c[2];
      this.size=1.5+Math.random()*2.5;
      this.life=1; this.decay=0.022+Math.random()*0.018;
      this.alpha=0.9;
    }
    Particle.prototype.update=function(){
      this.x+=this.vx; this.y+=this.vy;
      this.vx*=0.93; this.vy*=0.93;
      this.life-=this.decay; this.alpha*=0.96;
    };
    Particle.prototype.draw=function(){
      ctx.beginPath();
      ctx.arc(this.x,this.y,Math.max(this.size*this.life,0.1),0,Math.PI*2);
      ctx.fillStyle='rgba('+this.r+','+this.g+','+this.b+','+(this.alpha*this.life)+')';
      ctx.fill();
    };
    Particle.prototype.dead=function(){ return this.life<=0.01; };

    var frame=0;
    function draw(){
      requestAnimationFrame(draw);
      ctx.clearRect(0,0,W,H);
      frame++;

      /* Move nodes */
      for(var i=0;i<nodes.length;i++){
        var n=nodes[i];
        n.x+=n.vx; n.y+=n.vy;
        n.pulse+=0.018;
        if(n.x<0||n.x>W) n.vx*=-1;
        if(n.y<0||n.y>H) n.vy*=-1;
      }

      /* Draw connections between nearby nodes — like correlation matrix network */
      for(var i=0;i<nodes.length;i++){
        for(var j=i+1;j<nodes.length;j++){
          var dx=nodes[i].x-nodes[j].x, dy=nodes[i].y-nodes[j].y;
          var dist=Math.sqrt(dx*dx+dy*dy);
          if(dist<130){
            var alpha=0.04*(1-dist/130);
            ctx.beginPath();
            ctx.moveTo(nodes[i].x,nodes[i].y);
            ctx.lineTo(nodes[j].x,nodes[j].y);
            ctx.strokeStyle='rgba(107,30,46,'+alpha+')';
            ctx.lineWidth=0.6;
            ctx.stroke();
          }
        }
      }

      /* Draw nodes — pulsing like data points */
      for(var i=0;i<nodes.length;i++){
        var n=nodes[i];
        var glow=0.3+0.2*Math.sin(n.pulse);
        ctx.beginPath();
        ctx.arc(n.x,n.y,n.r*(1+0.3*Math.sin(n.pulse)),0,Math.PI*2);
        ctx.fillStyle='rgba(107,30,46,'+glow+')';
        ctx.fill();

        /* react to cursor proximity */
        var cdx=n.x-mx, cdy=n.y-my;
        var cdist=Math.sqrt(cdx*cdx+cdy*cdy);
        if(cdist<90 && visible){
          var fac=(1-cdist/90)*0.015;
          n.vx+=cdx*fac; n.vy+=cdy*fac;
          /* highlight nearby nodes */
          ctx.beginPath();
          ctx.arc(n.x,n.y,n.r*2.5,0,Math.PI*2);
          ctx.fillStyle='rgba(201,150,58,'+(0.15*(1-cdist/90))+')';
          ctx.fill();
        }
        /* speed cap */
        var spd=Math.sqrt(n.vx*n.vx+n.vy*n.vy);
        if(spd>0.6){ n.vx*=0.6/spd; n.vy*=0.6/spd; }
      }

      /* Particle trail on movement */
      var dx=mx-prevMx, dy=my-prevMy;
      var speed=Math.sqrt(dx*dx+dy*dy);
      if(visible && speed>0.5){
        var cnt=Math.min(2+Math.floor(speed*0.25),10);
        for(var i=0;i<cnt;i++) particles.push(new Particle(mx,my,dx,dy));
      }
      prevMx=mx; prevMy=my;

      for(var i=particles.length-1;i>=0;i--){
        particles[i].update(); particles[i].draw();
        if(particles[i].dead()) particles.splice(i,1);
      }
    }
    draw();
  }

  /* ── 3. Volume strip ── */
  var vs=document.getElementById('volstrip');
  if(vs){
    var vx=vs.getContext('2d');
    function dv(){
      var vW=vs.offsetWidth||window.innerWidth;
      vs.width=vW; vs.height=52;
      var g=vx.createLinearGradient(0,0,0,52);
      g.addColorStop(0,'#F5F0E8'); g.addColorStop(1,'#EDE7D9');
      vx.fillStyle=g; vx.fillRect(0,0,vW,52);
      var L=[{a:9,f:.018,p:0,c:'rgba(107,30,46,.52)',w:1.5},{a:5,f:.030,p:1.4,c:'rgba(201,150,58,.36)',w:1},{a:13,f:.011,p:2.7,c:'rgba(107,30,46,.15)',w:2.5}];
      function en(x){return 1+.6*Math.sin(x*.005)*Math.cos(x*.0019);}
      L.forEach(function(l){
        vx.beginPath(); vx.strokeStyle=l.c; vx.lineWidth=l.w; vx.lineJoin='round';
        for(var x=0;x<=vW;x++){var e=en(x),y=26+Math.sin(x*l.f+l.p)*l.a*e+Math.sin(x*l.f*2.1+l.p*.55)*l.a*.32*e; x===0?vx.moveTo(x,y):vx.lineTo(x,y);}
        vx.stroke();
      });
    }
    dv(); window.addEventListener('resize',dv);
  }

  /* ── 4. Typing animation ── */
  var ph=['monetary transmission mechanisms','financial frictions in emerging markets','central bank communication & markets','DSGE models with credit constraints','fiscal-monetary policy interactions'];
  var tel=document.getElementById('tt'),pi=0,ci=0,isDel=false,pau=false;
  function type(){if(!tel)return;var cur=ph[pi];if(pau){setTimeout(type,1950);pau=false;return;}if(!isDel){tel.textContent=cur.slice(0,++ci);if(ci===cur.length){pau=true;isDel=true;setTimeout(type,1950);return;}setTimeout(type,44);}else{tel.textContent=cur.slice(0,--ci);if(ci===0){isDel=false;pi=(pi+1)%ph.length;setTimeout(type,350);return;}setTimeout(type,24);}}
  setTimeout(type,800);

  /* ── 5. Scroll reveal ── */
  var revs=document.querySelectorAll('.rev');
  var obs=new IntersectionObserver(function(entries){entries.forEach(function(e){if(e.isIntersecting){e.target.classList.add('vis');obs.unobserve(e.target);}});},{threshold:.08,rootMargin:'0px 0px -28px 0px'});
  revs.forEach(function(el){obs.observe(el);});

  /* ── 6. Abstract toggles ── */
  document.querySelectorAll('.abt').forEach(function(btn){btn.addEventListener('click',function(){var exp=btn.getAttribute('aria-expanded')==='true';btn.setAttribute('aria-expanded',String(!exp));btn.nextElementSibling.hidden=exp;});});

  /* ── 7. Hamburger ── */
  var hbtn=document.getElementById('hbtn'),mm=document.getElementById('mobMenu');
  if(hbtn&&mm){hbtn.addEventListener('click',function(){var o=mm.classList.toggle('open');var sp=hbtn.querySelectorAll('span');if(o){sp[0].style.transform='translateY(6.5px) rotate(45deg)';sp[1].style.opacity='0';sp[2].style.transform='translateY(-6.5px) rotate(-45deg)';}else{sp[0].style.transform='';sp[1].style.opacity='';sp[2].style.transform='';}});document.querySelectorAll('.mob-lnk').forEach(function(l){l.addEventListener('click',function(){mm.classList.remove('open');var sp=hbtn.querySelectorAll('span');sp[0].style.transform='';sp[1].style.opacity='';sp[2].style.transform='';});});}
})();
