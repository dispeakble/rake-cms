/**
 * WordPress Theme JavaScript
 * Handles: Carousel, Mobile Menu, Language Dropdown, Theme Toggle,
 *          Animated Counters, Scroll Entrance Animations, Particles
 * Pure vanilla JS — no dependencies.
 */
(function () {
  'use strict';

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    initCarousel();
    initMobileMenu();
    initLangDropdown();
    initThemeToggle();
    initCounters();
    initScrollReveal();
    initParticles();
  }

  function initCarousel() {
    var container = document.querySelector('.hero-carousel');
    if (!container) return;
    var slides = container.querySelectorAll('.slide');
    if (slides.length === 0) return;
    var current = 0;
    var total = slides.length;
    var interval = null;
    var AUTO_DELAY = 5000;

    var indicatorsContainer = document.createElement('div');
    indicatorsContainer.className = 'carousel-indicators';
    container.appendChild(indicatorsContainer);
    var indicators = [];
    for (var i = 0; i < total; i++) {
      (function(idx) {
        var dot = document.createElement('button');
        dot.className = 'carousel-indicator' + (idx === 0 ? ' active' : '');
        dot.setAttribute('aria-label', 'Go to slide ' + (idx + 1));
        dot.addEventListener('click', function () {
          goToSlide(idx);
          resetAutoRotation();
        });
        indicatorsContainer.appendChild(dot);
        indicators.push(dot);
      })(i);
    }

    var prevBtn = container.querySelector('.carousel-prev');
    var nextBtn = container.querySelector('.carousel-next');

    if (prevBtn) {
      prevBtn.addEventListener('click', function () {
        goToSlide(current - 1 < 0 ? total - 1 : current - 1);
        resetAutoRotation();
      });
    }
    if (nextBtn) {
      nextBtn.addEventListener('click', function () {
        goToSlide(current + 1 >= total ? 0 : current + 1);
        resetAutoRotation();
      });
    }

    slides[0].classList.add('active');

    function goToSlide(index) {
      if (index === current) return;
      slides[current].classList.remove('active');
      slides[index].classList.add('active');
      if (indicators[current]) indicators[current].classList.remove('active');
      if (indicators[index]) indicators[index].classList.add('active');
      current = index;
    }

    function startAutoRotation() {
      stopAutoRotation();
      interval = setInterval(function () {
        goToSlide(current + 1 >= total ? 0 : current + 1);
      }, AUTO_DELAY);
    }
    function stopAutoRotation() { if (interval) { clearInterval(interval); interval = null; } }
    function resetAutoRotation() { stopAutoRotation(); startAutoRotation(); }

    container.addEventListener('mouseenter', stopAutoRotation);
    container.addEventListener('mouseleave', startAutoRotation);
    startAutoRotation();
  }

  function initMobileMenu() {
    var toggle = document.getElementById('mobile-menu-toggle');
    var menu = document.getElementById('mobile-menu');
    if (!toggle || !menu) return;
    toggle.addEventListener('click', function () {
      menu.classList.toggle('hidden');
      toggle.classList.toggle('is-active');
      document.body.style.overflow = menu.classList.contains('hidden') ? '' : 'hidden';
    });
    var links = menu.querySelectorAll('a');
    for (var i = 0; i < links.length; i++) {
      links[i].addEventListener('click', function () {
        menu.classList.add('hidden');
        toggle.classList.remove('is-active');
        document.body.style.overflow = '';
      });
    }
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !menu.classList.contains('hidden')) {
        toggle.click();
      }
    });
  }

  function initLangDropdown() {
    var toggle = document.getElementById('lang-toggle');
    if (!toggle) return;
    var dropdown = document.getElementById('lang-dropdown');
    if (!dropdown) return;
    toggle.addEventListener('click', function (e) {
      e.stopPropagation();
      dropdown.classList.toggle('hidden');
    });
    document.addEventListener('click', function (e) {
      if (!toggle.contains(e.target) && !dropdown.contains(e.target)) {
        dropdown.classList.add('hidden');
      }
    });
    var links = dropdown.querySelectorAll('a[data-lang]');
    for (var i = 0; i < links.length; i++) {
      links[i].addEventListener('click', function (e) {
        e.preventDefault();
        var lang = this.getAttribute('data-lang');
        if (lang) {
          window.location.href = window.location.pathname + '?lang=' + lang;
        }
      });
    }
  }

  function initThemeToggle() {
    var toggle = document.getElementById('theme-toggle');
    if (!toggle) return;
    var html = document.documentElement;
    var saved = localStorage.getItem('theme');
    if (saved === 'light') { html.classList.remove('dark'); }
    else if (saved === 'dark') { html.classList.add('dark'); }
    else {
      var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) html.classList.add('dark');
    }
    toggle.addEventListener('click', function () {
      var isDark = html.classList.toggle('dark');
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
    });
  }

  function initCounters() {
    var counters = document.querySelectorAll('.animated-counter');
    if (counters.length === 0) return;
    if (!('IntersectionObserver' in window)) {
      for (var f = 0; f < counters.length; f++) {
        var t = parseInt(counters[f].getAttribute('data-target'), 10);
        if (!isNaN(t)) counters[f].textContent = t;
      }
      return;
    }
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var el = entry.target;
          var targetVal = parseInt(el.getAttribute('data-target'), 10);
          if (isNaN(targetVal) || targetVal <= 0) return;
          if (el.dataset.counted === 'true') return;
          el.dataset.counted = 'true';
          var current = 0;
          var step = Math.ceil(targetVal / 40);
          var timer = setInterval(function () {
            current += step;
            if (current >= targetVal) { current = targetVal; clearInterval(timer); }
            el.textContent = current;
          }, 30);
          observer.unobserve(el);
        }
      });
    }, { threshold: 0.5 });
    for (var i = 0; i < counters.length; i++) { observer.observe(counters[i]); }
  }

  function initScrollReveal() {
    var reveals = document.querySelectorAll('.reveal');
    if (reveals.length === 0) return;
    if (!('IntersectionObserver' in window)) {
      for (var f = 0; f < reveals.length; f++) { reveals[f].classList.add('revealed'); }
      return;
    }
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    for (var i = 0; i < reveals.length; i++) { observer.observe(reveals[i]); }
  }

  function initParticles() {
    var particles = document.querySelectorAll('.floating-particle');
    for (var i = 0; i < particles.length; i++) {
      var p = particles[i];
      p.style.setProperty('--particle-delay', (Math.random() * 4).toFixed(2) + 's');
      p.style.setProperty('--particle-duration', (4 + Math.random() * 4).toFixed(2) + 's');
      p.style.setProperty('--particle-x', (20 + Math.random() * 40).toFixed(0) + 'px');
      p.style.setProperty('--particle-y', (20 + Math.random() * 40).toFixed(0) + 'px');
    }
  }

})();