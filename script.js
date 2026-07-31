/**
 * Birthday-Sunflower — Interactive Birthday Website
 * Complete single-file implementation (ES6 classes, no modules)
 */

/* ============================================================
   1. EventBus — Simple pub/sub system
   ============================================================ */
class EventBus {
  constructor() {
    this.listeners = {};
  }

  on(event, fn) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(fn);
  }

  off(event, fn) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter(f => f !== fn);
  }

  emit(event, data) {
    if (!this.listeners[event]) return;
    this.listeners[event].forEach(fn => fn(data));
  }
}

/* ============================================================
   2. SceneManager — Controls scene flow and transitions
   ============================================================ */
class SceneManager {
  constructor(eventBus) {
    this.eventBus = eventBus;
    this.scenes = ['loading', 'landing', 'gift', 'scrapbook', 'garden', 'timeline', 'cake', 'letter', 'finale'];
    this.currentIndex = 0;
    this.isTransitioning = false;
    this.sceneElements = {};
    this.scenes.forEach(name => {
      this.sceneElements[name] = document.querySelector(`[data-scene="${name}"]`);
    });
  }

  getCurrentScene() {
    return this.scenes[this.currentIndex];
  }

  goToScene(name) {
    const index = this.scenes.indexOf(name);
    if (index === -1 || this.isTransitioning) return;
    if (index === this.currentIndex) return;
    const fromEl = this.sceneElements[this.scenes[this.currentIndex]];
    const toEl = this.sceneElements[name];
    this.currentIndex = index;
    this.transition(fromEl, toEl);
    this.eventBus.emit('sceneChange', { name, index });
  }

  next() {
    if (this.currentIndex < this.scenes.length - 1) {
      this.goToScene(this.scenes[this.currentIndex + 1]);
    }
  }

  prev() {
    if (this.currentIndex > 0) {
      this.goToScene(this.scenes[this.currentIndex - 1]);
    }
  }

  reset() {
    this.isTransitioning = false;
    // Remove active from all scenes
    Object.values(this.sceneElements).forEach(el => {
      if (el) el.classList.remove('active');
    });
    // Reset scene-specific states
    this.eventBus.emit('reset');
    this.currentIndex = 0;
    const loadingEl = this.sceneElements['loading'];
    if (loadingEl) loadingEl.classList.add('active');
    this.eventBus.emit('sceneChange', { name: 'loading', index: 0 });
  }

  transition(fromEl, toEl) {
    if (!fromEl || !toEl) return;
    this.isTransitioning = true;
    fromEl.classList.remove('active');
    setTimeout(() => {
      toEl.classList.add('active');
      setTimeout(() => {
        this.isTransitioning = false;
      }, 800);
    }, 100);
  }
}

/* ============================================================
   3. CanvasRenderer — Particle systems on #fx-canvas
   ============================================================ */
class CanvasRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = [];
    this.maxParticles = 500;
    // Pre-allocate particle pool
    for (let i = 0; i < this.maxParticles; i++) {
      this.particles.push({
        active: false, x: 0, y: 0, vx: 0, vy: 0,
        life: 0, maxLife: 0, size: 0, color: '',
        type: 'golden', rotation: 0, rotationSpeed: 0,
        gravity: 0, opacity: 1, width: 0, height: 0
      });
    }
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  getInactiveParticle() {
    for (let i = 0; i < this.maxParticles; i++) {
      if (!this.particles[i].active) return this.particles[i];
    }
    return null;
  }

  addParticles(type, count, x, y, config = {}) {
    for (let i = 0; i < count; i++) {
      const p = this.getInactiveParticle();
      if (!p) break;
      p.active = true;
      p.x = x + (Math.random() - 0.5) * (config.spread || 50);
      p.y = y + (Math.random() - 0.5) * (config.spread || 50);
      p.rotation = Math.random() * Math.PI * 2;
      p.rotationSpeed = (Math.random() - 0.5) * 0.1;
      p.opacity = 1;

      switch (type) {
        case 'golden':
          p.type = 'golden';
          p.vx = (Math.random() - 0.5) * 2;
          p.vy = -Math.random() * 2 - 0.5;
          p.size = Math.random() * 4 + 2;
          p.maxLife = 2000 + Math.random() * 1000;
          p.life = p.maxLife;
          p.gravity = 0.02;
          p.color = Math.random() > 0.5 ? '#F7C948' : '#FFD54F';
          break;
        case 'confetti':
          p.type = 'confetti';
          p.vx = (Math.random() - 0.5) * 8;
          p.vy = -Math.random() * 10 - 3;
          p.width = Math.random() * 8 + 4;
          p.height = Math.random() * 6 + 3;
          p.size = 0;
          p.maxLife = 3000 + Math.random() * 1000;
          p.life = p.maxLife;
          p.gravity = 0.15;
          p.rotationSpeed = (Math.random() - 0.5) * 0.3;
          const colors = ['#F7C948', '#FFD54F', '#FF6B35', '#e74c3c', '#5E9B49', '#FF69B4'];
          p.color = colors[Math.floor(Math.random() * colors.length)];
          break;
        case 'petal':
          p.type = 'petal';
          p.vx = (Math.random() - 0.5) * 1.5;
          p.vy = Math.random() * 1 + 0.5;
          p.size = Math.random() * 6 + 3;
          p.maxLife = 4000 + Math.random() * 2000;
          p.life = p.maxLife;
          p.gravity = 0.01;
          p.color = `rgba(255, ${150 + Math.floor(Math.random()*50)}, ${180 + Math.floor(Math.random()*50)}, 0.8)`;
          break;
        case 'spark':
          p.type = 'spark';
          const angle = Math.random() * Math.PI * 2;
          const speed = Math.random() * 6 + 3;
          p.vx = Math.cos(angle) * speed;
          p.vy = Math.sin(angle) * speed;
          p.size = Math.random() * 2 + 1;
          p.maxLife = 800 + Math.random() * 400;
          p.life = p.maxLife;
          p.gravity = 0.1;
          p.color = '#FFFFFF';
          break;
        case 'firefly':
          p.type = 'firefly';
          p.vx = (Math.random() - 0.5) * 0.8;
          p.vy = (Math.random() - 0.5) * 0.8;
          p.size = Math.random() * 3 + 1.5;
          p.maxLife = 5000 + Math.random() * 3000;
          p.life = p.maxLife;
          p.gravity = 0;
          const warmColors = ['#F7C948', '#FFD54F', '#FFA500', '#FFE4B5'];
          p.color = warmColors[Math.floor(Math.random() * warmColors.length)];
          break;
      }
    }
  }

  addFirework(x, y) {
    this.addParticles('spark', 40, x, y, { spread: 5 });
    // Add some golden particles too
    this.addParticles('golden', 15, x, y, { spread: 20 });
  }

  update(dt) {
    const dtSec = dt / 1000;
    for (let i = 0; i < this.maxParticles; i++) {
      const p = this.particles[i];
      if (!p.active) continue;

      p.life -= dt;
      if (p.life <= 0) {
        p.active = false;
        continue;
      }

      p.opacity = Math.max(0, p.life / p.maxLife);
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;
      p.rotation += p.rotationSpeed;

      // Firefly random drift
      if (p.type === 'firefly') {
        p.vx += (Math.random() - 0.5) * 0.1;
        p.vy += (Math.random() - 0.5) * 0.1;
        p.vx *= 0.99;
        p.vy *= 0.99;
      }

      // Drag for confetti
      if (p.type === 'confetti') {
        p.vx *= 0.98;
      }
    }
  }

  render() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    for (let i = 0; i < this.maxParticles; i++) {
      const p = this.particles[i];
      if (!p.active) continue;

      this.ctx.save();
      this.ctx.globalAlpha = p.opacity;
      this.ctx.translate(p.x, p.y);
      this.ctx.rotate(p.rotation);

      switch (p.type) {
        case 'golden':
          this.ctx.beginPath();
          this.ctx.arc(0, 0, p.size, 0, Math.PI * 2);
          this.ctx.fillStyle = p.color;
          this.ctx.fill();
          break;
        case 'confetti':
          this.ctx.fillStyle = p.color;
          this.ctx.fillRect(-p.width / 2, -p.height / 2, p.width, p.height);
          break;
        case 'petal':
          this.ctx.beginPath();
          this.ctx.ellipse(0, 0, p.size, p.size * 0.6, 0, 0, Math.PI * 2);
          this.ctx.fillStyle = p.color;
          this.ctx.fill();
          break;
        case 'spark':
          this.ctx.beginPath();
          this.ctx.arc(0, 0, p.size, 0, Math.PI * 2);
          this.ctx.fillStyle = p.color;
          this.ctx.shadowBlur = 6;
          this.ctx.shadowColor = '#FFFFFF';
          this.ctx.fill();
          break;
        case 'firefly':
          this.ctx.beginPath();
          this.ctx.arc(0, 0, p.size, 0, Math.PI * 2);
          this.ctx.fillStyle = p.color;
          this.ctx.shadowBlur = 10;
          this.ctx.shadowColor = p.color;
          this.ctx.fill();
          break;
      }
      this.ctx.restore();
    }
  }

  clear() {
    for (let i = 0; i < this.maxParticles; i++) {
      this.particles[i].active = false;
    }
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
}

/* ============================================================
   4. AnimationEngine — Single rAF loop
   ============================================================ */
class AnimationEngine {
  constructor(canvasRenderer, eventBus) {
    this.canvasRenderer = canvasRenderer;
    this.eventBus = eventBus;
    this.running = false;
    this.lastTime = 0;
    this.tick = this.tick.bind(this);
    this.sceneAnimations = {};
    this.intersectionObserver = null;
    this.setupIntersectionObserver();
  }

  setupIntersectionObserver() {
    this.intersectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
        }
      });
    }, { threshold: 0.2 });
  }

  observeElement(el) {
    if (this.intersectionObserver && el) {
      this.intersectionObserver.observe(el);
    }
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.lastTime = performance.now();
    requestAnimationFrame(this.tick);
  }

  stop() {
    this.running = false;
  }

  tick(timestamp) {
    if (!this.running) return;
    const dt = timestamp - this.lastTime;
    this.lastTime = timestamp;

    // Cap dt to avoid jumps when tab is inactive
    const cappedDt = Math.min(dt, 50);

    this.canvasRenderer.update(cappedDt);
    this.canvasRenderer.render();

    requestAnimationFrame(this.tick);
  }
}

