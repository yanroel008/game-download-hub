// Admin Portal Fixes and Enhancements
// This file contains fixes for common issues

// Ensure proper initialization
document.addEventListener('DOMContentLoaded', function() {
    console.log('Admin fixes loaded');
    
    // Fix missing functions
    if (typeof toggleImageInput === 'undefined') {
        window.toggleImageInput = function() {
            console.warn('toggleImageInput called but not defined');
        };
    }
    
    // Ensure edit modal functions are available
    if (typeof toggleEditImageInput === 'undefined') {
        window.toggleEditImageInput = function() {
            console.warn('toggleEditImageInput called but not defined');
        };
    }
    
    // Fix image upload handlers
    const uploadInput = document.getElementById('gameImageUpload');
    if (uploadInput) {
        uploadInput.addEventListener('change', function(e) {
            if (typeof previewUploadedImage === 'function') {
                previewUploadedImage(this);
            } else if (typeof previewImage === 'function') {
                previewImage(this);
            }
        });
    }
    
    const editUploadInput = document.getElementById('editGameImageUpload');
    if (editUploadInput) {
        editUploadInput.addEventListener('change', function(e) {
            if (typeof previewEditUploadedImage === 'function') {
                previewEditUploadedImage(this);
            }
        });
    }
    
    // Fix form submissions
    const addForm = document.getElementById('addGameForm');
    if (addForm) {
        addForm.addEventListener('submit', function(e) {
            e.preventDefault();
            if (typeof addNewGame === 'function') {
                addNewGame(e);
            }
        });
    }
    
    const editForm = document.getElementById('editGameForm');
    if (editForm) {
        editForm.addEventListener('submit', function(e) {
            e.preventDefault();
            if (typeof updateGame === 'function') {
                updateGame(e);
            }
        });
    }
});

// Enhanced remove all games function with better UI feedback
function removeAllGamesUI() {
    const currentGames = getAllGames();
    
    if (currentGames.length === 0) {
        alert('No games to remove.');
        return;
    }
    
    const message = `This will remove all ${currentGames.length} games.\n\n` +
                   `Are you sure you want to continue?`;
    
    if (confirm(message)) {
        try {
            // Clear all games
            localStorage.setItem('games', JSON.stringify([]));
            
            // Update global variables if they exist
            if (typeof window.games !== 'undefined') {
                window.games = [];
                window.filteredGames = [];
            }
            
            // Refresh displays
            if (typeof loadAdminGames === 'function') {
                loadAdminGames();
            }
            
            if (typeof displayGames === 'function') {
                displayGames();
            }
            
            alert(`Successfully removed all ${currentGames.length} games!`);
            
        } catch (error) {
            console.error('Error removing games:', error);
            alert('Error removing games. Please refresh the page and try again.');
        }
    }
}

// Fix image change issues
function fixImagePreview() {
    // Clear all image previews
    const previews = [
        'imagePreview',
        'editImagePreview', 
        'urlPreview',
        'editUrlPreview',
        'galleryPreview',
        'editGalleryPreview',
        'generatePreview',
        'editGeneratePreview'
    ];
    
    previews.forEach(previewId => {
        const preview = document.getElementById(previewId);
        if (preview) {
            preview.innerHTML = '';
            preview.classList.remove('has-image');
        }
    });
    
    // Reset file inputs
    const fileInputs = [
        'gameImageUpload',
        'editGameImageUpload'
    ];
    
    fileInputs.forEach(inputId => {
        const input = document.getElementById(inputId);
        if (input) {
            input.value = '';
        }
    });
}

// Enhanced error handling for admin operations
function handleAdminError(operation, error) {
    console.error(`Admin ${operation} error:`, error);
    
    let message = `Error during ${operation}.`;
    
    if (error.message) {
        message += `\n\nDetails: ${error.message}`;
    }
    
    message += '\n\nPlease refresh the page and try again.';
    
    alert(message);
}

// Utility function to refresh all admin displays
function refreshAdminDisplays() {
    try {
        if (typeof loadAdminGames === 'function') {
            loadAdminGames();
        }
        
        if (typeof displayGames === 'function') {
            displayGames();
        }
        
        if (typeof updateAdminStats === 'function') {
            const games = getAllGames();
            updateAdminStats(games);
        }
        
        console.log('Admin displays refreshed successfully');
        
    } catch (error) {
        console.error('Error refreshing admin displays:', error);
    }
}

// Add debugging capabilities
function debugAdmin() {
    console.log('=== Admin Debug Information ===');
    console.log('Games in localStorage:', JSON.parse(localStorage.getItem('games') || '[]'));
    console.log('isLoggedIn:', typeof isLoggedIn !== 'undefined' ? isLoggedIn : 'undefined');
    console.log('Available functions:');
    
    const adminFunctions = [
        'addNewGame',
        'updateGame', 
        'editGame',
        'removeGame',
        'confirmRemoveAllGames',
        'loadAdminGames',
        'toggleImageInput',
        'toggleEditImageInput'
    ];
    
    adminFunctions.forEach(funcName => {
        console.log(`- ${funcName}:`, typeof window[funcName] !== 'undefined' ? 'available' : 'missing');
    });
    
    console.log('DOM elements:');
    const elements = [
        'addGameForm',
        'editGameForm',
        'editModal',
        'adminGamesList'
    ];
    
    elements.forEach(elemId => {
        const elem = document.getElementById(elemId);
        console.log(`- ${elemId}:`, elem ? 'found' : 'missing');
    });
}

