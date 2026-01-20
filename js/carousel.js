// ===================================
// IMAGE CAROUSEL
// ===================================

import { debounce } from './utils.js';

export function initCarousel() {
    const track = document.getElementById('carousel-track');
    const dotsContainer = document.getElementById('carousel-dots');
    const prevBtn = document.querySelector('.carousel-prev');
    const nextBtn = document.querySelector('.carousel-next');
    
    if (!track) return;
    
    const slides = track.querySelectorAll('.carousel-slide');
    const slideImages = Array.from(slides)
        .map((slide) => slide.querySelector('img'))
        .filter(Boolean);
    const lightbox = document.getElementById('image-lightbox');
    const lightboxImage = document.getElementById('lightbox-image');
    const lightboxPrev = document.querySelector('.lightbox-prev');
    const lightboxNext = document.querySelector('.lightbox-next');
    let currentIndex = 0;
    let slidesPerView = getSlidesPerView();
    let autoplayInterval;
    let lightboxIndex = 0;
    
    // Create dots
    const totalDots = Math.ceil(slides.length / slidesPerView);
    for (let i = 0; i < totalDots; i++) {
        const dot = document.createElement('button');
        dot.className = `carousel-dot ${i === 0 ? 'active' : ''}`;
        dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
        dot.addEventListener('click', () => goToSlide(i));
        dotsContainer.appendChild(dot);
    }
    
    // Get slides per view based on screen size
    function getSlidesPerView() {
        if (window.innerWidth >= 1024) return 3;
        if (window.innerWidth >= 768) return 2;
        return 1;
    }
    
    // Update carousel position
    function updateCarousel() {
        const slideWidth = 100 / slidesPerView;
        track.style.transform = `translateX(-${currentIndex * slideWidth}%)`;
        
        // Update dots
        const dots = dotsContainer.querySelectorAll('.carousel-dot');
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === Math.floor(currentIndex / slidesPerView));
        });
    }
    
    // Go to specific slide
    function goToSlide(dotIndex) {
        currentIndex = dotIndex * slidesPerView;
        if (currentIndex > slides.length - slidesPerView) {
            currentIndex = slides.length - slidesPerView;
        }
        updateCarousel();
        resetAutoplay();
    }
    
    // Navigate to next slide
    function nextSlide() {
        currentIndex++;
        if (currentIndex > slides.length - slidesPerView) {
            currentIndex = 0;
        }
        updateCarousel();
    }
    
    // Navigate to previous slide
    function prevSlide() {
        currentIndex--;
        if (currentIndex < 0) {
            currentIndex = slides.length - slidesPerView;
        }
        updateCarousel();
    }
    
    // Event listeners
    nextBtn.addEventListener('click', () => {
        nextSlide();
        resetAutoplay();
    });
    
    prevBtn.addEventListener('click', () => {
        prevSlide();
        resetAutoplay();
    });
    
    // Autoplay
    function startAutoplay() {
        autoplayInterval = setInterval(nextSlide, 4000);
    }
    
    function resetAutoplay() {
        clearInterval(autoplayInterval);
        startAutoplay();
    }

    // Lightbox preview
    function openLightbox(image) {
        if (!lightbox || !lightboxImage) return;
        lightboxIndex = Math.max(0, slideImages.indexOf(image));
        setLightboxImage(lightboxIndex);
        lightbox.classList.add('active');
        lightbox.setAttribute('aria-hidden', 'false');
        document.body.classList.add('lightbox-open');
        clearInterval(autoplayInterval);
    }

    function setLightboxImage(index) {
        if (!lightboxImage || slideImages.length === 0) return;
        const image = slideImages[index];
        lightboxImage.src = image.src;
        lightboxImage.alt = image.alt || 'Gallery image';
    }

    function showLightboxImage(direction) {
        if (slideImages.length === 0) return;
        lightboxIndex = (lightboxIndex + direction + slideImages.length) % slideImages.length;
        setLightboxImage(lightboxIndex);
    }

    function closeLightbox() {
        if (!lightbox || !lightboxImage) return;
        lightbox.classList.remove('active');
        lightbox.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('lightbox-open');
        startAutoplay();
    }

    if (lightbox) {
        lightbox.addEventListener('click', (event) => {
            const closeTrigger = event.target.closest('[data-lightbox-close]');
            if (closeTrigger) {
                closeLightbox();
            }
        });

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && lightbox.classList.contains('active')) {
                closeLightbox();
            }
            if (event.key === 'ArrowLeft' && lightbox.classList.contains('active')) {
                showLightboxImage(-1);
            }
            if (event.key === 'ArrowRight' && lightbox.classList.contains('active')) {
                showLightboxImage(1);
            }
        });
    }
    
    // Handle resize
    window.addEventListener('resize', debounce(() => {
        const newSlidesPerView = getSlidesPerView();
        if (newSlidesPerView !== slidesPerView) {
            slidesPerView = newSlidesPerView;
            currentIndex = 0;
            
            // Recreate dots
            dotsContainer.innerHTML = '';
            const totalDots = Math.ceil(slides.length / slidesPerView);
            for (let i = 0; i < totalDots; i++) {
                const dot = document.createElement('button');
                dot.className = `carousel-dot ${i === 0 ? 'active' : ''}`;
                dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
                dot.addEventListener('click', () => goToSlide(i));
                dotsContainer.appendChild(dot);
            }
            
            updateCarousel();
        }
    }, 200));
    
    // Touch/swipe support
    let touchStartX = 0;
    let touchEndX = 0;
    
    track.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    
    track.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, { passive: true });
    
    function handleSwipe() {
        const swipeThreshold = 50;
        const diff = touchStartX - touchEndX;
        
        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                nextSlide();
            } else {
                prevSlide();
            }
            resetAutoplay();
        }
    }
    
    // Start autoplay
    startAutoplay();

    // Image click handlers
    slideImages.forEach((image) => {
        image.setAttribute('role', 'button');
        image.setAttribute('tabindex', '0');
        image.addEventListener('click', () => openLightbox(image));
        image.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                openLightbox(image);
            }
        });
    });

    if (lightboxPrev) {
        lightboxPrev.addEventListener('click', () => showLightboxImage(-1));
    }

    if (lightboxNext) {
        lightboxNext.addEventListener('click', () => showLightboxImage(1));
    }

    if (lightbox) {
        let lightboxTouchStartX = 0;
        let lightboxTouchEndX = 0;

        lightbox.addEventListener('touchstart', (event) => {
            lightboxTouchStartX = event.changedTouches[0].screenX;
        }, { passive: true });

        lightbox.addEventListener('touchend', (event) => {
            lightboxTouchEndX = event.changedTouches[0].screenX;
            const swipeThreshold = 50;
            const diff = lightboxTouchStartX - lightboxTouchEndX;
            if (Math.abs(diff) > swipeThreshold && lightbox.classList.contains('active')) {
                if (diff > 0) {
                    showLightboxImage(1);
                } else {
                    showLightboxImage(-1);
                }
            }
        }, { passive: true });
    }
    
    // Pause on hover
    track.addEventListener('mouseenter', () => clearInterval(autoplayInterval));
    track.addEventListener('mouseleave', startAutoplay);
}