/* ============================================================
   5. ThemeController — Dark/light toggle
   ============================================================ */
class ThemeController {
  constructor() {
    this.dark = false;
    try {
      this.dark = localStorage.getItem('theme') === 'dark';
    } catch (e) { /* localStorage unavailable */ }
    this.button = document.getElementById('theme-toggle');
    this.apply();
    this.button.addEventListener('click', () => this.toggle());
  }

  toggle() {
    this.dark = !this.dark;
    this.apply();
    try {
      localStorage.setItem('theme', this.dark ? 'dark' : 'light');
    } catch (e) { /* silent */ }
  }

  apply() {
    document.documentElement.setAttribute('data-theme', this.dark ? 'dark' : 'light');
    const icon = this.button.querySelector('.icon');
    if (icon) icon.textContent = this.dark ? '☀️' : '🌙';
  }
}

/* ============================================================
   6. AudioController — Background music
   ============================================================ */
class AudioController {
  constructor() {
    this.audio = new Audio('assets/music.mp3');
    this.audio.loop = true;
    this.audio.volume = 0.5;
    this.muted = false;
    this.started = false;
    this.failed = false;
    this.button = document.getElementById('audio-toggle');

    this.audio.addEventListener('error', () => {
      this.failed = true;
      this.button.style.display = 'none';
    });

    this.button.addEventListener('click', () => this.toggle());
  }

  start() {
    if (this.started || this.failed) return;
    this.started = true;
    this.audio.play().catch(() => {
      // Browser blocked autoplay, will retry on next interaction
      this.started = false;
    });
  }

  toggle() {
    if (this.failed) return;
    if (!this.started) {
      this.start();
      return;
    }
    this.muted = !this.muted;
    this.audio.muted = this.muted;
    const icon = this.button.querySelector('.icon');
    if (icon) icon.textContent = this.muted ? '🔇' : '🔊';
  }
}

/* ============================================================
   7. InteractionHandler — All input handling
   ============================================================ */
class InteractionHandler {
  constructor(sceneManager, canvasRenderer, eventBus) {
    this.sceneManager = sceneManager;
    this.canvasRenderer = canvasRenderer;
    this.eventBus = eventBus;

    // Touch swipe
    this.touchStartX = 0;
    this.touchStartY = 0;
    this.swipeThreshold = 50;

    // Konami code
    this.konamiCode = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65];
    this.konamiBuffer = [];

    // Cursor butterflies
    this.butterflies = [];
    this.mouseX = 0;
    this.mouseY = 0;

    this.bindEvents();
    this.createCursorButterflies();
  }

  bindEvents() {
    // NOTE: Global swipe-to-change-scene is DISABLED for iOS compatibility.
    // Each scene provides its own explicit tap/click "Continue" buttons.
    // Swipe is only used within the scrapbook scene for page navigation.

    // Scrapbook-only swipe detection
    const scrapbookEl = document.querySelector('[data-scene="scrapbook"]');
    if (scrapbookEl) {
      scrapbookEl.addEventListener('touchstart', (e) => {
        this.touchStartX = e.changedTouches[0].clientX;
        this.touchStartY = e.changedTouches[0].clientY;
      }, { passive: true });

      scrapbookEl.addEventListener('touchend', (e) => {
        const dx = e.changedTouches[0].clientX - this.touchStartX;
        if (Math.abs(dx) > this.swipeThreshold) {
          this.eventBus.emit('scrapbookSwipe', { direction: dx < 0 ? 'left' : 'right' });
        }
      }, { passive: true });
    }

    // Keyboard events (desktop fallback — not required on mobile)
    document.addEventListener('keydown', (e) => this.handleKeyboard(e));

    // Mouse move for cursor butterflies (desktop only)
    document.addEventListener('mousemove', (e) => {
      this.mouseX = e.clientX;
      this.mouseY = e.clientY;
    });

    // Animate butterflies (only on non-touch devices)
    if (!('ontouchstart' in window)) {
      this.animateButterflies();
    }
  }

  handleKeyboard(e) {
    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        e.preventDefault();
        this.sceneManager.next();
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        e.preventDefault();
        this.sceneManager.prev();
        break;
      case 'Escape':
        this.eventBus.emit('closeLightbox');
        break;
    }

    // Konami code detection
    this.konamiBuffer.push(e.keyCode);
    if (this.konamiBuffer.length > this.konamiCode.length) {
      this.konamiBuffer.shift();
    }
    if (this.konamiBuffer.length === this.konamiCode.length &&
        this.konamiBuffer.every((val, i) => val === this.konamiCode[i])) {
      this.konamiBuffer = [];
      // Trigger firework burst
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      for (let i = 0; i < 5; i++) {
        setTimeout(() => {
          this.canvasRenderer.addFirework(
            cx + (Math.random() - 0.5) * 400,
            cy + (Math.random() - 0.5) * 300
          );
        }, i * 200);
      }
    }
  }

  createCursorButterflies() {
    for (let i = 0; i < 3; i++) {
      const el = document.createElement('div');
      el.className = 'cursor-butterfly';
      el.textContent = '🦋';
      el.style.cssText = `
        position: fixed;
        pointer-events: none;
        z-index: 1000;
        font-size: ${14 + i * 4}px;
        opacity: ${0.8 - i * 0.2};
        transition: transform ${0.1 + i * 0.15}s ease-out;
        will-change: transform;
      `;
      document.body.appendChild(el);
      this.butterflies.push({ el, x: 0, y: 0, delay: (i + 1) * 5 });
    }
  }

  animateButterflies() {
    this.butterflies.forEach((b, i) => {
      const lag = 0.85 - i * 0.1;
      b.x += (this.mouseX - b.x) * (1 - lag);
      b.y += (this.mouseY - b.y) * (1 - lag);
      b.el.style.transform = `translate(${b.x + 15 + i * 10}px, ${b.y - 15 - i * 8}px)`;
    });
    requestAnimationFrame(() => this.animateButterflies());
  }
}

