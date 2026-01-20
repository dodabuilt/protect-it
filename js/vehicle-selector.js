// ===================================
// NHTSA VEHICLE SELECTOR
// ===================================

const NHTSA_API_BASE = 'https://vpic.nhtsa.dot.gov/api/vehicles';

export function initVehicleSelector() {
    const yearSelect = document.getElementById('vehicle-year');
    const makeSelect = document.getElementById('vehicle-make');
    const modelSelect = document.getElementById('vehicle-model');
    const rustLevelSelect = document.getElementById('rust-level');
    const loadingIndicator = document.getElementById('vehicle-loading');
    
    if (!yearSelect) return;
    
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
        if (rustLevelSelect) {
            rustLevelSelect.value = '';
        }
        
        if (!year) return;
        
        showLoading(true);
        try {
            const makes = await fetchMakes(year);
            populateSelect(makeSelect, makes, 'MakeName', 'MakeId');
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
        if (rustLevelSelect) {
            rustLevelSelect.value = '';
        }
        
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
    modelSelect.addEventListener('change', () => {
        if (rustLevelSelect) {
            rustLevelSelect.value = '';
        }
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


// Reset a select element
export function resetSelect(select, placeholder) {
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


// Show form message (exported for use in contact form)
export function showFormMessage(message, type) {
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
    if (form) {
        form.appendChild(messageEl);
    }
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        messageEl.remove();
    }, 5000);
}
