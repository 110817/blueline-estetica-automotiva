const header = document.querySelector('.site-header');
const menuButton = document.querySelector('.menu-toggle');
const menu = document.querySelector('.main-nav');
const track = document.querySelector('.review-track');
const slides = Array.from(document.querySelectorAll('.review-slide'));
const dotsWrap = document.querySelector('.carousel-dots');
const prevButton = document.querySelector('.carousel-button.prev');
const nextButton = document.querySelector('.carousel-button.next');
const heroVideo = document.querySelector('.hero-video');
const servicesVideo = document.querySelector('[data-autoplay-on-view]');
const servicesSoundToggle = document.querySelector('.video-sound-toggle');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const saveData = navigator.connection?.saveData === true;

if (heroVideo) {
  if (reducedMotion || saveData) {
    heroVideo.remove();
  } else {
    heroVideo.play().catch(() => {
      heroVideo.remove();
    });
  }
}

if (servicesVideo && !reducedMotion && !saveData && 'IntersectionObserver' in window) {
  let autoStarted = false;
  let pausedByScroll = false;

  servicesVideo.muted = true;

  const servicesVideoObserver = new IntersectionObserver((entries) => {
    const entry = entries[0];

    if (entry.intersectionRatio >= 0.35 && !servicesVideo.ended) {
      if (!autoStarted || pausedByScroll) {
        servicesVideo.play().then(() => {
          autoStarted = true;
          pausedByScroll = false;
        }).catch(() => {});
      }
      return;
    }

    if (entry.intersectionRatio < 0.08 && autoStarted && !servicesVideo.paused && !servicesVideo.ended) {
      servicesVideo.pause();
      pausedByScroll = true;
    }
  }, { threshold: [0.08, 0.35] });

  servicesVideoObserver.observe(servicesVideo);
  servicesVideo.addEventListener('ended', () => servicesVideoObserver.unobserve(servicesVideo), { once: true });
}

if (servicesVideo && servicesSoundToggle) {
  servicesSoundToggle.addEventListener('click', () => {
    servicesVideo.muted = false;
    servicesVideo.volume = 1;
    servicesVideo.play().catch(() => {});
  });

  servicesVideo.addEventListener('volumechange', () => {
    servicesSoundToggle.hidden = !servicesVideo.muted && servicesVideo.volume > 0;
  });
}

document.getElementById('year').textContent = new Date().getFullYear();

const updateHeader = () => header.classList.toggle('scrolled', window.scrollY > 20);
updateHeader();
window.addEventListener('scroll', updateHeader, { passive: true });

menuButton.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!open));
  menuButton.setAttribute('aria-label', open ? 'Abrir menu' : 'Fechar menu');
  menu.classList.toggle('open', !open);
});

menu.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Abrir menu');
    menu.classList.remove('open');
  });
});

let current = 0;
let timer;
let startX = 0;

slides.forEach((_, index) => {
  const dot = document.createElement('button');
  dot.className = 'carousel-dot';
  dot.type = 'button';
  dot.setAttribute('aria-label', `Mostrar avaliação ${index + 1}`);
  dot.addEventListener('click', () => showSlide(index, true));
  dotsWrap.appendChild(dot);
});

const dots = Array.from(document.querySelectorAll('.carousel-dot'));

function showSlide(index, userAction = false) {
  current = (index + slides.length) % slides.length;
  track.style.transform = `translateX(-${current * 100}%)`;
  slides.forEach((slide, slideIndex) => {
    slide.setAttribute('aria-hidden', String(slideIndex !== current));
  });
  dots.forEach((dot, dotIndex) => {
    const active = dotIndex === current;
    dot.classList.toggle('active', active);
    dot.setAttribute('aria-current', active ? 'true' : 'false');
  });
  if (userAction) restartTimer();
}

function restartTimer() {
  window.clearInterval(timer);
  if (!reducedMotion) timer = window.setInterval(() => showSlide(current + 1), 7000);
}

prevButton.addEventListener('click', () => showSlide(current - 1, true));
nextButton.addEventListener('click', () => showSlide(current + 1, true));

track.addEventListener('touchstart', (event) => {
  startX = event.changedTouches[0].clientX;
}, { passive: true });

track.addEventListener('touchend', (event) => {
  const distance = event.changedTouches[0].clientX - startX;
  if (Math.abs(distance) > 48) showSlide(current + (distance < 0 ? 1 : -1), true);
}, { passive: true });

track.closest('.review-carousel').addEventListener('mouseenter', () => window.clearInterval(timer));
track.closest('.review-carousel').addEventListener('mouseleave', restartTimer);

showSlide(0);
restartTimer();