/* ============================================================
   8. PhotoGallery — Scrapbook functionality
   ============================================================ */
class PhotoGallery {
  constructor(eventBus, sceneManager) {
    this.eventBus = eventBus;
    this.sceneManager = sceneManager;
    this.currentPage = 0;
    this.pages = document.querySelectorAll('.scrapbook-page');
    this.totalPages = this.pages.length;
    this.lightboxOverlay = document.querySelector('.lightbox-overlay');
    this.lightboxImg = document.querySelector('.lightbox-img');
    this.lightboxClose = document.querySelector('.lightbox-close');
    this.prevBtn = document.querySelector('.prev-btn');
    this.nextBtn = document.querySelector('.next-btn');
    this.pageIndicator = document.querySelector('.page-indicator');
    this.shuffleBtn = document.querySelector('.shuffle-btn');
    this.continueBtn = document.querySelector('.scrapbook-continue-btn');

    this.setupLazyLoad();
    this.bindEvents();
  }

  setupLazyLoad() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
            observer.unobserve(img);
          }
        }
      });
    }, { rootMargin: '200px' });

    document.querySelectorAll('.photo-img[data-src]').forEach(img => {
      observer.observe(img);
    });
    // Also observe timeline photos
    document.querySelectorAll('.timeline-photo[data-src]').forEach(img => {
      observer.observe(img);
    });
  }

  bindEvents() {
    // Photo clicks → open lightbox
    document.querySelectorAll('.photo-slot').forEach(slot => {
      slot.addEventListener('click', () => {
        const img = slot.querySelector('.photo-img');
        if (img && (img.src || img.dataset.src)) {
          this.openLightbox(img.src || img.dataset.src);
        }
      });
    });

    // Lightbox close
    if (this.lightboxClose) {
      this.lightboxClose.addEventListener('click', (e) => { e.stopPropagation(); this.closeLightbox(); });
      this.lightboxClose.addEventListener('touchend', (e) => { e.preventDefault(); e.stopPropagation(); this.closeLightbox(); }, { passive: false });
    }
    if (this.lightboxOverlay) {
      this.lightboxOverlay.addEventListener('click', (e) => {
        if (e.target === this.lightboxOverlay) this.closeLightbox();
      });
    }

    // Navigation
    if (this.prevBtn) this.prevBtn.addEventListener('click', () => this.prevPage());
    if (this.nextBtn) this.nextBtn.addEventListener('click', () => this.nextPage());
    if (this.shuffleBtn) this.shuffleBtn.addEventListener('click', () => this.shuffle());

    // Listen for escape key
    this.eventBus.on('closeLightbox', () => this.closeLightbox());

    // Listen for scrapbook swipe events from InteractionHandler
    this.eventBus.on('scrapbookSwipe', ({ direction }) => {
      if (direction === 'left') this.nextPage();
      else this.prevPage();
    });

    // Continue button to advance past scrapbook
    if (this.continueBtn) {
      this.continueBtn.addEventListener('click', () => {
        if (this.sceneManager) this.sceneManager.next();
      });
    }
  }

  openLightbox(src) {
    if (!this.lightboxOverlay || !this.lightboxImg) return;
    this.lightboxImg.src = src;
    this.lightboxOverlay.classList.add('active');
    this.lightboxOverlay.setAttribute('aria-hidden', 'false');
  }

  closeLightbox() {
    if (!this.lightboxOverlay) return;
    this.lightboxOverlay.classList.remove('active');
    this.lightboxOverlay.setAttribute('aria-hidden', 'true');
  }

  nextPage() {
    if (this.currentPage >= this.totalPages - 1) return;
    this.pages[this.currentPage].classList.remove('active');
    this.currentPage++;
    this.pages[this.currentPage].classList.add('active');
    this.updateNav();
  }

  prevPage() {
    if (this.currentPage <= 0) return;
    this.pages[this.currentPage].classList.remove('active');
    this.currentPage--;
    this.pages[this.currentPage].classList.add('active');
    this.updateNav();
  }

  updateNav() {
    if (this.prevBtn) this.prevBtn.disabled = this.currentPage === 0;
    if (this.nextBtn) this.nextBtn.disabled = this.currentPage >= this.totalPages - 1;
    if (this.pageIndicator) {
      this.pageIndicator.textContent = `Page ${this.currentPage + 1} of ${this.totalPages}`;
    }
  }

  shuffle() {
    const activePage = this.pages[this.currentPage];
    if (!activePage) return;
    const slots = Array.from(activePage.querySelectorAll('.photo-slot'));
    // Shuffle positions by randomizing order
    for (let i = slots.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      activePage.appendChild(slots[j]);
    }
  }
}

