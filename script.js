const navToggle = document.querySelector('.nav-toggle');
const siteNav = document.querySelector('.site-nav');
const navLinks = document.querySelectorAll('.site-nav a');
const yearEl = document.getElementById('year');

document.body.classList.add('js-ready');

if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

if (navToggle && siteNav) {
  navToggle.addEventListener('click', () => {
    const isOpen = siteNav.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });

  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      siteNav.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

const sections = document.querySelectorAll('main section[id]');
const navItems = document.querySelectorAll('.site-nav a');

const setActiveNav = () => {
  const scrollPosition = window.scrollY + 120;

  sections.forEach((section) => {
    const id = section.getAttribute('id');
    const sectionTop = section.offsetTop;
    const sectionHeight = section.offsetHeight;

    if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
      navItems.forEach((item) => {
        item.classList.toggle('active', item.getAttribute('href') === `#${id}`);
      });
    }
  });
};

window.addEventListener('scroll', setActiveNav);
window.addEventListener('load', setActiveNav);

const revealItems = document.querySelectorAll(
  '.hero-copy, .hero-visual, .section-heading, .pathway-card, .skill-card, .tool-card, .table-wrap, .about-photo, .about-content'
);

if (revealItems.length && 'IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.12,
      rootMargin: '0px 0px -8% 0px',
    }
  );

  revealItems.forEach((item) => {
    item.classList.add('reveal');
    revealObserver.observe(item);
  });
} else {
  revealItems.forEach((item) => item.classList.add('reveal', 'is-visible'));
}

const backgroundCanvas = document.getElementById('bg-canvas');

if (backgroundCanvas) {
  const ctx = backgroundCanvas.getContext('2d');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const pointerFine = window.matchMedia('(pointer: fine)').matches;
  const mobileViewport = window.matchMedia('(max-width: 760px)').matches;

  let particles = [];
  let animationFrameId = null;
  let width = window.innerWidth;
  let height = window.innerHeight;
  const mouse = {
    x: width / 2,
    y: height / 2,
    active: false,
  };

  const getParticleCount = () => {
    if (prefersReducedMotion.matches) {
      return 18;
    }

    if (mobileViewport) {
      return 26;
    }

    if (width < 1200) {
      return 40;
    }

    return 58;
  };

  const buildParticles = () => {
    const count = getParticleCount();
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.55,
      vy: (Math.random() - 0.5) * 0.45,
      radius: Math.random() * 2 + 1.4,
    }));
  };

  const resizeCanvas = () => {
    width = window.innerWidth;
    height = window.innerHeight;
    const dpr = window.devicePixelRatio || 1;

    backgroundCanvas.width = Math.floor(width * dpr);
    backgroundCanvas.height = Math.floor(height * dpr);
    backgroundCanvas.style.width = `${width}px`;
    backgroundCanvas.style.height = `${height}px`;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    buildParticles();
  };

  const drawBackgroundGlow = () => {
    if (!pointerFine || !mouse.active) {
      return;
    }

    const glowRadius = mobileViewport ? 90 : 120;
    const gradient = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, glowRadius);
    gradient.addColorStop(0, 'rgba(56, 189, 248, 0.2)');
    gradient.addColorStop(0.3, 'rgba(0, 163, 255, 0.1)');
    gradient.addColorStop(1, 'rgba(0, 163, 255, 0)');

    ctx.fillStyle = gradient;
    ctx.fillRect(mouse.x - glowRadius, mouse.y - glowRadius, glowRadius * 2, glowRadius * 2);
  };

  const animate = () => {
    ctx.clearRect(0, 0, width, height);

    if (document.hidden) {
      animationFrameId = window.requestAnimationFrame(animate);
      return;
    }

    const maxDistance = mobileViewport ? 110 : 150;
    const lineAlphaBase = mobileViewport ? 0.12 : 0.18;

    for (let index = 0; index < particles.length; index += 1) {
      const particle = particles[index];

      if (!prefersReducedMotion.matches) {
        particle.x += particle.vx;
        particle.y += particle.vy;

        if (particle.x <= 0 || particle.x >= width) {
          particle.vx *= -1;
          particle.x = Math.min(Math.max(particle.x, 0), width);
        }

        if (particle.y <= 0 || particle.y >= height) {
          particle.vy *= -1;
          particle.y = Math.min(Math.max(particle.y, 0), height);
        }

        if (pointerFine && mouse.active) {
          const dx = mouse.x - particle.x;
          const dy = mouse.y - particle.y;
          const distance = Math.hypot(dx, dy) || 1;

          if (distance < 170) {
            const influence = (170 - distance) / 170;
            const lift = 0.35 * influence;
            particle.x -= (dx / distance) * lift;
            particle.y -= (dy / distance) * lift;
          }
        }
      }

      ctx.beginPath();
      ctx.fillStyle = 'rgba(56, 189, 248, 0.72)';
      ctx.shadowBlur = 10;
      ctx.shadowColor = 'rgba(56, 189, 248, 0.45)';
      ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      for (let j = index + 1; j < particles.length; j += 1) {
        const other = particles[j];
        const dx = particle.x - other.x;
        const dy = particle.y - other.y;
        const distance = Math.hypot(dx, dy);

        if (distance > maxDistance) {
          continue;
        }

        const alpha = (1 - distance / maxDistance) * lineAlphaBase;
        ctx.beginPath();
        ctx.moveTo(particle.x, particle.y);
        ctx.lineTo(other.x, other.y);
        ctx.strokeStyle = `rgba(56, 189, 248, ${alpha})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }

    drawBackgroundGlow();

    if (prefersReducedMotion.matches) {
      return;
    }

    animationFrameId = window.requestAnimationFrame(animate);
  };

  resizeCanvas();
  animate();

  window.addEventListener('resize', resizeCanvas);

  if (pointerFine) {
    window.addEventListener('pointermove', (event) => {
      mouse.x = event.clientX;
      mouse.y = event.clientY;
      mouse.active = true;
    });

    window.addEventListener('pointerleave', () => {
      mouse.active = false;
    });
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden && animationFrameId) {
      window.cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }

    if (!document.hidden) {
      animationFrameId = window.requestAnimationFrame(animate);
    }
  });
}
