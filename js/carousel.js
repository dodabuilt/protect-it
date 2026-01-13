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
    let currentIndex = 0;
    let slidesPerView = getSlidesPerView();
    let autoplayInterval;
    
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
    
    // Pause on hover
    track.addEventListener('mouseenter', () => clearInterval(autoplayInterval));
    track.addEventListener('mouseleave', startAutoplay);
}