/* ============================================================
   9. Scene-Specific Logic
   ============================================================ */

/* --- LOADING SCENE --- */
class LoadingScene {
  constructor(sceneManager, eventBus) {
    this.sceneManager = sceneManager;
    this.eventBus = eventBus;
    this.progressBarFill = document.querySelector('.progress-bar-fill');
    this.progressText = document.querySelector('.progress-text');
    this.progress = 0;
    this.loaded = false;
  }

  start() {
    const photos = [];
    for (let i = 1; i <= 10; i++) {
      photos.push(`assets/photos/photo${i}.jpg`);
    }

    let loadedCount = 0;
    const totalAssets = photos.length + 1; // photos + audio

    const updateProgress = () => {
      loadedCount++;
      this.progress = Math.round((loadedCount / totalAssets) * 100);
      this.updateUI();
      if (loadedCount >= totalAssets) {
        this.complete();
      }
    };

    // Preload photos
    photos.forEach(src => {
      const img = new Image();
      img.onload = updateProgress;
      img.onerror = updateProgress; // Count errors as loaded to not block
      img.src = src;
    });

    // Audio preload
    const audio = new Audio('assets/music.mp3');
    audio.addEventListener('canplaythrough', updateProgress, { once: true });
    audio.addEventListener('error', updateProgress, { once: true });
    audio.load();

    // Timeout fallback: 5 seconds max
    setTimeout(() => {
      if (!this.loaded) this.complete();
    }, 5000);
  }

  updateUI() {
    if (this.progressBarFill) {
      this.progressBarFill.style.width = this.progress + '%';
    }
    if (this.progressText) {
      this.progressText.textContent = this.progress + '%';
    }
  }

  complete() {
    if (this.loaded) return;
    this.loaded = true;
    this.progress = 100;
    this.updateUI();
    setTimeout(() => {
      this.sceneManager.next();
    }, 800);
  }
}

/* --- LANDING SCENE --- */
class LandingScene {
  constructor(sceneManager, eventBus) {
    this.sceneManager = sceneManager;
    this.eventBus = eventBus;
    this.sunflower = document.querySelector('.giant-sunflower');
    this.bloomed = false;
    this.bindEvents();
  }

  bindEvents() {
    if (this.sunflower) {
      this.sunflower.addEventListener('click', () => this.bloom());
      this.sunflower.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') this.bloom();
      });
    }
  }

  bloom() {
    if (this.bloomed) return;
    this.bloomed = true;
    this.sunflower.classList.add('bloomed');
    setTimeout(() => {
      this.sceneManager.next();
    }, 800);
  }

  reset() {
    this.bloomed = false;
    if (this.sunflower) this.sunflower.classList.remove('bloomed');
  }
}

/* --- GIFT SCENE --- */
class GiftScene {
  constructor(sceneManager, canvasRenderer, eventBus) {
    this.sceneManager = sceneManager;
    this.canvasRenderer = canvasRenderer;
    this.eventBus = eventBus;
    this.giftBox = document.querySelector('.gift-box');
    this.opened = false;
    this.bindEvents();
  }

  bindEvents() {
    if (this.giftBox) {
      this.giftBox.addEventListener('click', () => this.open());
      this.giftBox.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') this.open();
      });
    }
  }

  open() {
    if (this.opened) return;
    this.opened = true;
    this.giftBox.classList.add('opening');

    // After 1.5s: spawn confetti + golden particles
    setTimeout(() => {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      this.canvasRenderer.addParticles('confetti', 60, cx, cy, { spread: 100 });
      this.canvasRenderer.addParticles('golden', 30, cx, cy - 50, { spread: 80 });
    }, 1500);

    // After 3s: next scene
    setTimeout(() => {
      this.sceneManager.next();
    }, 3000);
  }

  reset() {
    this.opened = false;
    if (this.giftBox) this.giftBox.classList.remove('opening');
  }
}

/* --- GARDEN SCENE --- */
class GardenScene {
  constructor(sceneManager, canvasRenderer, eventBus) {
    this.sceneManager = sceneManager;
    this.canvasRenderer = canvasRenderer;
    this.eventBus = eventBus;
    this.flowers = document.querySelectorAll('.garden-sunflower');
    this.butterflyContainer = document.querySelector('.butterfly-container');
    this.bloomedCount = 0;
    this.totalFlowers = this.flowers.length;
    this.continueHint = null;
    this.bindEvents();
  }

