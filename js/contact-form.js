// ===================================
// CONTACT FORM
// ===================================

import { resetSelect, showFormMessage } from './vehicle-selector.js';

export function initContactForm() {
    const form = document.getElementById('contact-form');
    
    if (!form) return;

    const phoneInput = form.querySelector('#phone');
    if (phoneInput) {
        const formatPhone = (value) => {
            const digits = value.replace(/\D/g, '').slice(0, 10);
            const parts = [];
            if (digits.length > 0) {
                parts.push(`(${digits.slice(0, 3)}`);
            }
            if (digits.length >= 4) {
                parts[0] = `${parts[0]})`;
                parts.push(` ${digits.slice(3, 6)}`);
            }
            if (digits.length >= 7) {
                parts[1] = `${parts[1]}-${digits.slice(6, 10)}`;
            }
            return parts.join('');
        };

        phoneInput.addEventListener('input', () => {
            phoneInput.value = formatPhone(phoneInput.value);
        });
    }
    
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
        
        const payload = {
            name: data.name,
            email: data.email,
            phone: data.phone,
            vehicle: vehicleInfo,
            location: data.location,
            message: data.message
        };

        fetch('/api/contact', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Send failed');
                }
                showFormMessage('Thanks! Your request has been sent.', 'success');
                form.reset();
                // Reset vehicle selects
                resetSelect(document.getElementById('vehicle-make'), 'Make');
                resetSelect(document.getElementById('vehicle-model'), 'Model');
                resetSelect(document.getElementById('vehicle-submodel'), 'Trim/Style (optional)');
            })
            .catch(() => {
                showFormMessage('Something went wrong sending your request. Please try again.', 'error');
            });
    });
}