// Make functions available globally
if (typeof window !== 'undefined') {
    window.removeAllGamesUI = removeAllGamesUI;
    window.fixImagePreview = fixImagePreview;
    window.handleAdminError = handleAdminError;
    window.refreshAdminDisplays = refreshAdminDisplays;
    window.debugAdmin = debugAdmin;
    
    // Override the confirmRemoveAllGames if it doesn't work
    window.confirmRemoveAllGames = removeAllGamesUI;
}

// Fix broken placeholder URLs
function fixPlaceholderImages() {
    const placeholderData = {
        'Action': { color: '#667eea', icon: '⚔️' },
        'Adventure': { color: '#764ba2', icon: '🏰' }, 
        'Strategy': { color: '#f093fb', icon: '👑' },
        'RPG': { color: '#f5576c', icon: '🐉' },
        'Puzzle': { color: '#4ecdc4', icon: '🧩' },
        'Arcade': { color: '#45b7d1', icon: '🎯' }
    };
    
    // Generate SVG data URLs
    function createPlaceholderSVG(text, color) {
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200">
            <defs>
                <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:${color};stop-opacity:1" />
                    <stop offset="100%" style="stop-color:${color}99;stop-opacity:1" />
                </linearGradient>
            </defs>
            <rect width="300" height="200" fill="url(#grad)"/>
            <text x="150" y="100" text-anchor="middle" dy=".3em" fill="white" font-family="Arial, sans-serif" font-size="24" font-weight="bold">${text}</text>
        </svg>`;
        return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
    }
    
    // Replace broken gallery items with CSS-based ones
    const galleryItems = document.querySelectorAll('.gallery-item');
    galleryItems.forEach((item, index) => {
        const themes = Object.keys(placeholderData);
        if (index < themes.length) {
            const theme = themes[index];
            const data = placeholderData[theme];
            const svg = createPlaceholderSVG(theme, data.color);
            
            // Update onclick to use working SVG
            item.onclick = function() {
                if (item.closest('#editGalleryGroup')) {
                    selectEditGalleryImage(svg);
                } else {
                    selectGalleryImage(svg);
                }
            };
            
            // Replace img with CSS div
            const img = item.querySelector('img');
            if (img) {
                const placeholder = document.createElement('div');
                placeholder.className = 'gallery-placeholder';
                placeholder.style.cssText = `
                    width: 100%;
                    height: 75px;
                    background: linear-gradient(135deg, ${data.color} 0%, ${data.color}cc 100%);
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: 1.2rem;
                    font-weight: bold;
                    margin-bottom: 0.5rem;
                `;
                placeholder.textContent = `${data.icon} ${theme}`;
                img.parentNode.replaceChild(placeholder, img);
            }
        }
    });
}

// Fix null value errors in forms
function fixFormErrors() {
    // Fix edit form initialization
    const editModal = document.getElementById('editModal');
    if (editModal) {
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                    if (editModal.style.display === 'flex') {
                        // Modal is being shown, ensure all elements exist
                        setTimeout(() => {
                            const requiredElements = [
                                'editGameId', 'editGameTitle', 'editGameCategory',
                                'editGameDescription', 'editGameDownloadUrl', 'editGameSize'
                            ];
                            
                            requiredElements.forEach(id => {
                                const elem = document.getElementById(id);
                                if (!elem) {
                                    console.warn(`Missing element: ${id}`);
                                }
                            });
                        }, 100);
                    }
                }
            });
        });
        
        observer.observe(editModal, { 
            attributes: true, 
            attributeFilter: ['style'] 
        });
    }
}

// Enhanced getAllGames function with error handling
function getAllGamesFixed() {
    try {
        // Try to get from global variables first
        if (typeof window.games !== 'undefined' && Array.isArray(window.games)) {
            return window.games;
        }
        
        // Try localStorage
        const stored = localStorage.getItem('games');
        if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed)) {
                return parsed;
            }
        }
        
        // Return default games if nothing found
        return getDefaultGames();
    } catch (error) {
        console.error('Error getting games:', error);
        return getDefaultGames();
    }
}

function getDefaultGames() {
    return [];
}

// Override the global getAllGames function
if (typeof window !== 'undefined') {
    window.getAllGames = getAllGamesFixed;
}

// Initialize fixes when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        fixPlaceholderImages();
        fixFormErrors();
    }, 1000);
});

console.log('Admin fixes loaded successfully. Use debugAdmin() to check functionality.');