  bindEvents() {
    this.flowers.forEach(flower => {
      flower.addEventListener('click', () => this.bloomFlower(flower));
      flower.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') this.bloomFlower(flower);
      });
    });
  }

  bloomFlower(flower) {
    if (flower.classList.contains('bloomed')) return;
    flower.classList.add('bloomed');
    this.bloomedCount++;

    // Show wish message
    const wish = flower.querySelector('.wish-message');
    if (wish) wish.classList.add('visible');

    // Spawn a butterfly
    this.spawnButterfly();

    // Check if all bloomed
    if (this.bloomedCount >= this.totalFlowers) {
      this.showContinueHint();
    }
  }

  spawnButterfly() {
    if (!this.butterflyContainer) return;
    const butterfly = document.createElement('div');
    butterfly.className = 'butterfly';
    butterfly.textContent = '🦋';
    butterfly.style.left = Math.random() * 80 + 10 + '%';
    butterfly.style.top = Math.random() * 60 + 20 + '%';
    butterfly.style.animationDuration = (6 + Math.random() * 6) + 's';
    butterfly.style.animationDelay = Math.random() * 2 + 's';
    this.butterflyContainer.appendChild(butterfly);
  }

  showContinueHint() {
    if (this.continueHint) return;
    this.continueHint = document.createElement('button');
    this.continueHint.className = 'continue-hint';
    this.continueHint.textContent = 'Continue →';
    this.continueHint.style.cssText = `
      position: absolute; bottom: 2rem; left: 50%; transform: translateX(-50%);
      padding: 0.8rem 2rem; font-family: 'Poppins', sans-serif; font-size: 1rem;
      background: linear-gradient(135deg, var(--accent-gold), var(--accent-yellow));
      color: var(--accent-brown); border: none; border-radius: 50px;
      cursor: pointer; box-shadow: 0 4px 20px rgba(247, 201, 72, 0.4);
      animation: breathe 2s ease-in-out infinite; z-index: 20;
    `;
    this.continueHint.addEventListener('click', () => this.sceneManager.next());
    const container = document.querySelector('.garden-container');
    if (container) container.appendChild(this.continueHint);
  }

  reset() {
    this.bloomedCount = 0;
    this.flowers.forEach(f => {
      f.classList.remove('bloomed');
      const wish = f.querySelector('.wish-message');
      if (wish) wish.classList.remove('visible');
    });
    if (this.butterflyContainer) this.butterflyContainer.innerHTML = '';
    if (this.continueHint) {
      this.continueHint.remove();
      this.continueHint = null;
    }
  }
}

/* --- TIMELINE SCENE --- */
class TimelineScene {
  constructor(sceneManager, animationEngine, eventBus) {
    this.sceneManager = sceneManager;
    this.animationEngine = animationEngine;
    this.eventBus = eventBus;
    this.entries = document.querySelectorAll('.timeline-entry');
    this.continueBtn = null;
    this.observed = false;
  }

  activate() {
    if (!this.observed) {
      this.observed = true;
      this.entries.forEach(entry => {
        const card = entry.querySelector('.timeline-card');
        if (card) {
          this.animationEngine.observeElement(card);
        }
      });
    }
    // Reveal cards with staggered timing when scene is active
    this.entries.forEach((entry, i) => {
      const card = entry.querySelector('.timeline-card');
      if (card) {
        setTimeout(() => {
          card.classList.add('revealed');
        }, i * 300);
      }
    });
    this.addContinueButton();
  }

  addContinueButton() {
    if (this.continueBtn) return;
    this.continueBtn = document.createElement('button');
    this.continueBtn.className = 'continue-hint';
    this.continueBtn.textContent = 'Continue →';
    this.continueBtn.style.cssText = `
      display: block; margin: 2rem auto; padding: 0.8rem 2rem;
      font-family: 'Poppins', sans-serif; font-size: 1rem;
      background: linear-gradient(135deg, var(--accent-gold), var(--accent-yellow));
      color: var(--accent-brown); border: none; border-radius: 50px;
      cursor: pointer; box-shadow: 0 4px 20px rgba(247, 201, 72, 0.4);
    `;
    this.continueBtn.addEventListener('click', () => this.sceneManager.next());
    const container = document.querySelector('.timeline-container');
    if (container) container.appendChild(this.continueBtn);
  }

  reset() {
    this.entries.forEach(entry => {
      const card = entry.querySelector('.timeline-card');
      if (card) card.classList.remove('revealed');
    });
    if (this.continueBtn) {
      this.continueBtn.remove();
      this.continueBtn = null;
    }
  }
}

/* --- CAKE SCENE --- */
class CakeScene {
  constructor(sceneManager, canvasRenderer, eventBus) {
    this.sceneManager = sceneManager;
    this.canvasRenderer = canvasRenderer;
    this.eventBus = eventBus;
    this.wishBtn = document.querySelector('.wish-btn');
    this.flames = document.querySelector('.flames');
    this.wished = false;
    this.bindEvents();
  }

  bindEvents() {
    if (this.wishBtn) {
      this.wishBtn.addEventListener('click', () => this.makeWish());
      // iOS fallback - ensure touch triggers
      this.wishBtn.addEventListener('touchend', (e) => {
        e.preventDefault();
        this.makeWish();
      }, { passive: false });
    }
  }

