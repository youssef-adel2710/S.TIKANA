/* ==========================================================
   S.TIKANA — Site Script
   Enhanced for smooth mobile & desktop experience
   ========================================================== */
(function(){
  "use strict";

  /* ---------- Prevent double-tap zoom on mobile ---------- */
  let lastTouchEnd = 0;
  document.addEventListener('touchend', (e) => {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) {
      e.preventDefault();
    }
    lastTouchEnd = now;
  }, false);

  /* ---------- Navbar scroll state with throttling ---------- */
  const navbar = document.getElementById('navbar');
  let scrollTimeout;
  const onScroll = () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  };
  window.addEventListener('scroll', () => {
    if (scrollTimeout) cancelAnimationFrame(scrollTimeout);
    scrollTimeout = requestAnimationFrame(onScroll);
  }, { passive:true });
  onScroll();

  /* ---------- Mobile nav toggle with smooth close ---------- */
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');
  
  navToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    navToggle.classList.toggle('open', isOpen);
    navToggle.setAttribute('aria-expanded', String(isOpen));
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  navLinks.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      navAnchors.forEach(anchor => {
        const isActive = anchor === a;
        anchor.classList.toggle('active', isActive);
        if (isActive) anchor.setAttribute('aria-current', 'page');
        else anchor.removeAttribute('aria-current');
      });
      navLinks.classList.remove('open');
      navToggle.classList.remove('open');
      navToggle.setAttribute('aria-expanded','false');
      document.body.style.overflow = '';
    });
  });

  /* Close mobile menu when clicking outside */
  document.addEventListener('click', (e) => {
    if (!navToggle.contains(e.target) && !navLinks.contains(e.target) && navLinks.classList.contains('open')) {
      navLinks.classList.remove('open');
      navToggle.classList.remove('open');
      navToggle.setAttribute('aria-expanded','false');
      document.body.style.overflow = '';
    }
  });

  /* ---------- Active nav link on scroll ---------- */
  const sections = ['home','menu','about','gallery','location','contact']
    .map(id => document.getElementById(id)).filter(Boolean)
    .sort((a, b) => a.offsetTop - b.offsetTop);
  const navAnchors = Array.from(navLinks.querySelectorAll('a'));
  const setActiveLink = () => {
    let current = sections[0];
    const scrollPos = window.scrollY + navbar.offsetHeight + 20;
    sections.forEach(sec => {
      if (sec.offsetTop <= scrollPos) current = sec;
    });
    navAnchors.forEach(a => {
      const isActive = a.getAttribute('href') === '#' + current.id;
      a.classList.toggle('active', isActive);
      if (isActive) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
  };
  window.addEventListener('scroll', setActiveLink, { passive:true });
  setActiveLink();

  /* ---------- Hero parallax on scroll with optimization ---------- */
  const heroBg = document.getElementById('heroBg');
  let rafId;
  window.addEventListener('scroll', () => {
    if (rafId) cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(() => {
      const y = window.scrollY;
      if (y < window.innerHeight) {
        heroBg.style.transform = `translateY(${y * 0.25}px) scale(1.08)`;
      }
    });
  }, { passive:true });

  /* ---------- Build menu tabs + panels from MENU_DATA ---------- */
  const tabsEl = document.getElementById('menuTabs');
  const panelsEl = document.getElementById('menuPanels');

  MENU_DATA.forEach((cat, i) => {
    // Tab
    const tab = document.createElement('button');
    tab.className = 'menu-tab' + (i === 0 ? ' active' : '');
    tab.setAttribute('role','tab');
    tab.setAttribute('aria-selected', i === 0 ? 'true':'false');
    tab.innerHTML = `<span class="tab-icon">${cat.icon}</span><span>${cat.en}</span>`;
    tabsEl.appendChild(tab);

    // Panel
    const panel = document.createElement('div');
    panel.className = 'menu-panel' + (i === 0 ? ' active' : '');
    panel.id = 'panel-' + cat.id;
    panel.setAttribute('role','tabpanel');

    const itemsHTML = cat.items.map(item => `
      <div class="menu-item">
        <span class="item-en">${item.en}</span>
        <span class="item-price">${item.price}</span>
        <span class="item-ar">${item.ar}</span>
        ${item.desc_en || item.desc_ar ? `
          <div class="item-description">
            <span class="description-en">${item.desc_en || ''}</span>
            <span class="description-ar">${item.desc_ar || ''}</span>
          </div>
        ` : ''}
      </div>
    `).join('');

    panel.innerHTML = `
      <div class="panel-header">
        <h3>${cat.en}</h3>
        <div class="ar-title">${cat.ar}</div>
      </div>
      <div class="menu-card">${itemsHTML}</div>
    `;
    panelsEl.appendChild(panel);

    tab.addEventListener('click', () => {
      tabsEl.querySelectorAll('.menu-tab').forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected','false');
      });
      panelsEl.querySelectorAll('.menu-panel').forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      tab.setAttribute('aria-selected','true');
      panel.classList.add('active');
      observeMenuItems(panel);
    });
  });

  /* ---------- Build responsive gallery carousel from local image paths ---------- */
  const galleryCarousel = document.getElementById('galleryCarousel');
  const galleryTrack = document.getElementById('galleryTrack');
  let galleryIndex = 0;
  let galleryTimer;

  galleryImages.forEach((src, index) => {
    const fig = document.createElement('figure');
    fig.className = 'gallery-slide';
    fig.innerHTML = `<img src="${src}" alt="S.TIKANA Cafe photo ${index + 1}" loading="lazy">`;
    fig.addEventListener('click', () => openLightbox(src, `S.TIKANA Cafe photo ${index + 1}`));
    galleryTrack.appendChild(fig);
  });

  function getGalleryMaxIndex(){
    const slideWidth = galleryTrack.firstElementChild?.getBoundingClientRect().width || 0;
    const trackWidth = galleryTrack.parentElement?.getBoundingClientRect().width || 0;
    const visibleSlides = slideWidth ? Math.max(1, Math.floor((trackWidth + 16) / (slideWidth + 16))) : 1;
    return Math.max(0, galleryImages.length - visibleSlides);
  }

  function updateGallery(){
    const slideWidth = galleryTrack.firstElementChild?.getBoundingClientRect().width || 0;
    galleryIndex = Math.min(galleryIndex, getGalleryMaxIndex());
    galleryTrack.style.transform = `translate3d(${-galleryIndex * (slideWidth + 16)}px, 0, 0)`;
  }

  function moveGallery(direction){
    if (!galleryImages.length) return;
    const maxIndex = getGalleryMaxIndex();
    galleryIndex = (galleryIndex + direction + maxIndex + 1) % (maxIndex + 1);
    updateGallery();
  }

  /* Pointer dragging adds touch and mouse navigation without changing the timer. */
  let galleryPointerStartX = 0;
  let galleryPointerStartTransform = 0;
  let galleryDragging = false;
  let galleryDragged = false;
  let gallerySuppressClick = false;

  galleryCarousel.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    galleryPointerStartX = e.clientX;
    galleryPointerStartTransform = -galleryIndex * ((galleryTrack.firstElementChild?.getBoundingClientRect().width || 0) + 16);
    galleryDragging = true;
    galleryDragged = false;
    galleryTrack.style.setProperty('transition', 'none', 'important');
    galleryCarousel.setPointerCapture(e.pointerId);
  });

  galleryCarousel.addEventListener('pointermove', (e) => {
    if (!galleryDragging) return;
    const deltaX = e.clientX - galleryPointerStartX;
    if (Math.abs(deltaX) > 8) galleryDragged = true;
    if (galleryDragged) {
      galleryTrack.style.transform = `translate3d(${galleryPointerStartTransform + deltaX}px, 0, 0)`;
    }
  });

  function finishGalleryPointer(e){
    if (!galleryDragging) return;
    const deltaX = e.clientX - galleryPointerStartX;
    galleryDragging = false;
    galleryTrack.style.removeProperty('transition');
    gallerySuppressClick = galleryDragged;
    if (galleryDragged && Math.abs(deltaX) > 50) moveGallery(deltaX < 0 ? 1 : -1);
    else updateGallery();
    galleryCarousel.releasePointerCapture?.(e.pointerId);
  }

  galleryCarousel.addEventListener('pointerup', finishGalleryPointer);
  galleryCarousel.addEventListener('pointercancel', finishGalleryPointer);
  galleryCarousel.addEventListener('click', (e) => {
    if (gallerySuppressClick) {
      e.preventDefault();
      e.stopPropagation();
      gallerySuppressClick = false;
    }
  }, true);

  function restartGalleryTimer(){
    clearInterval(galleryTimer);
    if (galleryImages.length > 1) galleryTimer = setInterval(() => moveGallery(1), 2500);
  }

  window.addEventListener('resize', updateGallery);
  updateGallery();
  restartGalleryTimer();

  /* ---------- Lightbox with improved mobile support ---------- */
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxClose = document.getElementById('lightboxClose');

  function openLightbox(src, alt){
    lightboxImg.src = src;
    lightboxImg.alt = alt;
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden','false');
    document.body.style.overflow = 'hidden';
  }
  
  function closeLightbox(){
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden','true');
    document.body.style.overflow = '';
  }
  
  lightboxClose.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e) => { 
    if (e.target === lightbox) closeLightbox(); 
  });
  
  /* Close lightbox with Escape key or swipe */
  document.addEventListener('keydown', (e) => { 
    if (e.key === 'Escape' && lightbox.classList.contains('open')) closeLightbox(); 
  });
  
  /* Swipe to close lightbox */
  let touchStartX = 0;
  lightbox.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
  }, { passive:true });
  
  lightbox.addEventListener('touchend', (e) => {
    const touchEndX = e.changedTouches[0].clientX;
    if (Math.abs(touchStartX - touchEndX) > 50) {
      closeLightbox();
    }
  }, { passive:true });

  /* ---------- Scroll reveal with optimized IntersectionObserver ---------- */
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { 
    threshold:0.15,
    rootMargin: '50px'
  });

  document.querySelectorAll('.reveal, .reveal-up').forEach(el => {
    revealObserver.observe(el);
  });

  function observeMenuItems(panel){
    panel.querySelectorAll('.menu-item').forEach((el, idx) => {
      el.style.transitionDelay = Math.min(idx * 40, 400) + 'ms';
      revealObserver.observe(el);
    });
  }
  
  // Observe first (active) panel's items on load
  const firstPanel = panelsEl.querySelector('.menu-panel.active');
  if (firstPanel) observeMenuItems(firstPanel);

  /* ---------- Accessibility: Focus management ---------- */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      document.body.classList.add('keyboard-nav');
    }
  });

  document.addEventListener('mousedown', () => {
    document.body.classList.remove('keyboard-nav');
  });

})();
