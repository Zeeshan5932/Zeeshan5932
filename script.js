'use strict';

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const header = document.querySelector('#siteHeader');
const progressBar = document.querySelector('#progressBar');
const navLinks = Array.from(document.querySelectorAll('.nav-link'));
const mobileNav = document.querySelector('#mobileNav');
const menuBtn = document.querySelector('#mobileMenuBtn');

function updateScrollState() {
  const y = window.scrollY || window.pageYOffset;
  header.classList.toggle('scrolled', y > 20);
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  progressBar.style.width = `${scrollable > 0 ? Math.min(100, y / scrollable * 100) : 0}%`;
}
window.addEventListener('scroll', updateScrollState, {passive:true});
updateScrollState();

function toggleMenu(open) {
  mobileNav.classList.toggle('open', open);
  mobileNav.inert = !open;
  menuBtn.setAttribute('aria-expanded', String(open));
  menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  menuBtn.querySelector('use').setAttribute('href', open ? '#i-close' : '#i-menu');
  document.body.classList.toggle('menu-open', open);
}
menuBtn.addEventListener('click', () => toggleMenu(!mobileNav.classList.contains('open')));
mobileNav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => toggleMenu(false)));
document.addEventListener('keydown', event => {if (event.key === 'Escape') toggleMenu(false);});
window.addEventListener('resize', () => {if (window.innerWidth > 930 && mobileNav.classList.contains('open')) toggleMenu(false);});

if ('IntersectionObserver' in window && !prefersReducedMotion) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, {threshold: .08, rootMargin:'0px 0px -30px 0px'});
  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
} else {
  document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
}

if ('IntersectionObserver' in window) {
  const sectionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === `#${entry.target.id}`));
    });
  }, {rootMargin:'-25% 0px -65% 0px'});
  document.querySelectorAll('main section[id]').forEach(section => sectionObserver.observe(section));
}

document.querySelectorAll('[data-filter]').forEach(button => {
  button.addEventListener('click', () => {
    const selected = button.dataset.filter;
    document.querySelectorAll('[data-filter]').forEach(btn => {
      btn.classList.toggle('active', btn === button);
      btn.setAttribute('aria-pressed', String(btn === button));
    });
    document.querySelectorAll('.project-card').forEach(card => {
      const show = selected === 'all' || card.dataset.category === selected;
      card.classList.toggle('is-hidden', !show);
      card.setAttribute('aria-hidden', String(!show));
    });
  });
});

const copyBtn = document.querySelector('#copyEmailBtn');
copyBtn.addEventListener('click', async () => {
  const email = 'zeeshanyounas443@gmail.com';
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(email);
    } else {
      const input = document.createElement('textarea');
      input.value = email;
      input.style.position = 'fixed';
      input.style.opacity = '0';
      document.body.appendChild(input);
      input.select();
      if (!document.execCommand('copy')) throw new Error('Copy failed');
      input.remove();
    }
    copyBtn.querySelector('use').setAttribute('href', '#i-check');
    copyBtn.querySelector('span').textContent = 'Email copied!';
  } catch {
    copyBtn.querySelector('span').textContent = 'Select email above to copy';
  }
  window.setTimeout(() => {
    copyBtn.querySelector('use').setAttribute('href', '#i-copy');
    copyBtn.querySelector('span').textContent = 'Copy email';
  }, 2800);
});

document.querySelector('#year').textContent = new Date().getFullYear();

// Subtle cursor lighting. No dependency and disabled for touch/reduced-motion.
if (window.matchMedia('(hover:hover) and (pointer:fine)').matches && !prefersReducedMotion) {
  const light = document.querySelector('#cursorLight');
  window.addEventListener('pointermove', event => {
    light.style.left = `${event.clientX}px`;
    light.style.top = `${event.clientY}px`;
    light.style.opacity = '1';
  }, {passive:true});
  document.addEventListener('mouseleave', () => {light.style.opacity = '0';});
}

// Small particle network behind the decorative AI emblem.
const canvas = document.querySelector('#networkCanvas');
const ctx = canvas?.getContext('2d');
if (ctx && !prefersReducedMotion) {
  const host = canvas.parentElement;
  const nodes = [];
  const nodeCount = 48;
  let w=0, h=0, pixelRatio=1, frame=0, raf=0;
  let visible=true;
  function sizeCanvas() {
    const b = host.getBoundingClientRect();
    w = Math.max(1,b.width); h = Math.max(1,b.height);
    pixelRatio = Math.min(window.devicePixelRatio || 1,2);
    canvas.width = Math.round(w*pixelRatio);
    canvas.height = Math.round(h*pixelRatio);
    ctx.setTransform(pixelRatio,0,0,pixelRatio,0,0);
    nodes.length = 0;
    for (let i=0;i<nodeCount;i++) {
      const theta = (i/nodeCount)*Math.PI*2 + Math.random()*.7;
      const radius = .26 + Math.random()*.24;
      nodes.push({x:w/2 + Math.cos(theta)*w*radius,y:h/2 + Math.sin(theta)*h*radius,speed:.3+Math.random()*.8,size:.7+Math.random()*1.6,phase:Math.random()*Math.PI*2});
    }
  }
  function draw() {
    if (!visible) return;
    ctx.clearRect(0,0,w,h);
    const drifted = nodes.map(n => ({x:n.x+Math.sin(frame*.009*n.speed+n.phase)*9,y:n.y+Math.cos(frame*.008*n.speed+n.phase)*9,size:n.size}));
    drifted.forEach((a,i)=> {
      for (let j=i+1;j<drifted.length;j++) {
        const b=drifted[j]; const dx=a.x-b.x,dy=a.y-b.y; const d=Math.hypot(dx,dy);
        if (d<105) {ctx.strokeStyle=`rgba(222,182,110,${(1-d/105)*.21})`;ctx.lineWidth=.7;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();}
      }
      ctx.beginPath();ctx.arc(a.x,a.y,a.size,0,Math.PI*2);ctx.fillStyle='rgba(238,204,141,.69)';ctx.fill();
    });
    frame++;raf=window.requestAnimationFrame(draw);
  }
  const resizeObserver = new ResizeObserver(() => sizeCanvas());
  resizeObserver.observe(host);
  const artObserver = new IntersectionObserver(entries => {
    visible=entries[0]?.isIntersecting ?? false;
    if (visible && !raf) raf=requestAnimationFrame(draw);
    if (!visible && raf) {cancelAnimationFrame(raf);raf=0;}
  });
  artObserver.observe(host);
  sizeCanvas();
}