  makeWish() {
    if (this.wished) return;
    this.wished = true;

    // Extinguish flames - hide the SVG flame elements
    if (this.flames) {
      this.flames.style.transition = 'opacity 0.8s ease';
      this.flames.style.opacity = '0';
    }

    // Hide button
    if (this.wishBtn) {
      this.wishBtn.style.transition = 'opacity 0.5s ease';
      this.wishBtn.style.opacity = '0';
      this.wishBtn.style.pointerEvents = 'none';
    }

    // After 1s: spawn fireworks
    setTimeout(() => {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 3;
      for (let i = 0; i < 5; i++) {
        setTimeout(() => {
          this.canvasRenderer.addFirework(
            cx + (Math.random() - 0.5) * 400,
            cy + (Math.random() - 0.5) * 200
          );
        }, i * 300);
      }
      this.canvasRenderer.addParticles('confetti', 40, cx, cy, { spread: 150 });
    }, 1000);

    // After 3.5s: next scene
    setTimeout(() => {
      this.sceneManager.next();
    }, 3500);
  }

  reset() {
    this.wished = false;
    if (this.flames) {
      this.flames.style.transition = '';
      this.flames.style.opacity = '1';
    }
    if (this.wishBtn) {
      this.wishBtn.style.transition = '';
      this.wishBtn.style.opacity = '1';
      this.wishBtn.style.pointerEvents = '';
    }
  }
}

/* --- LETTER SCENE --- */
class LetterScene {
  constructor(sceneManager, eventBus) {
    this.sceneManager = sceneManager;
    this.eventBus = eventBus;
    this.envelope = document.querySelector('.envelope');
    this.letterPaper = document.querySelector('.letter-paper');
    this.letterContent = document.querySelector('.letter-content');
    this.letterHint = document.querySelector('.letter-hint');
    this.opened = false;
    this.typewriterInterval = null;
    this.continueBtn = null;

    this.letterText = "Dear Mithu,\n\nToday is a celebration of someone truly wonderful.\n\nMay this birthday bring endless smiles, unforgettable adventures, good health, peace, and beautiful memories.\n\nLike a sunflower, may you always find the light, stand tall through every season, and continue brightening the lives of everyone around you.\n\nKeep smiling.\nKeep dreaming.\nKeep blooming.\n\nHappy Birthday.\n🌻";

    // Bind tap-to-open
    if (this.envelope) {
      this.envelope.addEventListener('click', () => this.open());
      this.envelope.addEventListener('touchend', (e) => {
        e.preventDefault();
        this.open();
      }, { passive: false });
    }
  }

  activate() {
    // Scene entered — just wait for user to tap envelope
  }

  open() {
    if (this.opened) return;
    this.opened = true;

    // Open envelope — CSS handles flap + paper slide
    if (this.envelope) {
      this.envelope.classList.add('opened');
      this.envelope.style.cursor = 'default';
    }

    // Hide the hint
    if (this.letterHint) {
      this.letterHint.style.opacity = '0';
    }

    // After 2s (paper slides up): start typewriter
    setTimeout(() => {
      this.startTypewriter();
    }, 2000);
  }

  startTypewriter() {
    if (!this.letterContent) return;
    this.letterContent.innerHTML = '';
    this.letterContent.style.fontFamily = "'Great Vibes', cursive";
    this.letterContent.style.fontSize = 'clamp(1rem, 2.5vw, 1.5rem)';
    this.letterContent.style.lineHeight = '1.8';
    this.letterContent.style.whiteSpace = 'pre-wrap';
    this.letterContent.style.color = 'var(--accent-brown)';

    let charIndex = 0;
    const text = this.letterText;
    const cursor = document.createElement('span');
    cursor.className = 'typewriter-cursor';

    this.letterContent.appendChild(cursor);

    this.typewriterInterval = setInterval(() => {
      if (charIndex < text.length) {
        const char = text[charIndex];
        // Insert character before cursor
        const textNode = document.createTextNode(char);
        this.letterContent.insertBefore(textNode, cursor);
        charIndex++;

        // Auto scroll
        if (this.letterPaper) {
          this.letterPaper.scrollTop = this.letterPaper.scrollHeight;
        }
      } else {
        clearInterval(this.typewriterInterval);
        this.typewriterInterval = null;
        // Remove cursor after a pause
        setTimeout(() => {
          cursor.remove();
          this.showContinueButton();
        }, 1000);
      }
    }, 25); // ~40 chars/sec
  }

  showContinueButton() {
    if (this.continueBtn) return;
    this.continueBtn = document.createElement('button');
    this.continueBtn.className = 'continue-hint';
    this.continueBtn.textContent = 'Continue →';
    this.continueBtn.style.cssText = `
      display: block; margin: 1.5rem auto; padding: 0.8rem 2rem;
      font-family: 'Poppins', sans-serif; font-size: 1rem;
      background: linear-gradient(135deg, var(--accent-gold), var(--accent-yellow));
      color: var(--accent-brown); border: none; border-radius: 50px;
      cursor: pointer; box-shadow: 0 4px 20px rgba(247, 201, 72, 0.4);
      z-index: 50;
    `;
    this.continueBtn.addEventListener('click', () => this.sceneManager.next());
    const container = document.querySelector('.letter-container');
    if (container) container.appendChild(this.continueBtn);
  }

