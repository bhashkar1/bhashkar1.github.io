(function(){
  var cc = document.getElementById('cc');
  if (!cc) return;
  var ctx = cc.getContext('2d');
  var W = window.innerWidth, H = window.innerHeight;
  cc.width = W; cc.height = H;
  window.addEventListener('resize', function(){
    W = window.innerWidth; H = window.innerHeight;
    cc.width = W; cc.height = H;
  });

  var mx = -200, my = -200;
  var rx = -200, ry = -200;
  var visible = false;
  var hue = 0;

  document.addEventListener('mouseenter', function(){ visible = true; });
  document.addEventListener('mouseleave', function(){ visible = false; mx=-200; my=-200; rx=-200; ry=-200; });
  document.addEventListener('mousemove', function(e){ mx = e.clientX; my = e.clientY; visible = true; });

  function Particle(x, y, vx, vy, h) {
    this.x = x; this.y = y;
    this.vx = vx * (0.4 + Math.random() * 0.4) + (Math.random() - 0.5) * 2.5;
    this.vy = vy * (0.4 + Math.random() * 0.4) + (Math.random() - 0.5) * 2.5;
    this.hue = h + (Math.random() - 0.5) * 40;
    this.sat = 65 + Math.random() * 25;
    this.lit = 45 + Math.random() * 20;
    this.alpha = 0.7 + Math.random() * 0.3;
    this.size = 1.5 + Math.random() * 3;
    this.decay = 0.018 + Math.random() * 0.018;
    this.life = 1;
  }
  Particle.prototype.update = function(){
    this.x += this.vx; this.y += this.vy;
    this.vx *= 0.93; this.vy *= 0.93;
    this.life -= this.decay; this.alpha *= 0.97;
  };
  Particle.prototype.draw = function(){
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size * this.life, 0, Math.PI * 2);
    ctx.fillStyle = 'hsla(' + this.hue + ',' + this.sat + '%,' + this.lit + '%,' + (this.alpha * this.life) + ')';
    ctx.fill();
  };
  Particle.prototype.dead = function(){ return this.life <= 0.02; };

  var particles = [];
  var prevMx = mx, prevMy = my;

  function loop() {
    requestAnimationFrame(loop);
    ctx.clearRect(0, 0, W, H);

    hue = (hue + 0.8) % 360;

    rx += (mx - rx) * 0.12;
    ry += (my - ry) * 0.12;

    var dx = mx - prevMx, dy = my - prevMy;
    var dist = Math.sqrt(dx * dx + dy * dy);

    if (visible && dist > 0.5) {
      var count = Math.min(2 + Math.floor(dist * 0.25), 10);
      for (var i = 0; i < count; i++) particles.push(new Particle(mx, my, dx, dy, hue));
    }

    prevMx = mx; prevMy = my;

    for (var i = particles.length - 1; i >= 0; i--) {
      particles[i].update(); particles[i].draw();
      if (particles[i].dead()) particles.splice(i, 1);
    }

    if (visible && mx > -100) {
      ctx.beginPath();
      ctx.arc(rx, ry, 22, 0, Math.PI * 2);
      ctx.strokeStyle = 'hsla(' + hue + ',75%,55%,0.55)';
      ctx.lineWidth = 1.5; ctx.stroke();

      ctx.beginPath();
      ctx.arc(mx, my, 5, 0, Math.PI * 2);
      ctx.fillStyle = 'hsla(' + hue + ',85%,60%,1)';
      ctx.fill();
    }
  }
  loop();

  var vs = document.getElementById('volstrip'), vx2 = vs ? vs.getContext('2d') : null;
  if (vs && vx2) {
    function dv(){var vW=vs.offsetWidth||window.innerWidth;vs.width=vW;vs.height=52;var g=vx2.createLinearGradient(0,0,0,52);g.addColorStop(0,'#F5F0E8');g.addColorStop(1,'#EDE7D9');vx2.fillStyle=g;vx2.fillRect(0,0,vW,52);var L=[{a:9,f:.018,p:0,c:'rgba(107,30,46,.52)',w:1.5},{a:5,f:.030,p:1.4,c:'rgba(201,150,58,.36)',w:1},{a:13,f:.011,p:2.7,c:'rgba(107,30,46,.15)',w:2.5}];function en(x){return 1+.6*Math.sin(x*.005)*Math.cos(x*.0019);}L.forEach(function(l){vx2.beginPath();vx2.strokeStyle=l.c;vx2.lineWidth=l.w;vx2.lineJoin='round';for(var x=0;x<=vW;x++){var e=en(x),y=26+Math.sin(x*l.f+l.p)*l.a*e+Math.sin(x*l.f*2.1+l.p*.55)*l.a*.32*e;x===0?vx2.moveTo(x,y):vx2.lineTo(x,y);}vx2.stroke();});}
    dv(); window.addEventListener('resize', dv);
  }

  var ph=['monetary transmission mechanisms','financial frictions in emerging markets','central bank communication & markets','DSGE models with credit constraints','fiscal-monetary policy interactions'];
  var tel=document.getElementById('tt'),pi=0,ci=0,isDel=false,pau=false;
  function type(){if(!tel)return;var cur=ph[pi];if(pau){setTimeout(type,1950);pau=false;return;}if(!isDel){tel.textContent=cur.slice(0,++ci);if(ci===cur.length){pau=true;isDel=true;setTimeout(type,1950);return;}setTimeout(type,44);}else{tel.textContent=cur.slice(0,--ci);if(ci===0){isDel=false;pi=(pi+1)%ph.length;setTimeout(type,350);return;}setTimeout(type,24);}}
  setTimeout(type,800);

  var revs=document.querySelectorAll('.rev');
  var obs=new IntersectionObserver(function(entries){entries.forEach(function(e){if(e.isIntersecting){e.target.classList.add('vis');obs.unobserve(e.target);}});},{threshold:.08,rootMargin:'0px 0px -28px 0px'});
  revs.forEach(function(el){obs.observe(el);});

  document.querySelectorAll('.abt').forEach(function(btn){btn.addEventListener('click',function(){var exp=btn.getAttribute('aria-expanded')==='true';btn.setAttribute('aria-expanded',String(!exp));btn.nextElementSibling.hidden=exp;});});

  var hbtn=document.getElementById('hbtn'),mm=document.getElementById('mobMenu');
  if(hbtn&&mm){hbtn.addEventListener('click',function(){var o=mm.classList.toggle('open');var sp=hbtn.querySelectorAll('span');if(o){sp[0].style.transform='translateY(6.5px) rotate(45deg)';sp[1].style.opacity='0';sp[2].style.transform='translateY(-6.5px) rotate(-45deg)';}else{sp[0].style.transform='';sp[1].style.opacity='';sp[2].style.transform='';}});document.querySelectorAll('.mob-lnk').forEach(function(l){l.addEventListener('click',function(){mm.classList.remove('open');var sp=hbtn.querySelectorAll('span');sp[0].style.transform='';sp[1].style.opacity='';sp[2].style.transform='';});});}
})();
