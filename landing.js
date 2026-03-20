(function () {
  'use strict';

  var THEME_KEY = 'zxy-theme';
  var LANG_KEY  = 'zxy-lang';

  var SUN_ICON  = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>';
  var MOON_ICON = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';

  /* ── Bilingual aria labels ── */
  var LABELS = {
    es: {
      themeToLight: 'Cambiar a modo claro',
      themeToDark:  'Cambiar a modo oscuro',
      langToggle:   'Cambiar idioma',
      menuOpen:     'Abrir menú',
      menuClose:    'Cerrar menú'
    },
    en: {
      themeToLight: 'Switch to light mode',
      themeToDark:  'Switch to dark mode',
      langToggle:   'Switch language',
      menuOpen:     'Open menu',
      menuClose:    'Close menu'
    }
  };

  function getLabels() {
    var lang = document.documentElement.lang || 'es';
    return LABELS[lang] || LABELS.es;
  }

  /* ── Theme ── */
  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);
    var labels = getLabels();
    document.querySelectorAll('.theme-toggle').forEach(function (btn) {
      btn.innerHTML = theme === 'dark' ? SUN_ICON : MOON_ICON;
      btn.setAttribute('aria-label', theme === 'dark' ? labels.themeToLight : labels.themeToDark);
    });
  }

  /* ── Language ── */
  function applyLang(lang) {
    document.documentElement.lang = lang;
    localStorage.setItem(LANG_KEY, lang);

    document.querySelectorAll('[data-en][data-es]').forEach(function (el) {
      var val = el.getAttribute('data-' + lang);
      if (val) el.innerHTML = val;
    });

    document.querySelectorAll('.lang-toggle').forEach(function (b) {
      b.textContent = lang === 'en' ? 'ES' : 'EN';
      b.setAttribute('aria-label', LABELS[lang] ? LABELS[lang].langToggle : LABELS.es.langToggle);
    });

    /* Re-sync other aria-labels to the new language */
    var labels = LABELS[lang] || LABELS.es;
    var theme = document.documentElement.getAttribute('data-theme') || 'dark';
    document.querySelectorAll('.theme-toggle').forEach(function (btn) {
      btn.setAttribute('aria-label', theme === 'dark' ? labels.themeToLight : labels.themeToDark);
    });
    var hamburger = document.getElementById('hamburger');
    if (hamburger) {
      var isOpen = hamburger.getAttribute('aria-expanded') === 'true';
      hamburger.setAttribute('aria-label', isOpen ? labels.menuClose : labels.menuOpen);
    }
  }

  document.addEventListener('DOMContentLoaded', function () {

    /* ── Theme ── */
    var savedTheme  = localStorage.getItem(THEME_KEY);
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    applyTheme(savedTheme || (prefersDark ? 'dark' : 'light'));

    document.querySelectorAll('.theme-toggle').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var current = document.documentElement.getAttribute('data-theme');
        applyTheme(current === 'dark' ? 'light' : 'dark');
      });
    });

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
      if (!localStorage.getItem(THEME_KEY)) applyTheme(e.matches ? 'dark' : 'light');
    });

    /* ── Language ── */
    var savedLang = localStorage.getItem(LANG_KEY);
    var sysLang   = (navigator.language || 'es').toLowerCase().startsWith('es') ? 'es' : 'en';
    applyLang(savedLang || sysLang);

    document.querySelectorAll('.lang-toggle').forEach(function (btn) {
      btn.addEventListener('click', function () {
        applyLang(document.documentElement.lang === 'en' ? 'es' : 'en');
      });
    });

    /* ── Fade-in on scroll ── */
    var fadeEls = document.querySelectorAll('.fade-in');

    function forceVisible() {
      document.querySelectorAll('.fade-in:not(.visible)').forEach(function (el) {
        el.classList.add('visible');
      });
    }

    if ('IntersectionObserver' in window) {
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry, i) {
          if (entry.isIntersecting) {
            setTimeout(function () { entry.target.classList.add('visible'); }, i * 50);
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.05 });
      fadeEls.forEach(function (el) { observer.observe(el); });
    } else {
      forceVisible();
    }

    /* Safety net: force all remaining invisible elements visible after 2.5s */
    setTimeout(forceVisible, 2500);

    /* ── Mobile menu ── */
    var hamburger  = document.getElementById('hamburger');
    var mobileMenu = document.getElementById('mobileMenu');

    function closeMobileMenu() {
      mobileMenu.classList.remove('open');
      mobileMenu.setAttribute('aria-hidden', 'true');
      mobileMenu.querySelectorAll('a, button').forEach(function (el) {
        el.setAttribute('tabindex', '-1');
      });
      hamburger.setAttribute('aria-expanded', 'false');
      hamburger.setAttribute('aria-label', getLabels().menuOpen);
    }

    if (hamburger && mobileMenu) {
      /* Set initial tabindex=-1 on all interactive elements inside mobile menu */
      mobileMenu.querySelectorAll('a, button').forEach(function (el) {
        el.setAttribute('tabindex', '-1');
      });

      hamburger.addEventListener('click', function () {
        var isOpen = mobileMenu.classList.toggle('open');
        hamburger.setAttribute('aria-expanded', String(isOpen));
        hamburger.setAttribute('aria-label', isOpen ? getLabels().menuClose : getLabels().menuOpen);
        if (isOpen) {
          mobileMenu.removeAttribute('aria-hidden');
          mobileMenu.querySelectorAll('a, button').forEach(function (el) {
            el.removeAttribute('tabindex');
          });
        } else {
          mobileMenu.setAttribute('aria-hidden', 'true');
          mobileMenu.querySelectorAll('a, button').forEach(function (el) {
            el.setAttribute('tabindex', '-1');
          });
        }
      });

      document.querySelectorAll('.mobile-link, .mobile-menu .nav-cta').forEach(function (link) {
        link.addEventListener('click', closeMobileMenu);
      });
    }
  });
})();