  reset() {
    this.opened = false;
    if (this.typewriterInterval) {
      clearInterval(this.typewriterInterval);
      this.typewriterInterval = null;
    }
    if (this.envelope) {
      this.envelope.classList.remove('opened');
      this.envelope.style.cursor = 'pointer';
    }
    if (this.letterHint) {
      this.letterHint.style.opacity = '1';
    }
    if (this.letterContent) {
      this.letterContent.innerHTML = '';
    }
    if (this.continueBtn) {
      this.continueBtn.remove();
      this.continueBtn = null;
    }
  }
}

/* --- FINALE SCENE --- */
class FinaleScene {
  constructor(sceneManager, canvasRenderer, eventBus) {
    this.sceneManager = sceneManager;
    this.canvasRenderer = canvasRenderer;
    this.eventBus = eventBus;
    this.restartBtn = document.querySelector('.restart-btn');
    this.active = false;
    this.fireflyInterval = null;
    this.fireworkInterval = null;
    this.bindEvents();
  }

  bindEvents() {
    if (this.restartBtn) {
      const doRestart = (e) => {
        e.preventDefault();
        this.deactivate();
        this.sceneManager.reset();
      };
      this.restartBtn.addEventListener('click', doRestart);
      this.restartBtn.addEventListener('touchend', doRestart, { passive: false });
    }
  }

  activate() {
    if (this.active) return;
    this.active = true;

    // Spawn continuous fireflies
    this.fireflyInterval = setInterval(() => {
      this.canvasRenderer.addParticles('firefly', 3,
        Math.random() * window.innerWidth,
        Math.random() * window.innerHeight,
        { spread: 100 }
      );
    }, 800);

    // Occasional fireworks
    this.fireworkInterval = setInterval(() => {
      this.canvasRenderer.addFirework(
        Math.random() * window.innerWidth,
        Math.random() * (window.innerHeight * 0.5)
      );
    }, 2500);
  }

  deactivate() {
    this.active = false;
    if (this.fireflyInterval) {
      clearInterval(this.fireflyInterval);
      this.fireflyInterval = null;
    }
    if (this.fireworkInterval) {
      clearInterval(this.fireworkInterval);
      this.fireworkInterval = null;
    }
    this.canvasRenderer.clear();
  }

  reset() {
    this.deactivate();
  }
}

/* ============================================================
   10. Fullscreen Toggle
   ============================================================ */
class FullscreenController {
  constructor() {
    this.button = document.getElementById('fullscreen-toggle');
    if (this.button) {
      this.button.addEventListener('click', () => this.toggle());
    }
  }

  toggle() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  }
}

/* ============================================================
   11. Initialization — DOMContentLoaded
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  // Create core instances
  const eventBus = new EventBus();
  const canvas = document.getElementById('fx-canvas');
  const canvasRenderer = new CanvasRenderer(canvas);
  const animationEngine = new AnimationEngine(canvasRenderer, eventBus);
  const sceneManager = new SceneManager(eventBus);
  const themeController = new ThemeController();
  const audioController = new AudioController();
  const fullscreenController = new FullscreenController();
  const interactionHandler = new InteractionHandler(sceneManager, canvasRenderer, eventBus);
  const photoGallery = new PhotoGallery(eventBus, sceneManager);

  // Create scene instances
  const loadingScene = new LoadingScene(sceneManager, eventBus);
  const landingScene = new LandingScene(sceneManager, eventBus);
  const giftScene = new GiftScene(sceneManager, canvasRenderer, eventBus);
  const gardenScene = new GardenScene(sceneManager, canvasRenderer, eventBus);
  const timelineScene = new TimelineScene(sceneManager, animationEngine, eventBus);
  const cakeScene = new CakeScene(sceneManager, canvasRenderer, eventBus);
  const letterScene = new LetterScene(sceneManager, eventBus);
  const finaleScene = new FinaleScene(sceneManager, canvasRenderer, eventBus);

  // Handle scene change events
  eventBus.on('sceneChange', ({ name }) => {
    // Activate scene-specific logic
    if (name === 'timeline') timelineScene.activate();
    if (name === 'letter') letterScene.activate();
    if (name === 'finale') finaleScene.activate();
  });

  // Handle reset
  eventBus.on('reset', () => {
    landingScene.reset();
    giftScene.reset();
    gardenScene.reset();
    timelineScene.reset();
    cakeScene.reset();
    letterScene.reset();
    finaleScene.reset();
    canvasRenderer.clear();
  });

  // Start audio on first user interaction
  const startAudioOnce = () => {
    audioController.start();
    document.removeEventListener('click', startAudioOnce);
    document.removeEventListener('touchstart', startAudioOnce);
  };
  document.addEventListener('click', startAudioOnce);
  document.addEventListener('touchstart', startAudioOnce);

  // Start the animation loop
  animationEngine.start();

  // Start loading sequence
  loadingScene.start();
});
