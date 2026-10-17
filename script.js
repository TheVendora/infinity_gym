document.addEventListener('DOMContentLoaded', () => {
  const menuButton = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.nav');

  if (menuButton && nav) {
    menuButton.addEventListener('click', () => {
      const expanded = menuButton.getAttribute('aria-expanded') === 'true';
      menuButton.setAttribute('aria-expanded', String(!expanded));
      nav.classList.toggle('mobile-open', !expanded);
    });

    nav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        menuButton.setAttribute('aria-expanded', 'false');
        nav.classList.remove('mobile-open');
      });
    });
  }

  const revealItems = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    revealItems.forEach((item) => observer.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add('visible'));
  }

  const gallery = document.querySelector('.gallery-carousel');
  if (gallery) {
    const gallerySection = gallery.closest('.gallery-section');
    const viewport = gallery.querySelector('.gallery-viewport');
    const track = gallery.querySelector('.gallery-track');
    const originalSlides = [...track.querySelectorAll('.gallery-card')];
    const previousButton = gallerySection.querySelector('[data-gallery-previous]');
    const nextButton = gallerySection.querySelector('[data-gallery-next]');
    const pauseButton = gallerySection.querySelector('[data-gallery-pause]');
    const pauseIcon = pauseButton.querySelector('img');
    const counter = gallerySection.querySelector('[data-gallery-counter]');
    const cloneCount = 2;
    const slideCount = originalSlides.length;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let position = cloneCount;
    let autoplayId;
    let pausedByUser = false;

    const cloneSlide = (slide) => {
      const clone = slide.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      clone.querySelector('img').alt = '';
      return clone;
    };

    track.prepend(...originalSlides.slice(-cloneCount).map(cloneSlide));
    track.append(...originalSlides.slice(0, cloneCount).map(cloneSlide));

    const slides = [...track.querySelectorAll('.gallery-card')];

    const updateGallery = (animate = true) => {
      const activeSlide = slides[position];
      if (!activeSlide) {
        return;
      }

      track.style.transition = animate ? '' : 'none';
      const offset = viewport.clientWidth / 2 - activeSlide.offsetLeft - activeSlide.offsetWidth / 2;
      track.style.transform = `translate3d(${offset}px, 0, 0)`;

      slides.forEach((slide, index) => {
        const distance = Math.abs(index - position);
        slide.classList.toggle('is-active', distance === 0);
        slide.classList.toggle('is-near', distance === 1);
        slide.setAttribute('aria-hidden', 'true');
      });

      const activeIndex = ((position - cloneCount) % slideCount + slideCount) % slideCount;
      originalSlides.forEach((slide, index) => {
        slide.setAttribute('aria-hidden', String(index !== activeIndex));
      });
      counter.textContent = `${String(activeIndex + 1).padStart(2, '0')} / ${slideCount}`;

      if (!animate) {
        requestAnimationFrame(() => {
          track.style.transition = '';
        });
      }
    };

    const moveNext = () => {
      position += 1;
      updateGallery();
    };

    const movePrevious = () => {
      position -= 1;
      updateGallery();
    };

    track.addEventListener('transitionend', (event) => {
      if (event.target !== track || event.propertyName !== 'transform') {
        return;
      }
      if (position >= slideCount + cloneCount) {
        position = cloneCount;
        updateGallery(false);
      } else if (position < cloneCount) {
        position = slideCount + cloneCount - 1;
        updateGallery(false);
      }
    });

    const stopAutoplay = () => window.clearInterval(autoplayId);
    const startAutoplay = () => {
      stopAutoplay();
      if (pausedByUser || reducedMotion || document.hidden || gallerySection.matches(':hover') || gallerySection.contains(document.activeElement)) {
        return;
      }
      autoplayId = window.setInterval(moveNext, 3600);
    };

    previousButton.addEventListener('click', movePrevious);
    nextButton.addEventListener('click', moveNext);
    pauseButton.addEventListener('click', () => {
      pausedByUser = !pausedByUser;
      pauseButton.setAttribute('aria-label', pausedByUser ? 'Resume gallery autoplay' : 'Pause gallery autoplay');
      pauseIcon.src = pausedByUser
        ? 'https://api.iconify.design/lucide/play.svg?color=%23D7E0EA'
        : 'https://api.iconify.design/lucide/circle-pause.svg?color=%23D7E0EA';
      if (pausedByUser) {
        stopAutoplay();
      } else {
        startAutoplay();
      }
    });

    gallerySection.addEventListener('mouseenter', stopAutoplay);
    gallerySection.addEventListener('mouseleave', startAutoplay);
    gallerySection.addEventListener('focusin', stopAutoplay);
    gallerySection.addEventListener('focusout', (event) => {
      if (!gallerySection.contains(event.relatedTarget)) {
        startAutoplay();
      }
    });
    document.addEventListener('visibilitychange', startAutoplay);
    window.addEventListener('resize', () => updateGallery(false));

    updateGallery(false);
    startAutoplay();
  }

  const carousel = document.querySelector('.coach-carousel');
  if (carousel) {
    const track = carousel.querySelector('.coach-carousel-track');
    const slides = [...carousel.querySelectorAll('.coach-carousel-slide')];
    const dots = [...carousel.querySelectorAll('.coach-carousel-dots button')];
    const previousButton = carousel.querySelector('[data-coach-previous]');
    const nextButton = carousel.querySelector('[data-coach-next]');
    const pauseButton = carousel.querySelector('[data-coach-pause]');
    const pauseIcon = pauseButton.querySelector('img');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let activeIndex = 0;
    let autoplayId;
    let pausedByUser = false;

    const showSlide = (index) => {
      activeIndex = (index + slides.length) % slides.length;
      track.style.transform = `translate3d(-${activeIndex * 100}%, 0, 0)`;

      slides.forEach((slide, slideIndex) => {
        slide.setAttribute('aria-hidden', String(slideIndex !== activeIndex));
      });

      dots.forEach((dot, dotIndex) => {
        if (dotIndex === activeIndex) {
          dot.setAttribute('aria-current', 'true');
        } else {
          dot.removeAttribute('aria-current');
        }
      });
    };

    const stopAutoplay = () => {
      window.clearInterval(autoplayId);
    };

    const startAutoplay = () => {
      stopAutoplay();
      if (pausedByUser || reducedMotion || document.hidden || carousel.matches(':hover') || carousel.contains(document.activeElement)) {
        return;
      }
      autoplayId = window.setInterval(() => showSlide(activeIndex + 1), 5000);
    };

    previousButton.addEventListener('click', () => showSlide(activeIndex - 1));
    nextButton.addEventListener('click', () => showSlide(activeIndex + 1));
    pauseButton.addEventListener('click', () => {
      pausedByUser = !pausedByUser;
      pauseButton.setAttribute('aria-label', pausedByUser ? 'Resume automatic sliding' : 'Pause automatic sliding');
      pauseIcon.src = pausedByUser
        ? 'https://api.iconify.design/lucide/play.svg?color=%23D7E0EA'
        : 'https://api.iconify.design/lucide/circle-pause.svg?color=%23D7E0EA';
      if (pausedByUser) {
        stopAutoplay();
      } else {
        startAutoplay();
      }
    });
    dots.forEach((dot, index) => {
      dot.addEventListener('click', () => showSlide(index));
    });

    carousel.addEventListener('mouseenter', stopAutoplay);
    carousel.addEventListener('mouseleave', startAutoplay);
    carousel.addEventListener('focusin', stopAutoplay);
    carousel.addEventListener('focusout', (event) => {
      if (!carousel.contains(event.relatedTarget)) {
        startAutoplay();
      }
    });
    document.addEventListener('visibilitychange', startAutoplay);

    showSlide(0);
    startAutoplay();
  }

});
