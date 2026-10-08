(() => {
  'use strict';

  const header = document.querySelector('.site-header');
  const navToggle = document.querySelector('.nav-toggle');
  const navigation = document.getElementById('primary-navigation');
  const navLinks = [...document.querySelectorAll('[data-nav-link]')];
  const desktopQuery = window.matchMedia('(min-width: 992px)');
  const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

  const setMenuOpen = (isOpen) => {
    if (!navToggle || !navigation) return;
    navToggle.setAttribute('aria-expanded', String(isOpen));
    navToggle.setAttribute('aria-label', isOpen ? 'Cerrar menú' : 'Abrir menú');
    navigation.classList.toggle('is-open', isOpen);
  };

  navToggle?.addEventListener('click', () => {
    setMenuOpen(navToggle.getAttribute('aria-expanded') !== 'true');
  });

  navigation?.addEventListener('click', (event) => {
    if (event.target.closest('a')) setMenuOpen(false);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && navToggle?.getAttribute('aria-expanded') === 'true') {
      setMenuOpen(false);
      navToggle.focus();
    }
  });

  desktopQuery.addEventListener('change', (event) => {
    if (event.matches) setMenuOpen(false);
  });

  let headerUpdatePending = false;
  const updateHeader = () => {
    header?.classList.toggle('is-scrolled', window.scrollY > 12);
    headerUpdatePending = false;
  };
  updateHeader();
  window.addEventListener('scroll', () => {
    if (headerUpdatePending) return;
    headerUpdatePending = true;
    window.requestAnimationFrame(updateHeader);
  }, { passive: true });

  const markActiveSection = (id) => {
    navLinks.forEach((link) => {
      const isActive = link.getAttribute('href') === `#${id}`;
      link.classList.toggle('is-active', isActive);
      if (isActive) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  };

  const sections = ['inicio', 'servicios', 'enfoque', 'instagram', 'contacto']
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  markActiveSection(sections.find((section) => `#${section.id}` === window.location.hash)?.id || 'inicio');

  if ('IntersectionObserver' in window) {
    const visibleSections = new Set();
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) visibleSections.add(entry.target);
        else visibleSections.delete(entry.target);
      });

      const activeSection = [...visibleSections].sort((first, second) => (
        Math.abs(first.getBoundingClientRect().top - window.innerHeight * 0.3)
        - Math.abs(second.getBoundingClientRect().top - window.innerHeight * 0.3)
      ))[0];
      if (activeSection) markActiveSection(activeSection.id);
    }, { rootMargin: '-15% 0px -45% 0px', threshold: 0 });
    sections.forEach((section) => sectionObserver.observe(section));

    if (!reducedMotionQuery.matches) {
      const revealElements = [...document.querySelectorAll('[data-reveal]')];
      const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        });
      }, { threshold: 0.08, rootMargin: '0px 0px -24px 0px' });

      revealElements.forEach((element) => {
        element.classList.add('reveal-ready');
        revealObserver.observe(element);
      });

      reducedMotionQuery.addEventListener('change', (event) => {
        if (!event.matches) return;
        revealElements.forEach((element) => element.classList.add('is-visible'));
        revealObserver.disconnect();
      });
    }
  }

  document.querySelectorAll('[data-current-year]').forEach((element) => {
    element.textContent = String(new Date().getFullYear());
  });

  // Carga el perfil integrado cuando el visitante decide desplegarlo.
  const instagramDetails = document.getElementById('instagram-live');
  let instagramRequested = false;
  instagramDetails?.addEventListener('toggle', () => {
    if (!instagramDetails.open || instagramRequested) return;
    instagramRequested = true;
    const embedScript = document.createElement('script');
    embedScript.src = 'https://www.instagram.com/embed.js';
    embedScript.async = true;
    embedScript.addEventListener('load', () => window.instgrm?.Embeds?.process());
    embedScript.addEventListener('error', () => {
      instagramRequested = false;
      embedScript.remove();
    });
    document.body.append(embedScript);
  });

  const form = document.getElementById('contact-form');
  if (!form) return;

  const nameField = form.elements.namedItem('name');
  const serviceField = form.elements.namedItem('service');
  const messageField = form.elements.namedItem('message');
  const formStatus = document.getElementById('form-status');
  const fallbackLink = document.getElementById('whatsapp-fallback');
  const services = new Set(['Contabilidad integral', 'Impuestos y planificación fiscal', 'Sueldos y cargas sociales', 'Otra consulta']);

  [nameField, serviceField, messageField].forEach((field) => {
    field?.addEventListener('input', () => field.setCustomValidity(''));
    field?.addEventListener('change', () => field.setCustomValidity(''));
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!nameField || !serviceField || !messageField) return;

    const name = nameField.value.trim();
    const service = serviceField.value;
    const message = messageField.value.trim();

    nameField.setCustomValidity(name.length < 2 || name.length > 80
      ? 'Escribí tu nombre, entre 2 y 80 caracteres.' : '');
    serviceField.setCustomValidity(services.has(service)
      ? '' : 'Elegí el tema de tu consulta.');
    messageField.setCustomValidity(message.length < 10 || message.length > 1200
      ? 'Contanos tu consulta, entre 10 y 1200 caracteres.' : '');

    if (!form.reportValidity()) return;

    const text = `Hola Federico, soy ${name}.\nQuisiera consultar por: ${service}.\n\n${message}`;
    const whatsappURL = `https://wa.me/5492645299575?text=${encodeURIComponent(text)}`;

    if (fallbackLink) {
      fallbackLink.href = whatsappURL;
      fallbackLink.hidden = false;
    }

    // Abrir la conversación no envía el mensaje: la persona confirma en WhatsApp.
    window.open(whatsappURL, '_blank', 'noopener,noreferrer');

    if (formStatus) {
      formStatus.textContent = 'Tu consulta está preparada. Revisá y enviá el mensaje en WhatsApp. Si no se abrió, usá el enlace de abajo.';
    }
  });
})();
