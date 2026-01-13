// ===================================
// PROTECT IT UNDERCOATING
// JavaScript Functionality
// ===================================

document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initScrollEffects();
    initFAQ();
    initVehicleSelector();
    initContactForm();
    initAnimations();
});

// ===================================
// NAVIGATION
// ===================================
function initNavigation() {
    const nav = document.getElementById('nav');
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    
    // Mobile menu toggle
    navToggle.addEventListener('click', () => {
        navToggle.classList.toggle('active');
        navMenu.classList.toggle('active');
        document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
    });
    
    // Close menu when clicking a link
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navToggle.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.style.overflow = '';
        });
    });
    
    // Scroll effect for navigation
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    });
    
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const headerOffset = 80;
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// ===================================
// SCROLL EFFECTS
// ===================================
function initScrollEffects() {
    // Parallax effect for hero
    const hero = document.querySelector('.hero');
    const heroBg = document.querySelector('.hero-bg');
    
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const heroHeight = hero.offsetHeight;
        
        if (scrolled < heroHeight) {
            heroBg.style.transform = `translateY(${scrolled * 0.3}px)`;
        }
    });
}

// ===================================
// FAQ ACCORDION
// ===================================
function initFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        
        question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            
            // Close all other items
            faqItems.forEach(otherItem => {
                otherItem.classList.remove('active');
            });
            
            // Toggle current item
            if (!isActive) {
                item.classList.add('active');
            }
        });
    });
}

// ===================================
// NHTSA VEHICLE SELECTOR
// ===================================
const NHTSA_API_BASE = 'https://vpic.nhtsa.dot.gov/api/vehicles';

function initVehicleSelector() {
    const yearSelect = document.getElementById('vehicle-year');
    const makeSelect = document.getElementById('vehicle-make');
    const modelSelect = document.getElementById('vehicle-model');
    const submodelSelect = document.getElementById('vehicle-submodel');
    const loadingIndicator = document.getElementById('vehicle-loading');
    
    // Populate years (current year + 1 down to 1990)
    const currentYear = new Date().getFullYear();
    for (let year = currentYear + 1; year >= 1990; year--) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        yearSelect.appendChild(option);
    }
    
    // Year change handler
    yearSelect.addEventListener('change', async () => {
        const year = yearSelect.value;
        
        // Reset dependent dropdowns
        resetSelect(makeSelect, 'Make');
        resetSelect(modelSelect, 'Model');
        resetSelect(submodelSelect, 'Trim/Style (optional)');
        
        if (!year) return;
        
        showLoading(true);
        try {
            const makes = await fetchMakes(year);
            populateSelect(makeSelect, makes, 'Make_Name', 'Make_ID');
            makeSelect.disabled = false;
        } catch (error) {
            console.error('Error fetching makes:', error);
            showFormMessage('Error loading vehicle makes. Please try again.', 'error');
        }
        showLoading(false);
    });
    
    // Make change handler
    makeSelect.addEventListener('change', async () => {
        const year = yearSelect.value;
        const makeId = makeSelect.value;
        const makeName = makeSelect.options[makeSelect.selectedIndex]?.text;
        
        // Reset dependent dropdowns
        resetSelect(modelSelect, 'Model');
        resetSelect(submodelSelect, 'Trim/Style (optional)');
        
        if (!makeId) return;
        
        showLoading(true);
        try {
            const models = await fetchModels(year, makeName);
            populateSelect(modelSelect, models, 'Model_Name', 'Model_ID');
            modelSelect.disabled = false;
        } catch (error) {
            console.error('Error fetching models:', error);
            showFormMessage('Error loading vehicle models. Please try again.', 'error');
        }
        showLoading(false);
    });
    
    // Model change handler
    modelSelect.addEventListener('change', async () => {
        const year = yearSelect.value;
        const modelId = modelSelect.value;
        const modelName = modelSelect.options[modelSelect.selectedIndex]?.text;
        const makeName = makeSelect.options[makeSelect.selectedIndex]?.text;
        
        // Reset submodel dropdown
        resetSelect(submodelSelect, 'Trim/Style (optional)');
        
        if (!modelId) return;
        
        showLoading(true);
        try {
            const submodels = await fetchSubmodels(year, makeName, modelName);
            if (submodels && submodels.length > 0) {
                populateSubmodelSelect(submodelSelect, submodels);
                submodelSelect.disabled = false;
            }
        } catch (error) {
            console.error('Error fetching submodels:', error);
            // Submodel is optional, so we don't show an error
        }
        showLoading(false);
    });
    
    function showLoading(show) {
        if (loadingIndicator) {
            loadingIndicator.style.display = show ? 'flex' : 'none';
        }
    }
}

// Fetch makes for a given year
async function fetchMakes(year) {
    const response = await fetch(
        `${NHTSA_API_BASE}/GetMakesForVehicleType/car?format=json`
    );
    const data = await response.json();
    
    // Sort makes alphabetically
    const makes = data.Results || [];
    return makes.sort((a, b) => a.MakeName.localeCompare(b.MakeName));
}

// Fetch models for a given make and year
async function fetchModels(year, makeName) {
    const response = await fetch(
        `${NHTSA_API_BASE}/GetModelsForMakeYear/make/${encodeURIComponent(makeName)}/modelyear/${year}?format=json`
    );
    const data = await response.json();
    
    // Sort models alphabetically
    const models = data.Results || [];
    return models.sort((a, b) => a.Model_Name.localeCompare(b.Model_Name));
}

