(function(){
  var cc=document.getElementById('cc'),ctx=cc.getContext('2d');
  var W=window.innerWidth,H=window.innerHeight;
  cc.width=W;cc.height=H;
  window.addEventListener('resize',function(){W=window.innerWidth;H=window.innerHeight;cc.width=W;cc.height=H;});

  /* Start off-screen — no phantom dot at centre on load */
  var mx=-100,my=-100,pmx=-100,pmy=-100,spd=0,cycleT=0,pts=[];
  var cursorVisible=false;

  document.addEventListener('mousemove',function(e){
    cursorVisible=true;
    pmx=mx;pmy=my;mx=e.clientX;my=e.clientY;
    var dx=mx-pmx,dy=my-pmy;
    spd=Math.sqrt(dx*dx+dy*dy);
  });

  function lc(t){return{r:Math.round(107+t*(201-107)),g:Math.round(30+t*(150-30)),b:Math.round(46+t*(58-46))};}

  function P(x,y,vx,vy,s){
    this.x=x;this.y=y;
    this.vx=vx+(Math.random()-.5)*1.1;this.vy=vy+(Math.random()-.5)*1.1;
    this.ph=Math.random()*Math.PI*2;
    this.amp=(.3+Math.random()*.65)*Math.min(s*.15,5);
    this.fq=.08+Math.random()*.07;
    var ct=Math.max(0,Math.min(1,cycleT+(Math.random()-.5)*.3));
    var c=lc(0.5-0.5*Math.cos(ct*Math.PI*2));
    this.r=c.r;this.g=c.g;this.b=c.b;
    this.al=.45+Math.random()*.3;
    this.sz=1.1+Math.random()*2;
    this.dc=.021+Math.random()*.02;
    this.life=1;this.tick=0;
    var len=Math.sqrt(vx*vx+vy*vy)||1;
    this.nx=-vy/len;this.ny=vx/len;
  }
  P.prototype.update=function(){
    this.tick++;this.ph+=this.fq;
    var o=Math.sin(this.ph)*this.amp*Math.exp(-this.tick*.034);
    this.x+=this.vx*.67+this.nx*o;
    this.y+=this.vy*.67+this.ny*o;
    this.life-=this.dc;this.al*=.963;this.vx*=.91;this.vy*=.91;
  };
  P.prototype.draw=function(){
    ctx.beginPath();ctx.arc(this.x,this.y,this.sz*this.life,0,Math.PI*2);
    ctx.fillStyle='rgba('+this.r+','+this.g+','+this.b+','+(this.al*this.life)+')';
    ctx.fill();
  };
  P.prototype.dead=function(){return this.life<=.01;};

  var ls=0;
  document.addEventListener('mousemove',function(e){
    var now=performance.now();if(now-ls<15)return;ls=now;
    var dx=mx-pmx,dy=my-pmy,cnt=Math.min(2+Math.floor(spd*.2),6);
    for(var i=0;i<cnt;i++)pts.push(new P(e.clientX,e.clientY,dx*.27,dy*.27,spd));
  });

  function loop(){
    ctx.clearRect(0,0,W,H);
    cycleT+=(0.004+Math.min(spd*.0012,.018));
    if(cycleT>1)cycleT=0;
    spd*=.84;
    var dt=0.5-0.5*Math.cos(cycleT*Math.PI*2),c=lc(dt);

    for(var i=pts.length-1;i>=0;i--){
      pts[i].update();pts[i].draw();
      if(pts[i].dead())pts.splice(i,1);
    }

    /* Draw cursor only after mouse enters page */
    if(cursorVisible){
      ctx.beginPath();ctx.arc(mx,my,13,0,Math.PI*2);
      ctx.strokeStyle='rgba('+c.r+','+c.g+','+c.b+',.55)';
      ctx.lineWidth=1.5;ctx.stroke();
      ctx.beginPath();ctx.arc(mx,my,4.5,0,Math.PI*2);
      ctx.fillStyle='rgb('+c.r+','+c.g+','+c.b+')';
      ctx.fill();
    }
    requestAnimationFrame(loop);
  }
  loop();

  /* Volume strip */
  var vs=document.getElementById('volstrip'),vx=vs.getContext('2d');
  function dv(){
    var vW=vs.offsetWidth||window.innerWidth;vs.width=vW;vs.height=52;
    var g=vx.createLinearGradient(0,0,0,52);
    g.addColorStop(0,'#F5F0E8');g.addColorStop(1,'#EDE7D9');
    vx.fillStyle=g;vx.fillRect(0,0,vW,52);
    var L=[{a:9,f:.018,p:0,c:'rgba(107,30,46,.52)',w:1.5},{a:5,f:.030,p:1.4,c:'rgba(201,150,58,.36)',w:1},{a:13,f:.011,p:2.7,c:'rgba(107,30,46,.15)',w:2.5}];
    function en(x){return 1+.6*Math.sin(x*.005)*Math.cos(x*.0019);}
    L.forEach(function(l){
      vx.beginPath();vx.strokeStyle=l.c;vx.lineWidth=l.w;vx.lineJoin='round';
      for(var x=0;x<=vW;x++){var e=en(x),y=26+Math.sin(x*l.f+l.p)*l.a*e+Math.sin(x*l.f*2.1+l.p*.55)*l.a*.32*e;x===0?vx.moveTo(x,y):vx.lineTo(x,y);}
      vx.stroke();
    });
  }
  dv();window.addEventListener('resize',dv);

  /* Typing animation */
  var ph=['monetary transmission mechanisms','financial frictions in emerging markets','central bank communication & markets','DSGE models with credit constraints','fiscal-monetary policy interactions'];
  var tel=document.getElementById('tt'),pi=0,ci=0,del=false,pau=false;
  function type(){
    if(!tel)return;var cur=ph[pi];
    if(pau){setTimeout(type,1950);pau=false;return;}
    if(!del){tel.textContent=cur.slice(0,++ci);if(ci===cur.length){pau=true;del=true;setTimeout(type,1950);return;}setTimeout(type,44);}
    else{tel.textContent=cur.slice(0,--ci);if(ci===0){del=false;pi=(pi+1)%ph.length;setTimeout(type,350);return;}setTimeout(type,24);}
  }
  setTimeout(type,800);

  /* Scroll reveal */
  var revs=document.querySelectorAll('.rev');
  var obs=new IntersectionObserver(function(entries){entries.forEach(function(e){if(e.isIntersecting){e.target.classList.add('vis');obs.unobserve(e.target);}});},{threshold:.08,rootMargin:'0px 0px -28px 0px'});
  revs.forEach(function(el){obs.observe(el);});

  /* Abstract toggles */
  document.querySelectorAll('.abt').forEach(function(btn){
    btn.addEventListener('click',function(){var exp=btn.getAttribute('aria-expanded')==='true';btn.setAttribute('aria-expanded',String(!exp));btn.nextElementSibling.hidden=exp;});
  });

  /* Mobile hamburger */
  var hbtn=document.getElementById('hbtn'),mm=document.getElementById('mobMenu');
  if(hbtn&&mm){
    hbtn.addEventListener('click',function(){var o=mm.classList.toggle('open');var sp=hbtn.querySelectorAll('span');if(o){sp[0].style.transform='translateY(6.5px) rotate(45deg)';sp[1].style.opacity='0';sp[2].style.transform='translateY(-6.5px) rotate(-45deg)';}else{sp[0].style.transform='';sp[1].style.opacity='';sp[2].style.transform='';}});
    document.querySelectorAll('.mob-lnk').forEach(function(l){l.addEventListener('click',function(){mm.classList.remove('open');var sp=hbtn.querySelectorAll('span');sp[0].style.transform='';sp[1].style.opacity='';sp[2].style.transform='';});});
  }
})();
