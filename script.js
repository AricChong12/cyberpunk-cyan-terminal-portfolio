/**
 * ==========================================================================
 * CYBERPUNK / HACKER PORTFOLIO JAVASCRIPT ENGINE
 * Stack: Pure Vanilla ES6+ (No libraries, No frameworks, No dependencies)
 * Modules:
 *   1. Web Audio SFX Synthesizer (Zero external files)
 *   2. Matrix Digital Rain Canvas (Optimized, Visibility-Aware)
 *   3. Terminal Typewriter Engine (Rotating Roles & Commands)
 *   4. Reusable Project Carousel Component (Touch, Keyboard, Infinite Loop)
 *   5. Reusable Shared Cyber Lightbox (Zoom 1x/2x, Pan, Group Nav, Trap Focus)
 *   6. Scroll-Spy Navigation & Mobile Drawer
 *   7. Scroll-Reveal Intersection Observer
 *   8. Terminal Contact Form & Clipboard Transmitter
 *   9. Dynamic Cyber Image Fallback Shield
 * ==========================================================================
 */

(() => {
  'use strict';

  // Check prefers-reduced-motion
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ==========================================================================
     01. NATIVE WEB AUDIO SFX SYNTHESIZER
     Generates crisp cyber bleeps and UI hums using Web Audio API without files.
     ========================================================================== */
  class CyberAudio {
    constructor() {
      this.ctx = null;
      this.enabled = false;
      this.initToggle();
    }

    init() {
      if (!this.ctx && (window.AudioContext || window.webkitAudioContext)) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioCtx();
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    }

    initToggle() {
      const toggleBtn = document.getElementById('sfx-toggle');
      if (!toggleBtn) return;

      toggleBtn.addEventListener('click', () => {
        this.init();
        this.enabled = !this.enabled;
        toggleBtn.classList.toggle('is-active', this.enabled);
        toggleBtn.setAttribute('aria-pressed', String(this.enabled));
        const statusSpan = toggleBtn.querySelector('.sfx-status');
        if (statusSpan) {
          statusSpan.textContent = this.enabled ? 'ON' : 'OFF';
        }
        if (this.enabled) {
          this.playBeep(880, 'sine', 0.08, 0.05);
        }
      });
    }

    playBeep(freq = 600, type = 'sine', duration = 0.06, gainLevel = 0.04) {
      if (!this.enabled || !this.ctx) return;
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        gain.gain.setValueAtTime(gainLevel, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + duration);
      } catch {
        // Ignore audio context autoplay limitations
      }
    }

    playClick() {
      this.playBeep(1200, 'triangle', 0.04, 0.03);
    }

    playOpen() {
      this.playBeep(720, 'sine', 0.09, 0.04);
      setTimeout(() => this.playBeep(1080, 'sine', 0.1, 0.04), 50);
    }

    playGlitch() {
      this.playBeep(240, 'sawtooth', 0.08, 0.03);
    }
  }

  const sfx = new CyberAudio();

  /* ==========================================================================
     02. MATRIX DIGITAL RAIN CANVAS
     Lightweight, high-framerate, pauses when tab is hidden or reduced motion.
     ========================================================================== */
  class MatrixRain {
    constructor(canvasId) {
      this.canvas = document.getElementById(canvasId);
      if (!this.canvas || prefersReducedMotion) return;

      this.ctx = this.canvas.getContext('2d');
      this.characters = '0123456789ABCDEFｦｱｳｴｵｶｷｹｺｻｼｽｾｿﾀﾂﾃﾅﾆﾇﾈﾊﾋﾎﾏﾐﾑﾒﾓﾔﾕﾗﾘﾜ'.split('');
      this.fontSize = 14;
      this.columns = 0;
      this.drops = [];
      this.animationFrame = null;
      this.isPaused = false;
      this.lastDrawTime = 0;
      this.fps = 30; // 30 FPS saves CPU while looking cinematic
      this.fpsInterval = 1000 / this.fps;

      this.resize();
      this.bindEvents();
      this.start();
    }

    resize() {
      if (!this.canvas) return;
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
      this.columns = Math.floor(this.canvas.width / this.fontSize);
      this.drops = [];
      for (let i = 0; i < this.columns; i++) {
        // Random starting positions above viewport
        this.drops[i] = Math.floor(Math.random() * -this.canvas.height / this.fontSize);
      }
    }

    bindEvents() {
      window.addEventListener('resize', () => {
        clearTimeout(this.resizeTimer);
        this.resizeTimer = setTimeout(() => this.resize(), 150);
      });

      // Pause when tab is inactive to preserve CPU / battery
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          this.pause();
        } else {
          this.resume();
        }
      });
    }

    draw(now) {
      if (this.isPaused) return;

      this.animationFrame = requestAnimationFrame((timestamp) => this.draw(timestamp));

      const elapsed = now - this.lastDrawTime;
      if (elapsed < this.fpsInterval) return;
      this.lastDrawTime = now - (elapsed % this.fpsInterval);

      // Translucent black overlay creates fading trails
      this.ctx.fillStyle = 'rgba(5, 5, 8, 0.12)';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

      this.ctx.font = `${this.fontSize}px 'Share Tech Mono', monospace`;

      for (let i = 0; i < this.drops.length; i++) {
        const text = this.characters[Math.floor(Math.random() * this.characters.length)];
        const x = i * this.fontSize;
        const y = this.drops[i] * this.fontSize;

        // Leading char is bright cyan-white, trailing chars are cyan/dim teal
        if (Math.random() > 0.88) {
          this.ctx.fillStyle = '#ffffff';
          this.ctx.shadowColor = '#00f0ff';
          this.ctx.shadowBlur = 8;
        } else if (Math.random() > 0.5) {
          this.ctx.fillStyle = '#00f0ff';
          this.ctx.shadowBlur = 4;
        } else {
          this.ctx.fillStyle = '#0891a0';
          this.ctx.shadowBlur = 0;
        }

        this.ctx.fillText(text, x, y);

        if (y > this.canvas.height && Math.random() > 0.975) {
          this.drops[i] = 0;
        }
        this.drops[i]++;
      }
    }

    start() {
      this.lastDrawTime = performance.now();
      this.animationFrame = requestAnimationFrame((now) => this.draw(now));
    }

    pause() {
      this.isPaused = true;
      if (this.animationFrame) {
        cancelAnimationFrame(this.animationFrame);
      }
    }

    resume() {
      if (!this.isPaused) return;
      this.isPaused = false;
      this.start();
    }
  }

  /* ==========================================================================
     03. TERMINAL TYPEWRITER ENGINE
     Smooth typing & deleting of rotating hacker roles in the Hero section.
     ========================================================================== */
  class Typewriter {
    constructor(elementId, words, typingSpeed = 75, deletingSpeed = 40, pauseDuration = 2200) {
      this.element = document.getElementById(elementId);
      if (!this.element) return;

      this.words = words || ['[MY ROLE]'];
      this.typingSpeed = typingSpeed;
      this.deletingSpeed = deletingSpeed;
      this.pauseDuration = pauseDuration;

      this.wordIndex = 0;
      this.charIndex = 0;
      this.isDeleting = false;

      this.type();
    }

    type() {
      const currentWord = this.words[this.wordIndex];

      if (this.isDeleting) {
        this.charIndex--;
        this.element.textContent = currentWord.substring(0, this.charIndex);
      } else {
        this.charIndex++;
        this.element.textContent = currentWord.substring(0, this.charIndex);
      }

      let delta = this.isDeleting ? this.deletingSpeed : this.typingSpeed;

      if (!this.isDeleting && this.charIndex === currentWord.length) {
        delta = this.pauseDuration;
        this.isDeleting = true;
      } else if (this.isDeleting && this.charIndex === 0) {
        this.isDeleting = false;
        this.wordIndex = (this.wordIndex + 1) % this.words.length;
        delta = 400;
      }

      setTimeout(() => this.type(), delta);
    }
  }

  /* ==========================================================================
     04. REUSABLE PROJECT CAROUSEL COMPONENT
     Fully independent per-instance carousel class.
     Supports: Next/Prev arrows, dots, counter, swipe, keyboard, infinite wrap.
     ========================================================================== */
  class ProjectCarousel {
    constructor(carouselEl) {
      this.el = carouselEl;
      this.track = this.el.querySelector('.carousel__track');
      this.slides = Array.from(this.el.querySelectorAll('.carousel__slide'));
      this.totalSlides = this.slides.length;
      if (this.totalSlides === 0) return;

      this.currentIndex = 0;
      this.prevBtn = this.el.querySelector('.carousel__nav-btn--prev');
      this.nextBtn = this.el.querySelector('.carousel__nav-btn--next');
      this.counterEl = this.el.querySelector('.carousel__counter');
      this.dotsContainer = this.el.querySelector('.carousel__dots');

      // Touch coordinates
      this.touchStartX = 0;
      this.touchStartY = 0;
      this.touchEndX = 0;
      this.touchEndY = 0;

      this.buildDots();
      this.bindEvents();
      this.updateSlide(0, false);
    }

    buildDots() {
      if (!this.dotsContainer) return;
      this.dotsContainer.innerHTML = '';
      this.dots = [];

      for (let i = 0; i < this.totalSlides; i++) {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.className = `carousel__dot ${i === 0 ? 'is-active' : ''}`;
        dot.setAttribute('aria-label', `Navigate to slide ${i + 1}`);
        dot.dataset.index = i;
        dot.addEventListener('click', (e) => {
          e.stopPropagation();
          sfx.playClick();
          this.goToSlide(i);
        });
        this.dotsContainer.appendChild(dot);
        this.dots.push(dot);
      }
    }

    bindEvents() {
      if (this.prevBtn) {
        this.prevBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          sfx.playClick();
          this.prevSlide();
        });
      }

      if (this.nextBtn) {
        this.nextBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          sfx.playClick();
          this.nextSlide();
        });
      }

      // Keyboard arrow navigation when carousel has focus
      this.el.setAttribute('tabindex', '0');
      this.el.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          this.prevSlide();
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          this.nextSlide();
        }
      });

      // Touch / Swipe support
      this.el.addEventListener('touchstart', (e) => {
        this.touchStartX = e.changedTouches[0].screenX;
        this.touchStartY = e.changedTouches[0].screenY;
      }, { passive: true });

      this.el.addEventListener('touchend', (e) => {
        this.touchEndX = e.changedTouches[0].screenX;
        this.touchEndY = e.changedTouches[0].screenY;
        this.handleGesture();
      }, { passive: true });
    }

    handleGesture() {
      const deltaX = this.touchEndX - this.touchStartX;
      const deltaY = this.touchEndY - this.touchStartY;

      // Ensure horizontal swipe is dominant and exceeds threshold
      if (Math.abs(deltaX) > 40 && Math.abs(deltaX) > Math.abs(deltaY)) {
        if (deltaX < 0) {
          this.nextSlide();
        } else {
          this.prevSlide();
        }
      }
    }

    nextSlide() {
      const next = (this.currentIndex + 1) % this.totalSlides;
      this.goToSlide(next);
    }

    prevSlide() {
      const prev = (this.currentIndex - 1 + this.totalSlides) % this.totalSlides;
      this.goToSlide(prev);
    }

    goToSlide(index) {
      if (index === this.currentIndex) return;
      this.updateSlide(index, true);
    }

    updateSlide(index, animate = true) {
      this.currentIndex = index;

      if (this.track) {
        this.track.style.transition = animate ? 'transform 0.45s cubic-bezier(0.16, 1, 0.3, 1)' : 'none';
        this.track.style.transform = `translateX(-${this.currentIndex * 100}%)`;
      }

      // Update dots
      if (this.dots) {
        this.dots.forEach((dot, idx) => {
          dot.classList.toggle('is-active', idx === this.currentIndex);
        });
      }

      // Update slide counter formatted as "01 / 04"
      if (this.counterEl) {
        const curStr = String(this.currentIndex + 1).padStart(2, '0');
        const totStr = String(this.totalSlides).padStart(2, '0');
        this.counterEl.textContent = `${curStr} / ${totStr}`;
      }
    }
  }

  /* ==========================================================================
     05. REUSABLE SHARED CYBER LIGHTBOX
     One lightbox for projects, certifications, and profile photo.
     Features: 1x/2x zoom, drag pan, wheel zoom, Esc key, arrow keys, trap focus.
     ========================================================================== */
  class CyberLightbox {
    constructor() {
      this.el = document.getElementById('shared-lightbox');
      if (!this.el) return;

      this.img = this.el.querySelector('.lightbox__img');
      this.caption = this.el.querySelector('.lightbox__caption');
      this.counter = this.el.querySelector('.lightbox__counter');
      this.groupInfo = this.el.querySelector('.lightbox__group-info');
      this.closeBtn = this.el.querySelector('.lightbox__btn--close');
      this.zoomBtn = this.el.querySelector('.lightbox__btn--zoom');
      this.resetBtn = this.el.querySelector('.lightbox__btn--reset');
      this.prevBtn = this.el.querySelector('.lightbox__nav--prev');
      this.nextBtn = this.el.querySelector('.lightbox__nav--next');
      this.viewport = this.el.querySelector('.lightbox__viewport');

      this.currentGroup = [];
      this.currentIndex = 0;
      this.isOpen = false;
      this.triggerElement = null;

      // Zoom & Pan state
      this.zoomScale = 1;
      this.panX = 0;
      this.panY = 0;
      this.isDragging = false;
      this.startX = 0;
      this.startY = 0;

      this.bindEvents();
    }

    bindEvents() {
      // Event delegation for opening lightbox: any element with [data-lightbox]
      document.addEventListener('click', (e) => {
        const target = e.target.closest('[data-lightbox]');
        if (target) {
          e.preventDefault();
          this.open(target);
        }
      });

      // Close button
      if (this.closeBtn) {
        this.closeBtn.addEventListener('click', () => this.close());
      }

      // Zoom toggle button
      if (this.zoomBtn) {
        this.zoomBtn.addEventListener('click', () => this.toggleZoom());
      }

      // Reset zoom button
      if (this.resetBtn) {
        this.resetBtn.addEventListener('click', () => this.resetTransform());
      }

      // Navigation arrows
      if (this.prevBtn) {
        this.prevBtn.addEventListener('click', () => this.prev());
      }
      if (this.nextBtn) {
        this.nextBtn.addEventListener('click', () => this.next());
      }

      // Click on background or image
      this.el.addEventListener('click', (e) => {
        // If clicking on backdrop outside the image & controls, close
        if (e.target === this.viewport || e.target === this.el) {
          this.close();
        }
      });

      // Double-click on image toggles zoom
      if (this.img) {
        this.img.addEventListener('dblclick', (e) => {
          e.stopPropagation();
          this.toggleZoom();
        });

        // Mouse drag pan when zoomed
        this.img.addEventListener('mousedown', (e) => {
          if (this.zoomScale <= 1) return;
          e.preventDefault();
          this.isDragging = true;
          this.startX = e.clientX - this.panX;
          this.startY = e.clientY - this.panY;
          this.el.classList.add('is-dragging');
        });

        window.addEventListener('mousemove', (e) => {
          if (!this.isDragging) return;
          this.panX = e.clientX - this.startX;
          this.panY = e.clientY - this.startY;
          this.applyTransform();
        });

        window.addEventListener('mouseup', () => {
          if (this.isDragging) {
            this.isDragging = false;
            this.el.classList.remove('is-dragging');
          }
        });

        // Wheel zoom
        this.viewport.addEventListener('wheel', (e) => {
          if (!this.isOpen) return;
          e.preventDefault();
          const delta = e.deltaY * -0.002;
          const newScale = Math.min(Math.max(1, this.zoomScale + delta), 3);
          this.setZoom(newScale);
        }, { passive: false });
      }

      // Global keyboard events
      document.addEventListener('keydown', (e) => {
        if (!this.isOpen) return;

        if (e.key === 'Escape') {
          e.preventDefault();
          this.close();
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault();
          this.prev();
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          this.next();
        } else if (e.key === '+' || e.key === '=') {
          e.preventDefault();
          this.setZoom(Math.min(3, this.zoomScale + 0.3));
        } else if (e.key === '-') {
          e.preventDefault();
          this.setZoom(Math.max(1, this.zoomScale - 0.3));
        } else if (e.key === 'Tab') {
          this.trapFocus(e);
        }
      });

      // Touch swipe inside lightbox
      let touchStartX = 0;
      let touchEndX = 0;

      this.viewport.addEventListener('touchstart', (e) => {
        if (e.touches.length === 1) {
          touchStartX = e.touches[0].screenX;
        }
      }, { passive: true });

      this.viewport.addEventListener('touchend', (e) => {
        if (this.zoomScale > 1) return; // Allow normal pan when zoomed
        touchEndX = e.changedTouches[0].screenX;
        const diff = touchEndX - touchStartX;
        if (Math.abs(diff) > 45) {
          if (diff < 0) {
            this.next();
          } else {
            this.prev();
          }
        }
      }, { passive: true });
    }

    open(triggerEl) {
      this.triggerElement = triggerEl;
      const groupName = triggerEl.getAttribute('data-lightbox');

      // Collect all matching elements in this group across document
      const groupElements = Array.from(document.querySelectorAll(`[data-lightbox="${groupName}"]`));
      this.currentGroup = groupElements.map((el) => ({
        src: el.getAttribute('data-fullsrc') || el.getAttribute('src'),
        alt: el.getAttribute('alt') || '',
        caption: el.getAttribute('data-caption') || el.getAttribute('alt') || 'Asset Preview',
        element: el
      }));

      // Find current clicked element index
      const foundIdx = groupElements.indexOf(triggerEl);
      this.currentIndex = foundIdx !== -1 ? foundIdx : 0;

      this.isOpen = true;
      this.el.classList.add('is-open');
      this.el.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden'; // Lock scroll

      sfx.playOpen();
      this.updateView();

      // Set focus inside lightbox
      if (this.closeBtn) {
        this.closeBtn.focus();
      }
    }

    close() {
      if (!this.isOpen) return;
      this.isOpen = false;
      this.el.classList.remove('is-open');
      this.el.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = ''; // Restore scroll
      this.resetTransform();

      sfx.playClick();

      // Return focus to triggering element for keyboard accessibility
      if (this.triggerElement && typeof this.triggerElement.focus === 'function') {
        this.triggerElement.focus();
      }
    }

    updateView() {
      if (this.currentGroup.length === 0) return;
      const item = this.currentGroup[this.currentIndex];

      this.resetTransform();

      // Set image with fade animation
      this.img.style.opacity = '0';
      this.img.src = item.src;
      this.img.alt = item.alt;

      this.img.onload = () => {
        this.img.style.opacity = '1';
      };

      // Set caption and counter
      if (this.caption) {
        this.caption.textContent = item.caption;
      }

      if (this.counter) {
        const cur = String(this.currentIndex + 1).padStart(2, '0');
        const tot = String(this.currentGroup.length).padStart(2, '0');
        this.counter.textContent = `[ ${cur} / ${tot} ]`;
      }

      if (this.groupInfo) {
        const groupAttr = this.triggerElement ? this.triggerElement.getAttribute('data-lightbox') : 'GALLERY';
        this.groupInfo.textContent = `NODE // ${groupAttr.toUpperCase()}`;
      }

      // Hide or disable prev/next if only 1 item in group
      const hasMulti = this.currentGroup.length > 1;
      if (this.prevBtn) {
        this.prevBtn.style.display = hasMulti ? 'flex' : 'none';
      }
      if (this.nextBtn) {
        this.nextBtn.style.display = hasMulti ? 'flex' : 'none';
      }
    }

    next() {
      if (this.currentGroup.length <= 1) return;
      this.currentIndex = (this.currentIndex + 1) % this.currentGroup.length;
      sfx.playClick();
      this.updateView();
    }

    prev() {
      if (this.currentGroup.length <= 1) return;
      this.currentIndex = (this.currentIndex - 1 + this.currentGroup.length) % this.currentGroup.length;
      sfx.playClick();
      this.updateView();
    }

    toggleZoom() {
      if (this.zoomScale === 1) {
        this.setZoom(2);
      } else {
        this.resetTransform();
      }
    }

    setZoom(scale) {
      this.zoomScale = scale;
      if (this.zoomScale === 1) {
        this.panX = 0;
        this.panY = 0;
        this.el.classList.remove('is-zoomed');
      } else {
        this.el.classList.add('is-zoomed');
      }
      this.applyTransform();
      if (this.zoomBtn) {
        this.zoomBtn.textContent = this.zoomScale > 1 ? '[ 1X ]' : '[ 2X ]';
      }
    }

    resetTransform() {
      this.zoomScale = 1;
      this.panX = 0;
      this.panY = 0;
      this.el.classList.remove('is-zoomed', 'is-dragging');
      this.applyTransform();
      if (this.zoomBtn) {
        this.zoomBtn.textContent = '[ 2X ]';
      }
    }

    applyTransform() {
      if (!this.img) return;
      this.img.style.transform = `translate3d(${this.panX}px, ${this.panY}px, 0) scale(${this.zoomScale})`;
    }

    trapFocus(e) {
      const focusableElements = this.el.querySelectorAll('button:not([disabled]), [tabindex="0"]');
      const first = focusableElements[0];
      const last = focusableElements[focusableElements.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
  }

  /* ==========================================================================
     06. SCROLL-SPY NAVIGATION & MOBILE DRAWER
     Active link highlights on scroll and smooth navigation.
     ========================================================================== */
  function initNavigation() {
    const navLinks = Array.from(document.querySelectorAll('.cyber-nav__link, .nav-drawer__link'));
    const sections = Array.from(document.querySelectorAll('section[id], header[id]'));
    const navToggle = document.getElementById('nav-toggle');
    const navDrawer = document.getElementById('nav-drawer');

    // Mobile Hamburger Toggle
    if (navToggle && navDrawer) {
      const toggleMenu = (open) => {
        const isOpen = open !== undefined ? open : !navDrawer.classList.contains('is-open');
        navToggle.classList.toggle('is-active', isOpen);
        navDrawer.classList.toggle('is-open', isOpen);
        navToggle.setAttribute('aria-expanded', String(isOpen));
        sfx.playClick();
      };

      navToggle.addEventListener('click', () => toggleMenu());

      // Close drawer when clicking a drawer link
      navDrawer.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', () => toggleMenu(false));
      });

      // Close on Escape key
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && navDrawer.classList.contains('is-open')) {
          toggleMenu(false);
        }
      });
    }

    // Scroll-Spy with IntersectionObserver
    const observerOptions = {
      root: null,
      rootMargin: '-20% 0px -70% 0px',
      threshold: 0
    };

    const spyObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          navLinks.forEach((link) => {
            const href = link.getAttribute('href');
            if (href === `#${id}`) {
              link.classList.add('active');
            } else {
              link.classList.remove('active');
            }
          });
        }
      });
    }, observerOptions);

    sections.forEach((section) => spyObserver.observe(section));
  }

  /* ==========================================================================
     07. SCROLL-REVEAL OBSERVER
     Smooth fade-in-up animations for sections and cards.
     ========================================================================== */
  function initScrollReveal() {
    if (prefersReducedMotion) {
      document.querySelectorAll('.reveal-item').forEach((el) => el.classList.add('is-revealed'));
      return;
    }

    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          observer.unobserve(entry.target);
        }
      });
    }, {
      root: null,
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px'
    });

    document.querySelectorAll('.reveal-item').forEach((el) => {
      revealObserver.observe(el);
    });
  }

  /* ==========================================================================
     08. TERMINAL CONTACT FORM & COPY BUTTONS
     Simulated cyber transmission progress with mailto link.
     ========================================================================== */
  function initContactAndCopy() {
    const contactForm = document.getElementById('contact-form');
    const formStatus = document.getElementById('form-status');

    if (contactForm && formStatus) {
      contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        sfx.playOpen();

        const nameInput = document.getElementById('form-name');
        const emailInput = document.getElementById('form-email');
        const msgInput = document.getElementById('form-message');

        const name = nameInput ? nameInput.value.trim() : 'Anonymous';
        const email = emailInput ? emailInput.value.trim() : '';
        const msg = msgInput ? msgInput.value.trim() : '';

        formStatus.textContent = '> [ENCRYPTING TRANSMISSION PAYLOAD... 0%]';

        let progress = 0;
        const interval = setInterval(() => {
          progress += 25;
          if (progress <= 100) {
            formStatus.textContent = `> [ENCRYPTING TRANSMISSION PAYLOAD... ${progress}%]`;
            sfx.playClick();
          } else {
            clearInterval(interval);
            formStatus.textContent = '> [TRANSMISSION BUFFER READY // DISPATCHING TO CLIENT]';

            // Construct mailto URL
            const subject = encodeURIComponent(`[CYBER-TRANSMISSION] From ${name}`);
            const body = encodeURIComponent(`Sender: ${name}\nReply-To: ${email}\n\nPayload:\n${msg}`);
            window.location.href = `mailto:[MY EMAIL]?subject=${subject}&body=${body}`;

            setTimeout(() => {
              contactForm.reset();
              formStatus.textContent = '> [STATUS: DISPATCH COMPLETE // AWAITING ACK]';
            }, 1000);
          }
        }, 120);
      });
    }

    // Copy-to-clipboard functionality
    document.querySelectorAll('[data-copy]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const textToCopy = btn.getAttribute('data-copy');
        if (!textToCopy) return;

        navigator.clipboard.writeText(textToCopy).then(() => {
          sfx.playClick();
          const origText = btn.textContent;
          btn.textContent = 'COPIED';
          btn.classList.add('is-copied');
          setTimeout(() => {
            btn.textContent = origText;
            btn.classList.remove('is-copied');
          }, 2000);
        }).catch(() => {
          // Fallback if clipboard API restricted
          const temp = document.createElement('textarea');
          temp.value = textToCopy;
          document.body.appendChild(temp);
          temp.select();
          document.execCommand('copy');
          document.body.removeChild(temp);
          btn.textContent = 'COPIED';
          setTimeout(() => { btn.textContent = 'COPY'; }, 2000);
        });
      });
    });
  }

  /* ==========================================================================
     09. DYNAMIC CYBER IMAGE FALLBACK SHIELD
     Ensures that even if any placeholder path is missing or modified,
     a high-tech cyberpunk SVG is dynamically rendered with zero broken icons!
     ========================================================================== */
  function initImageFallbacks() {
    function generateFallbackSvg(text, subtext = 'TELEMETRY SECURE') {
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" width="100%" height="100%">
        <rect width="800" height="450" fill="#050508"/>
        <path d="M 0 0 L 800 450 M 800 0 L 0 450" stroke="#00f0ff" stroke-width="0.5" stroke-opacity="0.1"/>
        <circle cx="400" cy="225" r="90" fill="none" stroke="#00f0ff" stroke-width="1.5" stroke-dasharray="6 6" opacity="0.6"/>
        <circle cx="400" cy="225" r="45" fill="#00f0ff" fill-opacity="0.08" stroke="#00f0ff" stroke-width="2"/>
        <text x="400" y="232" fill="#00f0ff" font-family="'Orbitron', monospace" font-size="20" font-weight="bold" text-anchor="middle">${text}</text>
        <text x="400" y="320" fill="#88a8b8" font-family="'Share Tech Mono', monospace" font-size="14" text-anchor="middle">${subtext}</text>
      </svg>`;
      return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
    }

    document.querySelectorAll('img').forEach((img) => {
      img.addEventListener('error', function () {
        if (!this.dataset.hasFallback) {
          this.dataset.hasFallback = 'true';
          const altText = this.getAttribute('alt') || 'CYBER_NODE';
          this.src = generateFallbackSvg(altText.slice(0, 24).toUpperCase(), 'ASSET BUFFERED // 0x00FF');
        }
      });
    });
  }

  /* ==========================================================================
     INITIALIZATION ORCHESTRATOR
     Runs after DOMContentLoaded.
     ========================================================================== */
  function initializeApp() {
    // 1. Matrix Background
    new MatrixRain('matrix-canvas');

    // 2. Terminal Typewriter
    new Typewriter('typing-role', [
      'Network Engineer',
      'Full-Stack Web Developer',
      'Purple Teaming',
    ], 75, 45, 2000);

    // 3. Independent Carousels
    document.querySelectorAll('.carousel').forEach((carouselEl) => {
      new ProjectCarousel(carouselEl);
    });

    // 4. Shared Lightbox
    window.cyberLightbox = new CyberLightbox();

    // 5. Navigation & Scroll-Spy
    initNavigation();

    // 6. Scroll Reveal Observer
    initScrollReveal();

    // 7. Contact & Copy Engine
    initContactAndCopy();

    // 8. Image Fallbacks
    initImageFallbacks();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
  } else {
    initializeApp();
  }
})();
