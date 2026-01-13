// ===================================
// LOCATION AUTOCOMPLETE (Nominatim/OpenStreetMap)
// ===================================

import { escapeHtml, getStateAbbr } from './utils.js';

const NOMINATIM_API = 'https://nominatim.openstreetmap.org/search';

export function initLocationAutocomplete() {
    const locationInput = document.getElementById('location');
    const suggestionsContainer = document.getElementById('location-suggestions');
    
    if (!locationInput || !suggestionsContainer) return;
    
    let debounceTimer;
    let currentRequest = null;
    
    // Bounding box for tristate service area (SW corner to NE corner)
    // Covers Pike County PA, Orange County NY, Sussex County NJ
    const viewbox = '-75.5,40.8,-74.0,41.8';
    
    locationInput.addEventListener('input', (e) => {
        const query = e.target.value.trim();
        
        // Clear previous timer
        clearTimeout(debounceTimer);
        
        // Hide suggestions if query is too short
        if (query.length < 2) {
            hideSuggestions();
            return;
        }
        
        // Debounce the API call
        debounceTimer = setTimeout(() => {
            searchLocation(query);
        }, 400);
    });
    
    // Hide suggestions when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.location-group')) {
            hideSuggestions();
        }
    });
    
    // Handle keyboard navigation
    locationInput.addEventListener('keydown', (e) => {
        const suggestions = suggestionsContainer.querySelectorAll('.location-suggestion');
        const active = suggestionsContainer.querySelector('.location-suggestion.active');
        
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (!active && suggestions.length > 0) {
                suggestions[0].classList.add('active');
            } else if (active && active.nextElementSibling?.classList.contains('location-suggestion')) {
                active.classList.remove('active');
                active.nextElementSibling.classList.add('active');
            }
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (active && active.previousElementSibling?.classList.contains('location-suggestion')) {
                active.classList.remove('active');
                active.previousElementSibling.classList.add('active');
            }
        } else if (e.key === 'Enter' && active) {
            e.preventDefault();
            active.click();
        } else if (e.key === 'Escape') {
            hideSuggestions();
        }
    });
    
    async function searchLocation(query) {
        // Cancel previous request
        if (currentRequest) {
            currentRequest.abort();
        }
        
        // Show loading state
        showLoading();
        
        try {
            const controller = new AbortController();
            currentRequest = controller;
            
            // Search with Nominatim - US only, biased to service area
            const params = new URLSearchParams({
                q: query,
                format: 'json',
                addressdetails: '1',
                limit: '6',
                countrycodes: 'us',
                viewbox: viewbox,
                bounded: '0' // Don't strictly limit to viewbox, but prioritize it
            });
            
            const response = await fetch(`${NOMINATIM_API}?${params}`, {
                signal: controller.signal,
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            const data = await response.json();
            
            if (data && data.length > 0) {
                displaySuggestions(data);
            } else {
                showNoResults();
            }
        } catch (error) {
            if (error.name !== 'AbortError') {
                console.error('Location search error:', error);
                hideSuggestions();
            }
        }
    }
    
    function displaySuggestions(results) {
        suggestionsContainer.innerHTML = '';
        
        results.forEach(result => {
            const addr = result.address || {};
            const suggestion = document.createElement('div');
            suggestion.className = 'location-suggestion';
            
            // Build location text from address components
            const mainParts = [];
            if (addr.house_number) mainParts.push(addr.house_number);
            if (addr.road) mainParts.push(addr.road);
            if (!mainParts.length && addr.city) mainParts.push(addr.city);
            if (!mainParts.length && addr.town) mainParts.push(addr.town);
            if (!mainParts.length && addr.village) mainParts.push(addr.village);
            if (!mainParts.length && result.name) mainParts.push(cleanLocationName(result.name));
            
            let mainText = mainParts.join(' ') || cleanLocationName(result.display_name.split(',')[0]);
            mainText = cleanLocationName(mainText);
            
            // Build subtitle
            const subParts = [];
            const city = addr.city || addr.town || addr.village || addr.hamlet || '';
            if (city && !mainText.toLowerCase().includes(city.toLowerCase())) subParts.push(city);
            if (addr.county) subParts.push(addr.county);
            if (addr.state) subParts.push(getStateAbbr(addr.state));
            if (addr.postcode) subParts.push(addr.postcode);
            
            const subText = subParts.join(', ');
            
            suggestion.innerHTML = `
                <span class="location-suggestion-icon">
                    <svg viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                        <circle cx="12" cy="10" r="3"/>
                    </svg>
                </span>
                <div class="location-suggestion-text">
                    <div class="location-suggestion-main">${escapeHtml(mainText)}</div>
                    ${subText ? `<div class="location-suggestion-sub">${escapeHtml(subText)}</div>` : ''}
                </div>
            `;
            
            suggestion.addEventListener('click', () => {
                // Format selected location nicely
                const parts = [];
                if (mainText) parts.push(mainText);
                if (city && !mainText.toLowerCase().includes(city.toLowerCase())) parts.push(city);
                if (addr.state) parts.push(getStateAbbr(addr.state));
                
                locationInput.value = parts.join(', ');
                hideSuggestions();
                locationInput.focus();
            });
            
            suggestionsContainer.appendChild(suggestion);
        });
        
        suggestionsContainer.classList.add('active');
    }
    
    function showLoading() {
        suggestionsContainer.innerHTML = `
            <div class="location-loading">
                <svg class="spinner" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10" stroke-dasharray="32" stroke-dashoffset="12"/>
                </svg>
                <span>Searching...</span>
            </div>
        `;
        suggestionsContainer.classList.add('active');
    }
    
    function showNoResults() {
        suggestionsContainer.innerHTML = `
            <div class="location-no-results">No locations found. Try a city or town name.</div>
        `;
        suggestionsContainer.classList.add('active');
    }
    
    function hideSuggestions() {
        suggestionsContainer.classList.remove('active');
        suggestionsContainer.innerHTML = '';
    }
    
    function cleanLocationName(name) {
        if (!name) return '';
        // Remove common prefixes
        return name
            .replace(/^(City of |Town of |Village of |Borough of |Township of )/i, '')
            .trim();
    }
}
