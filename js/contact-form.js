// ===================================
// CONTACT FORM
// ===================================

import { resetSelect, showFormMessage } from './vehicle-selector.js';

export function initContactForm() {
    const form = document.getElementById('contact-form');
    
    if (!form) return;
    
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
