// ===================================
// PROTECT IT UNDERCOATING
// Main JavaScript Entry Point
// ===================================

import { initNavigation, initScrollEffects } from './navigation.js';
import { initFAQ } from './faq.js';
import { initVehicleSelector } from './vehicle-selector.js';
import { initLocationAutocomplete } from './location-autocomplete.js';
import { initCarousel } from './carousel.js';
import { initContactForm } from './contact-form.js';
import { initAnimations } from './animations.js';

// Initialize all components when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initScrollEffects();
    initFAQ();
    initVehicleSelector();
    initLocationAutocomplete();
    initCarousel();
    initContactForm();
    initAnimations();
    
    console.log('Protect It Undercoating - All components initialized');
});