// Fetch vehicle details (submodels/trims) for a specific vehicle
async function fetchSubmodels(year, makeName, modelName) {
    const response = await fetch(
        `${NHTSA_API_BASE}/GetModelsForMakeYear/make/${encodeURIComponent(makeName)}/modelyear/${year}/vehicletype/car?format=json`
    );
    const data = await response.json();
    
    // Filter to get variations of the selected model
    const results = data.Results || [];
    const modelVariations = results.filter(r => 
        r.Model_Name.toLowerCase().includes(modelName.toLowerCase()) ||
        modelName.toLowerCase().includes(r.Model_Name.toLowerCase())
    );
    
    // If we have variations, return unique ones
    if (modelVariations.length > 1) {
        const uniqueNames = [...new Set(modelVariations.map(m => m.Model_Name))];
        return uniqueNames.map(name => ({ name }));
    }
    
    // Try to get vehicle types/body styles
    try {
        const typesResponse = await fetch(
            `${NHTSA_API_BASE}/GetVehicleTypesForMake/${encodeURIComponent(makeName)}?format=json`
        );
        const typesData = await typesResponse.json();
        const types = typesData.Results || [];
        
        if (types.length > 0) {
            return types.map(t => ({ name: t.VehicleTypeName }));
        }
    } catch (e) {
        // Ignore errors for optional data
    }
    
    return [];
}

// Reset a select element
function resetSelect(select, placeholder) {
    select.innerHTML = `<option value="">${placeholder}</option>`;
    select.disabled = true;
}

// Populate a select element with options
function populateSelect(select, items, labelKey, valueKey) {
    // Keep the placeholder
    const placeholder = select.options[0];
    select.innerHTML = '';
    select.appendChild(placeholder);
    
    items.forEach(item => {
        const option = document.createElement('option');
        option.value = item[valueKey] || item[labelKey];
        option.textContent = item[labelKey];
        select.appendChild(option);
    });
}

// Populate submodel select with simpler data structure
function populateSubmodelSelect(select, items) {
    const placeholder = select.options[0];
    select.innerHTML = '';
    select.appendChild(placeholder);
    
    items.forEach(item => {
        const option = document.createElement('option');
        option.value = item.name;
        option.textContent = item.name;
        select.appendChild(option);
    });
}

// ===================================
// CONTACT FORM
// ===================================
function initContactForm() {
    const form = document.getElementById('contact-form');
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);
        
        // Build vehicle string from selects
        const yearSelect = document.getElementById('vehicle-year');
        const makeSelect = document.getElementById('vehicle-make');
        const modelSelect = document.getElementById('vehicle-model');
        const submodelSelect = document.getElementById('vehicle-submodel');
        
        const year = yearSelect.options[yearSelect.selectedIndex]?.text || '';
        const make = makeSelect.options[makeSelect.selectedIndex]?.text || '';
        const model = modelSelect.options[modelSelect.selectedIndex]?.text || '';
        const submodel = submodelSelect.options[submodelSelect.selectedIndex]?.text || '';
        
        let vehicleInfo = `${year} ${make} ${model}`.trim();
        if (submodel && submodel !== 'Trim/Style (optional)') {
            vehicleInfo += ` (${submodel})`;
        }
        
        // Create mailto link with form data
        const subject = encodeURIComponent(`Quote Request from ${data.name}`);
        const body = encodeURIComponent(
            `Name: ${data.name}\n` +
            `Email: ${data.email}\n` +
            `Vehicle: ${vehicleInfo}\n` +
            `Location: ${data.location}\n` +
            `\nMessage:\n${data.message || 'No additional details provided.'}`
        );
        
        // Open email client
        window.location.href = `mailto:ProtectIt100@proton.me?subject=${subject}&body=${body}`;
        
        // Show success message
        showFormMessage('Opening your email client...', 'success');
        
        // Reset form after a delay
        setTimeout(() => {
            form.reset();
            // Reset vehicle selects
            resetSelect(document.getElementById('vehicle-make'), 'Make');
            resetSelect(document.getElementById('vehicle-model'), 'Model');
            resetSelect(document.getElementById('vehicle-submodel'), 'Trim/Style (optional)');
        }, 1000);
    });
}

function showFormMessage(message, type) {
    // Remove existing message
    const existingMessage = document.querySelector('.form-message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    // Create and show new message
    const messageEl = document.createElement('div');
    messageEl.className = `form-message form-message-${type}`;
    messageEl.textContent = message;
    messageEl.style.cssText = `
        padding: 12px 16px;
        margin-top: 16px;
        border-radius: 8px;
        text-align: center;
        font-weight: 500;
        background: ${type === 'success' ? 'rgba(42, 157, 143, 0.2)' : 'rgba(196, 92, 38, 0.2)'};
        color: ${type === 'success' ? '#2a9d8f' : '#e07830'};
        border: 1px solid ${type === 'success' ? 'rgba(42, 157, 143, 0.3)' : 'rgba(196, 92, 38, 0.3)'};
    `;
    
    const form = document.getElementById('contact-form');
    form.appendChild(messageEl);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        messageEl.remove();
    }, 5000);
}

// ===================================
// SCROLL ANIMATIONS
// ===================================
function initAnimations() {
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                
                // Add staggered animation to children
                const children = entry.target.querySelectorAll('.service-card, .area-card, .process-step');
                children.forEach((child, index) => {
                    setTimeout(() => {
                        child.classList.add('visible');
                    }, index * 100);
                });
            }
        });
    }, observerOptions);
    
    // Observe sections
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => {
        section.classList.add('fade-in');
        observer.observe(section);
    });
    
    // Observe individual elements
    const animatedElements = document.querySelectorAll('.service-card, .area-card, .process-step, .why-content, .why-visual, .contact-info, .contact-form-wrapper');
    animatedElements.forEach(el => {
        el.classList.add('fade-in');
        observer.observe(el);
    });
}

// ===================================
// UTILITY FUNCTIONS
// ===================================

// Debounce function for performance
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Check if element is in viewport
function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}
