// Admin portal functionality
let isLoggedIn = false;

// Demo credentials (in real app, this would be handled server-side)
const ADMIN_CREDENTIALS = {
    username: 'admin',
    password: 'password'
};

// Utility function to validate and fix all game IDs
function validateAndFixGameIds() {
    console.log('Validating and fixing game IDs...');
    let games = getAllGames();
    let needsUpdate = false;
    
    games = games.map((game, index) => {
        if (!game.id || isNaN(parseInt(game.id))) {
            console.warn('Found game with invalid ID:', game.title, 'Current ID:', game.id);
            const existingIds = games.map(g => parseInt(g.id)).filter(id => !isNaN(id));
            const newId = existingIds.length > 0 ? Math.max(...existingIds) + index + 1 : index + 1;
            game.id = newId;
            needsUpdate = true;
            console.log('Assigned new ID:', newId, 'to game:', game.title);
        }
        return game;
    });
    
    if (needsUpdate) {
        // Update global games array
        if (typeof window.games !== 'undefined') {
            window.games = games;
        }
        
        // Save to localStorage
        localStorage.setItem('games', JSON.stringify(games));
        console.log('Game IDs have been fixed and saved');
    } else {
        console.log('All game IDs are valid');
    }
}

// Helper function to set form values safely
function setFormValue(elementId, value, isCheckbox = false) {
    const element = document.getElementById(elementId);
    if (element) {
        if (isCheckbox) {
            element.checked = Boolean(value);
        } else {
            element.value = value || '';
        }
    }
}

// Initialize admin page
document.addEventListener('DOMContentLoaded', function() {
    checkLoginStatus();
    initializeTheme();
    
    // Validate and fix game IDs first
    validateAndFixGameIds();
    
    if (isLoggedIn) {
        loadAdminGames();
    }
    
    // Initialize image input visibility
    setTimeout(() => {
        if (document.getElementById('gameImageType')) {
            toggleImageInput();
        }
    }, 100);
});

// Dark mode functionality (same as main site)
function initializeTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    const themeIcon = document.querySelector('.theme-toggle-icon');
    
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    if (themeIcon) {
        themeIcon.textContent = savedTheme === 'dark' ? '☀️' : '🌙';
    }
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    const themeIcon = document.querySelector('.theme-toggle-icon');
    
    // Add loading animation
    const toggleBtn = document.querySelector('.theme-toggle');
    if (toggleBtn) {
        toggleBtn.style.transform = 'scale(0.9)';
    }
    
    setTimeout(() => {
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        
        if (themeIcon) {
            themeIcon.textContent = newTheme === 'dark' ? '☀️' : '🌙';
        }
        
        // Update navbar colors if scrolled
        if (window.scrollY > 100) {
            const navbar = document.querySelector('.navbar');
            if (navbar) {
                if (newTheme === 'dark') {
                    navbar.style.background = 'rgba(26, 32, 44, 0.95)';
                } else {
                    navbar.style.background = 'rgba(102, 126, 234, 0.95)';
                }
                navbar.style.backdropFilter = 'blur(15px)';
            }
        }
        
        if (toggleBtn) {
            toggleBtn.style.transform = 'scale(1)';
            createRippleEffect(toggleBtn);
        }
    }, 150);
}

function createRippleEffect(element) {
    const ripple = document.createElement('span');
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = '50%';
    ripple.style.top = '50%';
    ripple.style.transform = 'translate(-50%, -50%) scale(0)';
    ripple.style.borderRadius = '50%';
    ripple.style.background = 'rgba(255, 255, 255, 0.3)';
    ripple.style.position = 'absolute';
    ripple.style.pointerEvents = 'none';
    ripple.style.animation = 'ripple 0.6s ease-out';
    
    element.appendChild(ripple);
    
    setTimeout(() => {
        ripple.remove();
    }, 600);
}

// Tab switching functions for requirements
function switchReqTab(tabName) {
    // Remove active class from all tabs
    document.querySelectorAll('.req-tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.req-content').forEach(content => content.classList.remove('active'));
    
    // Add active class to selected tab and content
    event.target.classList.add('active');
    document.getElementById(tabName + 'Reqs').classList.add('active');
}

function switchEditReqTab(tabName) {
    // Remove active class from all tabs
    const editModal = document.getElementById('editModal');
    editModal.querySelectorAll('.req-tab').forEach(tab => tab.classList.remove('active'));
    editModal.querySelectorAll('.req-content').forEach(content => content.classList.remove('active'));
    
    // Add active class to selected tab and content
    event.target.classList.add('active');
    document.getElementById('edit' + capitalizeFirstLetter(tabName) + 'Reqs').classList.add('active');
}

function capitalizeFirstLetter(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// Check if user is already logged in
function checkLoginStatus() {
    const loginStatus = localStorage.getItem('adminLoggedIn');
    if (loginStatus === 'true') {
        isLoggedIn = true;
        showDashboard();
    }
}

// Handle login
function login(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    const errorDiv = document.getElementById('loginError');
    
    console.log('Login attempt:', { username, password }); // Debug log
    console.log('Expected:', ADMIN_CREDENTIALS); // Debug log
    
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
        isLoggedIn = true;
        localStorage.setItem('adminLoggedIn', 'true');
        showDashboard();
        loadAdminGames();
        errorDiv.style.display = 'none';
    } else {
        console.log('Login failed - credentials do not match'); // Debug log
        errorDiv.style.display = 'block';
        setTimeout(() => {
            errorDiv.style.display = 'none';
        }, 3000);
    }
}

// Handle logout
function logout() {
    isLoggedIn = false;
    localStorage.removeItem('adminLoggedIn');
    showLogin();
}

// Show dashboard
function showDashboard() {
    document.getElementById('loginSection').style.display = 'none';
    document.getElementById('adminDashboard').style.display = 'block';
    document.getElementById('logoutBtn').style.display = 'inline-block';
}

// Show login
function showLogin() {
    document.getElementById('loginSection').style.display = 'block';
    document.getElementById('adminDashboard').style.display = 'none';
    document.getElementById('logoutBtn').style.display = 'none';
    
    // Clear form
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
}

// Load games in admin panel
function loadAdminGames() {
    const gamesList = document.getElementById('adminGamesList');
    let currentGames = getAllGames();
    
    // Ensure all games have valid IDs before rendering
    let needsUpdate = false;
    currentGames = currentGames.map((game, index) => {
        if (!game.id || isNaN(parseInt(game.id))) {
            console.warn('Fixing game with missing/invalid ID during load:', game.title);
            const existingIds = currentGames.map(g => parseInt(g.id)).filter(id => !isNaN(id));
            game.id = existingIds.length > 0 ? Math.max(...existingIds) + index + 1 : index + 1;
            needsUpdate = true;
        }
        return game;
    });
    
    // Save the corrected games if any were fixed
    if (needsUpdate && typeof saveGamesToStorage === 'function') {
        window.games = currentGames;
        saveGamesToStorage();
        console.log('Updated games with corrected IDs');
    }
    
    // Update stats
    updateAdminStats(currentGames);
    
    if (currentGames.length === 0) {
        gamesList.innerHTML = '<p style="text-align: center; color: #666; padding: 2rem;">No games available.</p>';
        return;
    }
    
    gamesList.innerHTML = currentGames.map(game => {
        const protectedClass = game.protected ? ' protected-game' : '';
        const protectedBadge = game.protected ? '<span class="protected-badge">🔒 Protected</span>' : '';
        const actionButton = game.protected ? 
            '<div class="protected-msg">Core game - Cannot be deleted</div>' :
            `<div class="game-actions">
                <button class="edit-btn" data-game-id="${game.id}" onclick="editGame(${game.id})">✏️ Edit</button>
                <button class="delete-btn" data-game-id="${game.id}" data-game-title="${game.title}" onclick="confirmDeleteGameByData(this)">🗑️ Delete</button>
            </div>`;
            
        const topGameBadge = game.isTopGame ? '<span style="color: #ffd700; margin-left: 8px;">🏆 TOP</span>' : '';
        
        return `
            <div class="admin-game-item${protectedClass} ${game.isTopGame ? 'top-game-item' : ''}">
                <div class="admin-game-info">
                    <div class="admin-game-title">
                        ${game.title}
                        ${protectedBadge}
                        ${topGameBadge}
                    </div>
                    <div class="admin-game-category">Category: ${capitalizeFirst(game.category)}</div>
                    <div style="color: #888; font-size: 0.9rem;">Size: ${game.size}</div>
                </div>
                ${actionButton}
            </div>
        `;
    }).join('');
}

// Toggle image input based on type
function toggleImageInput() {
    const imageType = document.getElementById('gameImageType').value;
    const urlGroup = document.getElementById('urlGroup');
    const uploadGroup = document.getElementById('uploadGroup');
    const generateGroup = document.getElementById('generateGroup');
    
    // Hide all groups
    if (urlGroup) urlGroup.style.display = 'none';
    if (uploadGroup) uploadGroup.style.display = 'none';
    if (generateGroup) generateGroup.style.display = 'none';
    
    // Show selected group
    switch(imageType) {
        case 'url':
            if (urlGroup) urlGroup.style.display = 'block';
            break;
        case 'upload':
            if (uploadGroup) uploadGroup.style.display = 'block';
            setupDragAndDrop();
            break;
        case 'generate':
            if (generateGroup) generateGroup.style.display = 'block';
            break;
    }
}

// Emoji functions removed - no longer needed

// URL image preview
function previewUrlImage() {
    const url = document.getElementById('gameImageUrl').value;
    const preview = document.getElementById('urlPreview');
    
    if (url) {
        preview.className = 'url-preview loading';
        preview.innerHTML = '';
        
        const img = new Image();
        img.onload = function() {
            preview.className = 'url-preview';
            preview.innerHTML = `<img src="${url}" alt="URL Preview">`;
        };
        img.onerror = function() {
            preview.className = 'url-preview error';
            preview.innerHTML = '';
        };
        img.src = url;
    } else {
        preview.className = 'url-preview';
        preview.innerHTML = '';
    }
}

// Enhanced upload with drag and drop
function previewUploadedImage(input) {
    const preview = document.getElementById('imagePreview');
    const file = input.files[0];
    
    if (file) {
        // Validate file size (5MB limit)
        if (file.size > 5 * 1024 * 1024) {
            showNotification('File size too large. Please choose a file under 5MB.', 'error');
            input.value = '';
            return;
        }
        
        // Validate file type
        if (!file.type.startsWith('image/')) {
            showNotification('Please select a valid image file.', 'error');
            input.value = '';
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(e) {
            preview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
            preview.classList.add('has-image');
        };
        reader.readAsDataURL(file);
    } else {
        preview.innerHTML = `
            <div class="upload-icon">📁</div>
            <span>Click here or drag & drop your image</span>
            <small>Supports: JPG, PNG, GIF, WebP (Max: 5MB)</small>
        `;
        preview.classList.remove('has-image');
    }
}

// Setup drag and drop functionality
function setupDragAndDrop() {
    const uploadContainer = document.querySelector('.image-upload-container');
    const fileInput = document.getElementById('gameImageUpload');
    
    if (!uploadContainer) return;
    
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        uploadContainer.addEventListener(eventName, preventDefaults, false);
        document.body.addEventListener(eventName, preventDefaults, false);
    });
    
    ['dragenter', 'dragover'].forEach(eventName => {
        uploadContainer.addEventListener(eventName, highlight, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        uploadContainer.addEventListener(eventName, unhighlight, false);
    });
    
    uploadContainer.addEventListener('drop', handleDrop, false);
    
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    function highlight(e) {
        uploadContainer.classList.add('dragover');
    }
    
    function unhighlight(e) {
        uploadContainer.classList.remove('dragover');
    }
    
    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        
        if (files.length > 0) {
            fileInput.files = files;
            previewUploadedImage(fileInput);
        }
    }
}

// Gallery functions removed - no longer needed

// Generate placeholder images
function generatePlaceholder(type) {
    const preview = document.getElementById('generatePreview');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = 300;
    canvas.height = 200;
    
    preview.classList.remove('empty');
    preview.innerHTML = '';
    
    switch(type) {
        case 'geometric':
            generateGeometric(ctx, canvas.width, canvas.height);
            break;
        case 'gradient':
            generateGradient(ctx, canvas.width, canvas.height);
            break;
        case 'pattern':
            generatePattern(ctx, canvas.width, canvas.height);
            break;
        case 'abstract':
            generateAbstract(ctx, canvas.width, canvas.height);
            break;
    }
    
    preview.appendChild(canvas);
}

// Geometric pattern generator
function generateGeometric(ctx, width, height) {
    const colors = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4ecdc4'];
    
    ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
    ctx.fillRect(0, 0, width, height);
    
    ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
    for (let i = 0; i < 20; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const size = Math.random() * 50 + 10;
        
        if (Math.random() > 0.5) {
            ctx.fillRect(x, y, size, size);
        } else {
            ctx.beginPath();
            ctx.arc(x, y, size/2, 0, 2 * Math.PI);
            ctx.fill();
        }
    }
}

// Gradient generator
function generateGradient(ctx, width, height) {
    const colors = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4ecdc4', '#45b7d1'];
    const color1 = colors[Math.floor(Math.random() * colors.length)];
    const color2 = colors[Math.floor(Math.random() * colors.length)];
    
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, color1);
    gradient.addColorStop(1, color2);
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    
    // Add some overlay shapes
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    for (let i = 0; i < 10; i++) {
        ctx.beginPath();
        ctx.arc(Math.random() * width, Math.random() * height, Math.random() * 30 + 5, 0, 2 * Math.PI);
        ctx.fill();
    }
}

// Pattern generator
function generatePattern(ctx, width, height) {
    const colors = ['#667eea', '#764ba2', '#f093fb'];
    ctx.fillStyle = colors[0];
    ctx.fillRect(0, 0, width, height);
    
    ctx.fillStyle = colors[1];
    const gridSize = 20;
    for (let x = 0; x < width; x += gridSize) {
        for (let y = 0; y < height; y += gridSize) {
            if ((x / gridSize + y / gridSize) % 2 === 0) {
                ctx.fillRect(x, y, gridSize, gridSize);
            }
        }
    }
}

// Abstract generator
function generateAbstract(ctx, width, height) {
    const colors = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4ecdc4'];
    
    // Background
    ctx.fillStyle = colors[0];
    ctx.fillRect(0, 0, width, height);
    
    // Random shapes
    for (let i = 0; i < 15; i++) {
        ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)] + '80';
        ctx.beginPath();
        
        const centerX = Math.random() * width;
        const centerY = Math.random() * height;
        const radius = Math.random() * 60 + 20;
        
        ctx.moveTo(centerX, centerY);
        for (let j = 0; j < 6; j++) {
            const angle = (j / 6) * 2 * Math.PI;
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;
            ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
    }
}

// Get image data based on type
function getImageData() {
    const imageType = document.getElementById('gameImageType').value;
    
    switch(imageType) {
        case 'url':
            return {
                type: 'url',
                value: document.getElementById('gameImageUrl').value || ''
            };
        case 'upload':
            const fileInput = document.getElementById('gameImageUpload');
            const file = fileInput.files[0];
            if (file) {
                return new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        resolve({
                            type: 'upload',
                            value: e.target.result
                        });
                    };
                    reader.readAsDataURL(file);
                });
            }
            return { type: 'emoji', value: '🎮' };
        case 'generate':
            const canvas = document.querySelector('#generatePreview canvas');
            if (canvas) {
                return {
                    type: 'upload',
                    value: canvas.toDataURL()
                };
            }
            return { type: 'emoji', value: '🎮' };
        default:
            return { type: 'emoji', value: '🎮' };
    }
}

// Add new game
async function addNewGame(event) {
    event.preventDefault();
    
    if (!isLoggedIn) {
        alert('Please log in first.');
        return;
    }
    
    const imageData = await getImageData();
    
    const gameData = {
        title: document.getElementById('gameTitle').value,
        category: document.getElementById('gameCategory').value,
        description: document.getElementById('gameDescription').value,
        downloadUrl: document.getElementById('gameDownloadUrl').value,
        size: document.getElementById('gameSize').value,
        imageType: imageData.type,
        image: imageData.value,
        // Additional information
        developer: document.getElementById('gameDeveloper').value,
        releaseDate: document.getElementById('gameReleaseDate').value,
        // System requirements
        minOS: document.getElementById('minOS').value,
        minProcessor: document.getElementById('minProcessor').value,
        minMemory: document.getElementById('minMemory').value,
        minGraphics: document.getElementById('minGraphics').value,
        minStorage: document.getElementById('minStorage').value,
        recOS: document.getElementById('recOS').value,
        recProcessor: document.getElementById('recProcessor').value,
        recMemory: document.getElementById('recMemory').value,
        recGraphics: document.getElementById('recGraphics').value,
        recStorage: document.getElementById('recStorage').value,
        // Screenshots
        screenshots: gameScreenshots.map(screenshot => screenshot.dataUrl),
        // Videos
        videos: gameVideos.map(video => ({
            url: video.url,
            embedUrl: video.embedUrl,
            platform: video.platform,
            title: video.title
        })),
        // Top Game status
        isTopGame: document.getElementById('isTopGame').checked
    };
    
    // Validate required fields
    if (!gameData.title || !gameData.category || !gameData.description || 
        !gameData.downloadUrl || !gameData.size) {
        alert('Please fill in all required fields.');
        return;
    }
    
    // Validate URL format
    try {
        new URL(gameData.downloadUrl);
    } catch (e) {
        alert('Please enter a valid download URL.');
        return;
    }
    
    // Add the game
    const newGame = addGame(gameData);
    
    if (newGame) {
        alert(`Game "${gameData.title}" added successfully!`);
        
        // Clear the form
        document.getElementById('addGameForm').reset();
        
        // Clear screenshots and videos
        clearScreenshots();
        clearVideos();
        
        // Reload the admin games list
        loadAdminGames();
        
        // Add animation to the new game
        setTimeout(() => {
            const gameItems = document.querySelectorAll('.admin-game-item');
            const lastItem = gameItems[gameItems.length - 1];
            if (lastItem) {
                lastItem.style.backgroundColor = '#e8f5e8';
                setTimeout(() => {
                    lastItem.style.transition = 'background-color 1s ease';
                    lastItem.style.backgroundColor = '#f9f9f9';
                }, 500);
            }
        }, 100);
    } else {
        alert('Error adding game. Please try again.');
    }
}

// Confirm delete game (new version using data attributes)
function confirmDeleteGameByData(button) {
    if (!isLoggedIn) {
        alert('Please log in first.');
        return;
    }
    
    const gameId = parseInt(button.getAttribute('data-game-id'));
    const gameTitle = button.getAttribute('data-game-title');
    
    const confirmed = confirm(`Are you sure you want to delete "${gameTitle}"?\n\nThis action cannot be undone.`);
    
    if (confirmed) {
        deleteGame(gameId, gameTitle);
    }
}

// Confirm delete game (legacy version - kept for compatibility)
function confirmDeleteGame(gameId, gameTitle) {
    if (!isLoggedIn) {
        alert('Please log in first.');
        return;
    }
    
    const confirmed = confirm(`Are you sure you want to delete "${gameTitle}"?\n\nThis action cannot be undone.`);
    
    if (confirmed) {
        deleteGame(gameId, gameTitle);
    }
}

// Delete game
function deleteGame(gameId, gameTitle) {
    try {
        removeGame(gameId);
        alert(`Game "${gameTitle}" deleted successfully!`);
        loadAdminGames();
    } catch (error) {
        alert('Error deleting game. Please try again.');
        console.error('Delete error:', error);
    }
}

// Form validation helpers
function validateForm() {
    const title = document.getElementById('gameTitle').value.trim();
    const category = document.getElementById('gameCategory').value;
    const description = document.getElementById('gameDescription').value.trim();
    const downloadUrl = document.getElementById('gameDownloadUrl').value.trim();
    const size = document.getElementById('gameSize').value.trim();
    
    if (title.length < 3) {
        alert('Game title must be at least 3 characters long.');
        return false;
    }
    
    if (description.length < 10) {
        alert('Game description must be at least 10 characters long.');
        return false;
    }
    
    if (!downloadUrl.startsWith('http')) {
        alert('Download URL must start with http:// or https://');
        return false;
    }
    
    return true;
}

// Auto-save functionality for form data
function autoSaveFormData() {
    const formData = {
        title: document.getElementById('gameTitle').value,
        category: document.getElementById('gameCategory').value,
        description: document.getElementById('gameDescription').value,
        downloadUrl: document.getElementById('gameDownloadUrl').value,
        size: document.getElementById('gameSize').value,
        image: document.getElementById('gameImage').value
    };
    
    localStorage.setItem('adminFormData', JSON.stringify(formData));
}

// Restore form data
function restoreFormData() {
    const savedData = localStorage.getItem('adminFormData');
    if (savedData) {
        const formData = JSON.parse(savedData);
        
        document.getElementById('gameTitle').value = formData.title || '';
        document.getElementById('gameCategory').value = formData.category || '';
        document.getElementById('gameDescription').value = formData.description || '';
        document.getElementById('gameDownloadUrl').value = formData.downloadUrl || '';
        document.getElementById('gameSize').value = formData.size || '';
        document.getElementById('gameImage').value = formData.image || '';
    }
}

// Clear saved form data
function clearSavedFormData() {
    localStorage.removeItem('adminFormData');
}

// Add event listeners for auto-save
document.addEventListener('DOMContentLoaded', function() {
    const formInputs = ['gameTitle', 'gameCategory', 'gameDescription', 'gameDownloadUrl', 'gameSize', 'gameImage'];
    
    formInputs.forEach(inputId => {
        const element = document.getElementById(inputId);
        if (element) {
            element.addEventListener('input', autoSaveFormData);
            element.addEventListener('change', autoSaveFormData);
        }
    });
    
    // Restore form data when dashboard is shown
    if (isLoggedIn) {
        setTimeout(restoreFormData, 100);
    }
});

// Statistics and analytics (basic implementation)
function getGameStats() {
    const currentGames = getAllGames();
    const stats = {
        totalGames: currentGames.length,
        categories: {},
        totalSize: 0
    };
    
    currentGames.forEach(game => {
        // Count by category
        stats.categories[game.category] = (stats.categories[game.category] || 0) + 1;
        
        // Calculate total size (basic parsing)
        const sizeMatch = game.size.match(/([0-9.]+)\s*(GB|MB)/i);
        if (sizeMatch) {
            const value = parseFloat(sizeMatch[1]);
            const unit = sizeMatch[2].toUpperCase();
            const sizeInGB = unit === 'GB' ? value : value / 1024;
            stats.totalSize += sizeInGB;
        }
    });
    
    return stats;
}

// Display basic stats (can be called from console or added to UI)
function displayStats() {
    const stats = getGameStats();
    console.log('Game Statistics:', stats);
    return stats;
}

// Update admin statistics
function updateAdminStats(games) {
    const totalGamesEl = document.getElementById('totalGames');
    const protectedGamesEl = document.getElementById('protectedGames');
    
    if (totalGamesEl) totalGamesEl.textContent = games.length;
    if (protectedGamesEl) protectedGamesEl.textContent = games.filter(g => g.protected).length;
}

// Filter admin games by category
function filterAdminGames() {
    const categoryFilter = document.getElementById('adminCategoryFilter').value;
    const allGames = getAllGames();
    
    const filteredGames = categoryFilter 
        ? allGames.filter(game => game.category === categoryFilter)
        : allGames;
    
    displayFilteredAdminGames(filteredGames);
}

// Display filtered admin games
function displayFilteredAdminGames(games) {
    const gamesList = document.getElementById('adminGamesList');
    
    if (games.length === 0) {
        gamesList.innerHTML = '<p style="text-align: center; color: #666; padding: 2rem;">No games found in this category.</p>';
        return;
    }
    
    gamesList.innerHTML = games.map(game => {
        const protectedClass = game.protected ? ' protected-game' : '';
        const protectedBadge = game.protected ? '<span class="protected-badge">🔒 Protected</span>' : '';
        const actionButton = game.protected ? 
            '<div class="protected-msg">Core game - Cannot be deleted</div>' :
            `<div class="game-actions">
                <button class="edit-btn" data-game-id="${game.id}" onclick="editGame(${game.id})">✏️ Edit</button>
                <button class="delete-btn" data-game-id="${game.id}" data-game-title="${game.title}" onclick="confirmDeleteGameByData(this)">🗑️ Delete</button>
            </div>`;
            
        const topGameBadge = game.isTopGame ? '<span style="color: #ffd700; margin-left: 8px;">🏆 TOP</span>' : '';
        
        return `
            <div class="admin-game-item${protectedClass} ${game.isTopGame ? 'top-game-item' : ''}">
                <div class="admin-game-info">
                    <div class="admin-game-title">
                        ${game.title}
                        ${protectedBadge}
                        ${topGameBadge}
                    </div>
                    <div class="admin-game-category">Category: ${capitalizeFirst(game.category)}</div>
                    <div style="color: #888; font-size: 0.9rem;">Size: ${game.size}</div>
                </div>
                ${actionButton}
            </div>
        `;
    }).join('');
}

// Export games to JSON file
function exportGames() {
    const games = getAllGames();
    const dataStr = JSON.stringify(games, null, 2);
    const blob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `gamehub-games-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    showNotification('Games exported successfully!', 'success');
}

// Import games from JSON file
function importGames() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.className = 'hidden-file-input';
    
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const importedGames = JSON.parse(e.target.result);
                    
                    if (Array.isArray(importedGames)) {
                        // Merge with existing games, avoiding duplicates
                        const existingTitles = getAllGames().map(g => g.title.toLowerCase());
                        const newGames = importedGames.filter(g => 
                            !existingTitles.includes(g.title.toLowerCase())
                        );
                        
                        newGames.forEach(game => {
                            game.id = Math.max(...getAllGames().map(g => g.id), 0) + 1;
                            addGame(game);
                        });
                        
                        showNotification(`Successfully imported ${newGames.length} new games!`, 'success');
                        loadAdminGames();
                    } else {
                        throw new Error('Invalid file format');
                    }
                } catch (error) {
                    showNotification('Error importing games: Invalid file format', 'error');
                }
            };
            reader.readAsText(file);
        }
    };
    
    input.click();
}

// Show notification
function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `${type}-message`;
    notification.textContent = message;
    
    const adminContent = document.querySelector('.admin-content');
    adminContent.insertBefore(notification, adminContent.firstChild);
    
    setTimeout(() => {
        notification.remove();
    }, 5000);
}

// Edit game functionality
function editGame(gameId) {
    console.log('editGame called with ID:', gameId, typeof gameId);
    
    // Ensure gameId is a number
    const numericId = parseInt(gameId);
    if (isNaN(numericId)) {
        console.error('Invalid game ID:', gameId);
        showNotification('Invalid game ID', 'error');
        return;
    }
    
    let games = getAllGames();
    
    // Fix any games with invalid IDs
    games = games.map((game, index) => {
        if (!game.id || isNaN(parseInt(game.id))) {
            console.warn('Fixing game with invalid ID:', game);
            const existingIds = games.map(g => parseInt(g.id)).filter(id => !isNaN(id));
            const nextId = existingIds.length > 0 ? Math.max(...existingIds) + 1 : 1 + index;
            game.id = nextId;
            console.log('Assigned new ID:', game.id, 'to game:', game.title);
        }
        return game;
    });
    
    // Save fixed games back to storage
    if (typeof saveGamesToStorage === 'function') {
        window.games = games;
        saveGamesToStorage();
    }
    
    console.log('Available games:', games.map(g => ({ id: g.id, title: g.title })));
    
    const game = games.find(g => parseInt(g.id) === numericId);
    if (!game) {
        console.error('Game not found with ID:', numericId);
        showNotification('Game not found', 'error');
        return;
    }
    
    console.log('Found game:', game);
    
    // Fill the edit form with null checking
    const setFormValue = (id, value) => {
        const element = document.getElementById(id);
        if (element) {
            element.value = value || '';
            console.log(`Set ${id} to: "${value}"`);
        } else {
            console.error(`Form element not found: ${id}`);
        }
    };
    
    console.log('Filling form with game data:', game);
    setFormValue('editGameId', game.id);
    setFormValue('editGameTitle', game.title);
    setFormValue('editGameCategory', game.category);
    setFormValue('editGameDescription', game.description);
    setFormValue('editGameDownloadUrl', game.downloadUrl);
    setFormValue('editGameSize', game.size);
    
    // Additional information
    setFormValue('editGameDeveloper', game.developer);
    setFormValue('editGameReleaseDate', game.releaseDate);
    
    // System requirements
    setFormValue('editMinOS', game.minOS);
    setFormValue('editMinProcessor', game.minProcessor);
    setFormValue('editMinMemory', game.minMemory);
    setFormValue('editMinGraphics', game.minGraphics);
    setFormValue('editMinStorage', game.minStorage);
    setFormValue('editRecOS', game.recOS);
    setFormValue('editRecProcessor', game.recProcessor);
    setFormValue('editRecMemory', game.recMemory);
    setFormValue('editRecGraphics', game.recGraphics);
    setFormValue('editRecStorage', game.recStorage);
    
    // Show current image
    const currentImage = document.getElementById('currentImage');
    if (game.imageType === 'url' && game.image) {
        currentImage.innerHTML = `<img src="${game.image}" alt="${game.title}">`;
    } else if (game.imageType === 'upload' && game.image) {
        currentImage.innerHTML = `<img src="${game.image}" alt="${game.title}">`;
    } else {
        currentImage.innerHTML = `<div class="current-image-placeholder">${game.image || '🎮'}</div>`;
    }
    
    // Display current screenshots and videos
    displayCurrentScreenshots(game.screenshots || []);
    displayCurrentVideos(game.videos || []);
    
    // Set top game checkbox
    setFormValue('editIsTopGame', game.isTopGame || false, true);
    
    // Reset image type selector
    document.getElementById('editGameImageType').value = 'keep';
    hideAllEditImageGroups();
    
    // Show modal with a small delay to ensure DOM is ready
    document.getElementById('editModal').style.display = 'flex';
    
    // Ensure form is properly populated after modal is shown
    setTimeout(() => {
        console.log('Double-checking form population...');
        setFormValue('editGameTitle', game.title);
        setFormValue('editGameCategory', game.category);
        setFormValue('editGameDescription', game.description);
        setFormValue('editGameDownloadUrl', game.downloadUrl);
        setFormValue('editGameSize', game.size);
    }, 100);
    document.body.style.overflow = 'hidden';
}

function closeEditModal() {
    document.getElementById('editModal').style.display = 'none';
    document.body.style.overflow = 'auto';
    
    // Reset form
    document.getElementById('editGameForm').reset();
    hideAllEditImageGroups();
    clearEditImagePreviews();
    
    // Clear edit screenshots and videos
    editGameScreenshots = [];
    editGameVideos = [];
    updateEditScreenshotPreview();
    updateEditVideoPreview();
}

function hideAllEditImageGroups() {
    const editUrlGroup = document.getElementById('editUrlGroup');
    const editUploadGroup = document.getElementById('editUploadGroup');
    const editGenerateGroup = document.getElementById('editGenerateGroup');
    
    if (editUrlGroup) editUrlGroup.style.display = 'none';
    if (editUploadGroup) editUploadGroup.style.display = 'none';
    if (editGenerateGroup) editGenerateGroup.style.display = 'none';
}

function toggleEditImageInput() {
    const imageType = document.getElementById('editGameImageType').value;
    hideAllEditImageGroups();
    
    switch(imageType) {
        case 'url':
            const editUrlGroup = document.getElementById('editUrlGroup');
            if (editUrlGroup) editUrlGroup.style.display = 'block';
            break;
        case 'upload':
            const editUploadGroup = document.getElementById('editUploadGroup');
            if (editUploadGroup) editUploadGroup.style.display = 'block';
            setupEditDragAndDrop(); // Setup drag and drop for edit modal
            break;
        case 'generate':
            const editGenerateGroup = document.getElementById('editGenerateGroup');
            const editGeneratePreview = document.getElementById('editGeneratePreview');
            if (editGenerateGroup) editGenerateGroup.style.display = 'block';
            if (editGeneratePreview) editGeneratePreview.classList.add('empty');
            break;
    }
}

// Setup drag and drop for edit modal
function setupEditDragAndDrop() {
    const uploadContainer = document.querySelector('#editUploadGroup .image-upload-container');
    const fileInput = document.getElementById('editGameImageUpload');
    
    if (!uploadContainer || !fileInput) return;
    
    // Remove existing listeners to avoid duplicates
    uploadContainer.removeEventListener('drop', handleEditDrop);
    
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        uploadContainer.addEventListener(eventName, preventDefaults, false);
    });
    
    ['dragenter', 'dragover'].forEach(eventName => {
        uploadContainer.addEventListener(eventName, highlightEdit, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        uploadContainer.addEventListener(eventName, unhighlightEdit, false);
    });
    
    uploadContainer.addEventListener('drop', handleEditDrop, false);
    
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    function highlightEdit(e) {
        uploadContainer.classList.add('dragover');
    }
    
    function unhighlightEdit(e) {
        uploadContainer.classList.remove('dragover');
    }
    
    function handleEditDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        
        if (files.length > 0) {
            fileInput.files = files;
            previewEditUploadedImage(fileInput);
        }
    }
}

// Edit form image functions (similar to add form)

function previewEditUrlImage() {
    const url = document.getElementById('editGameImageUrl').value;
    const preview = document.getElementById('editUrlPreview');
    
    if (url) {
        preview.className = 'url-preview loading';
        preview.innerHTML = '';
        
        const img = new Image();
        img.onload = function() {
            preview.className = 'url-preview';
            preview.innerHTML = `<img src="${url}" alt="URL Preview">`;
        };
        img.onerror = function() {
            preview.className = 'url-preview error';
            preview.innerHTML = '';
        };
        img.src = url;
    } else {
        preview.className = 'url-preview';
        preview.innerHTML = '';
    }
}

function previewEditUploadedImage(input) {
    const preview = document.getElementById('editImagePreview');
    const file = input.files[0];
    
    if (file) {
        if (file.size > 5 * 1024 * 1024) {
            showNotification('File size too large. Please choose a file under 5MB.', 'error');
            input.value = '';
            return;
        }
        
        if (!file.type.startsWith('image/')) {
            showNotification('Please select a valid image file.', 'error');
            input.value = '';
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(e) {
            preview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
            preview.classList.add('has-image');
        };
        reader.readAsDataURL(file);
    } else {
        preview.innerHTML = `
            <div class="upload-icon">📁</div>
            <span>Click here or drag & drop your image</span>
            <small>Supports: JPG, PNG, GIF, WebP (Max: 5MB)</small>
        `;
        preview.classList.remove('has-image');
    }
}

// Edit gallery functions removed - no longer needed

function generateEditPlaceholder(type) {
    const preview = document.getElementById('editGeneratePreview');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = 300;
    canvas.height = 200;
    
    preview.classList.remove('empty');
    preview.innerHTML = '';
    
    switch(type) {
        case 'geometric':
            generateGeometric(ctx, canvas.width, canvas.height);
            break;
        case 'gradient':
            generateGradient(ctx, canvas.width, canvas.height);
            break;
        case 'pattern':
            generatePattern(ctx, canvas.width, canvas.height);
            break;
        case 'abstract':
            generateAbstract(ctx, canvas.width, canvas.height);
            break;
    }
    
    preview.appendChild(canvas);
}

function clearEditImagePreviews() {
    const urlPreview = document.getElementById('editUrlPreview');
    const imagePreview = document.getElementById('editImagePreview');
    const generatePreview = document.getElementById('editGeneratePreview');
    
    if (urlPreview) urlPreview.innerHTML = '';
    if (imagePreview) {
        imagePreview.innerHTML = `
            <div class="upload-icon">📁</div>
            <span>Click here or drag & drop your image</span>
            <small>Supports: JPG, PNG, GIF, WebP (Max: 5MB)</small>
        `;
        imagePreview.classList.remove('has-image');
    }
    if (generatePreview) {
        generatePreview.innerHTML = '';
        generatePreview.classList.add('empty');
    }
    
    // Clear file inputs
    const fileInput = document.getElementById('editGameImageUpload');
    if (fileInput) fileInput.value = '';
}

// Get edit image data
async function getEditImageData() {
    const imageType = document.getElementById('editGameImageType').value;
    
    if (imageType === 'keep') {
        return null; // Keep current image
    }
    
    switch(imageType) {
        case 'url':
            return {
                type: 'url',
                value: document.getElementById('editGameImageUrl').value || ''
            };
        case 'upload':
            const fileInput = document.getElementById('editGameImageUpload');
            const file = fileInput.files[0];
            if (file) {
                return new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        resolve({
                            type: 'upload',
                            value: e.target.result
                        });
                    };
                    reader.readAsDataURL(file);
                });
            }
            return { type: 'emoji', value: '🎮' };
        case 'generate':
            const canvas = document.querySelector('#editGeneratePreview canvas');
            if (canvas) {
                return {
                    type: 'upload',
                    value: canvas.toDataURL()
                };
            }
            return { type: 'emoji', value: '🎮' };
        default:
            return null;
    }
}

// Update game
async function updateGame(event) {
    event.preventDefault();
    
    if (!isLoggedIn) {
        alert('Please log in first.');
        return;
    }
    
    const gameId = parseInt(document.getElementById('editGameId').value);
    
    // Validate gameId
    if (isNaN(gameId)) {
        console.error('Invalid game ID in update form');
        showNotification('Invalid game ID', 'error');
        return;
    }
    
    const imageData = await getEditImageData();
    
    // Helper function to safely get form values
    const getFormValue = (id) => {
        const element = document.getElementById(id);
        if (!element) {
            console.error(`Form element not found: ${id}`);
            return '';
        }
        return element.value?.trim() || '';
    };
    
    const gameData = {
        title: getFormValue('editGameTitle'),
        category: getFormValue('editGameCategory'),
        description: getFormValue('editGameDescription'),
        downloadUrl: getFormValue('editGameDownloadUrl'),
        size: getFormValue('editGameSize')
    };
    
    // Add image data if changed
    if (imageData) {
        gameData.imageType = imageData.type;
        gameData.image = imageData.value;
    }
    
    // Debug log the form data
    console.log('Game data for update:', gameData);
    console.log('Form element values:', {
        title: document.getElementById('editGameTitle')?.value,
        category: document.getElementById('editGameCategory')?.value,
        description: document.getElementById('editGameDescription')?.value,
        downloadUrl: document.getElementById('editGameDownloadUrl')?.value,
        size: document.getElementById('editGameSize')?.value
    });
    
    // For updates, we should preserve existing values if fields are empty
    // Get the original game data
    const originalGame = getAllGames().find(g => parseInt(g.id) === gameId);
    if (!originalGame) {
        console.error('Original game not found for update');
        showNotification('Game not found', 'error');
        return;
    }
    
    // Get isTopGame checkbox value
    const isTopGameChecked = document.getElementById('editIsTopGame').checked;
    
    // Merge with original data - if a field is empty, keep the original value
    const mergedGameData = {
        title: gameData.title || originalGame.title,
        category: gameData.category || originalGame.category, 
        description: gameData.description || originalGame.description,
        downloadUrl: gameData.downloadUrl || originalGame.downloadUrl,
        size: gameData.size || originalGame.size,
        isTopGame: isTopGameChecked
    };
    
    // Add image data
    if (imageData) {
        mergedGameData.imageType = imageData.type;
        mergedGameData.image = imageData.value;
    } else {
        // Keep existing image data
        mergedGameData.imageType = originalGame.imageType;
        mergedGameData.image = originalGame.image;
    }
    
    // Add screenshots data
    if (editGameScreenshots.length > 0) {
        // Combine existing screenshots with new ones
        const existingScreenshots = originalGame.screenshots || [];
        const newScreenshots = editGameScreenshots.map(screenshot => screenshot.dataUrl);
        mergedGameData.screenshots = [...existingScreenshots, ...newScreenshots];
    } else {
        // Keep existing screenshots
        mergedGameData.screenshots = originalGame.screenshots || [];
    }
    
    // Add videos data
    if (editGameVideos.length > 0) {
        // Combine existing videos with new ones
        const existingVideos = originalGame.videos || [];
        const newVideos = editGameVideos.map(video => ({
            url: video.url,
            embedUrl: video.embedUrl,
            platform: video.platform,
            title: video.title
        }));
        mergedGameData.videos = [...existingVideos, ...newVideos];
    } else {
        // Keep existing videos
        mergedGameData.videos = originalGame.videos || [];
    }
    
    console.log('Merged game data:', mergedGameData);
    
    // Update the game
    try {
        updateGameData(gameId, mergedGameData);
        showNotification(`Game "${mergedGameData.title}" updated successfully!`, 'success');
        
        // Clear edit screenshots and videos
        editGameScreenshots = [];
        editGameVideos = [];
        
        closeEditModal();
        loadAdminGames();
        
        // Update main display if needed
        if (typeof displayGames === 'function') {
            displayGames();
        }
    } catch (error) {
        showNotification('Error updating game. Please try again.', 'error');
        console.error('Update error:', error);
    }
}

// Update game data in storage
function updateGameData(gameId, newData) {
    try {
        // Get current games with enhanced error handling
        let currentGames = getAllGamesFixed ? getAllGamesFixed() : getAllGames();
        
        if (!Array.isArray(currentGames)) {
            console.error('Current games is not an array:', currentGames);
            currentGames = [];
        }
        
        const gameIndex = currentGames.findIndex(g => g && g.id === parseInt(gameId));
        
        if (gameIndex === -1) {
            console.error('Game not found with ID:', gameId);
            console.error('Available games:', currentGames.map(g => ({ id: g?.id, title: g?.title })));
            throw new Error(`Game not found with ID: ${gameId}`);
        }
        
        // Keep existing data and update with new data
        currentGames[gameIndex] = { ...currentGames[gameIndex], ...newData };
        
        // Update all references
        if (typeof window !== 'undefined') {
            window.games = currentGames;
            window.filteredGames = [...currentGames];
        }
        
        // Save to localStorage
        localStorage.setItem('games', JSON.stringify(currentGames));
        
        // Update the main script's games variable if it exists
        if (typeof games !== 'undefined' && Array.isArray(games)) {
            games.splice(0, games.length, ...currentGames);
        }
        if (typeof filteredGames !== 'undefined' && Array.isArray(filteredGames)) {
            filteredGames.splice(0, filteredGames.length, ...currentGames);
        }
        
        console.log('Game updated successfully:', currentGames[gameIndex]);
        
    } catch (error) {
        console.error('updateGameData error:', error);
        throw error;
    }
}

// Remove all games functionality
function confirmRemoveAllGames() {
    if (!isLoggedIn) {
        alert('Please log in first.');
        return;
    }
    
    const currentGames = getAllGames();
    const nonProtectedGames = currentGames.filter(game => !game.protected);
    
    if (nonProtectedGames.length === 0) {
        showNotification('No non-protected games to remove.', 'error');
        return;
    }
    
    const confirmed = confirm(
        `Are you sure you want to remove ALL ${nonProtectedGames.length} non-protected games?\n\n` +
        `Protected games will remain safe.\n\n` +
        `This action cannot be undone.`
    );
    
    if (confirmed) {
        removeAllGames();
    }
}

function removeAllGames() {
    try {
        const currentGames = getAllGames();
        const protectedGames = currentGames.filter(game => game.protected);
        
        // Update all references to only protected games
        if (typeof window !== 'undefined') {
            window.games = protectedGames;
            window.filteredGames = [...protectedGames];
        }
        
        // Update main script variables
        if (typeof games !== 'undefined') {
            games.splice(0, games.length, ...protectedGames);
            filteredGames.splice(0, filteredGames.length, ...protectedGames);
        }
        
        // Save to localStorage
        localStorage.setItem('games', JSON.stringify(protectedGames));
        
        // Update displays
        loadAdminGames();
        if (typeof displayGames === 'function') {
            displayGames();
        }
        
        const removedCount = currentGames.length - protectedGames.length;
        showNotification(`Successfully removed ${removedCount} games! ${protectedGames.length} protected games remain.`, 'success');
        
    } catch (error) {
        showNotification('Error removing games. Please try again.', 'error');
        console.error('Remove all error:', error);
    }
}

// Close modal on outside click
document.addEventListener('click', function(event) {
    const modal = document.getElementById('editModal');
    if (event.target === modal) {
        closeEditModal();
    }
});

// Close modal on Escape key
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        const modal = document.getElementById('editModal');
        if (modal.style.display === 'flex') {
            closeEditModal();
        }
    }
});

// Debug function to check admin functionality
function debugAdminFunctions() {
    console.log('=== Admin Debug Info ===');
    console.log('isLoggedIn:', isLoggedIn);
    console.log('Games array:', getAllGames());
    console.log('LocalStorage games:', localStorage.getItem('games'));
    console.log('Window.games exists:', typeof window.games !== 'undefined');
    console.log('Global games exists:', typeof games !== 'undefined');
    
    // Test image type selector
    const imageTypeSelect = document.getElementById('editGameImageType');
    console.log('Edit image type selector found:', !!imageTypeSelect);
    
    // Test image groups
    const imageGroups = [
        'editEmojiGroup',
        'editUrlGroup', 
        'editUploadGroup',
        'editGalleryGroup',
        'editGenerateGroup'
    ];
    
    imageGroups.forEach(groupId => {
        const group = document.getElementById(groupId);
        console.log(`${groupId} found:`, !!group);
    });
}

// Enhanced remove game function with better error handling
function removeGameEnhanced(gameId) {
    try {
        const gameToRemove = getAllGames().find(game => game.id === gameId);
        
        // Prevent deletion of protected games
        if (gameToRemove && gameToRemove.protected) {
            throw new Error('Cannot delete protected games');
        }
        
        // Get current games
        let currentGames = getAllGames();
        currentGames = currentGames.filter(game => game.id !== gameId);
        
        // Update all references
        if (typeof window !== 'undefined') {
            window.games = currentGames;
            window.filteredGames = [...currentGames];
        }
        
        // Update main script variables if they exist
        if (typeof games !== 'undefined') {
            games.splice(0, games.length, ...currentGames);
            filteredGames.splice(0, filteredGames.length, ...currentGames);
        }
        
        // Save to localStorage
        localStorage.setItem('games', JSON.stringify(currentGames));
        
        // Update displays
        if (typeof displayGames === 'function') {
            displayGames();
        }
        
        return true;
    } catch (error) {
        console.error('Remove game error:', error);
        throw error;
    }
}

// Override the main removeGame function
function removeGame(gameId) {
    return removeGameEnhanced(gameId);
}

// Fix form reset issues
function resetAllForms() {
    // Reset add form
    const addForm = document.getElementById('addGameForm');
    if (addForm) addForm.reset();
    
    // Reset edit form  
    const editForm = document.getElementById('editGameForm');
    if (editForm) editForm.reset();
    
    // Reset image previews
    resetImagePreview();
    clearEditImagePreviews();
    
    // Reset image type selectors
    const addImageType = document.getElementById('gameImageType');
    const editImageType = document.getElementById('editGameImageType');
    
    if (addImageType) {
        addImageType.value = 'url';
        toggleImageInput();
    }
    
    if (editImageType) {
        editImageType.value = 'keep';
        toggleEditImageInput();
    }
    
    // Reset checkboxes
    const topGameCheckbox = document.getElementById('isTopGame');
    const editTopGameCheckbox = document.getElementById('editIsTopGame');
    if (topGameCheckbox) topGameCheckbox.checked = false;
    if (editTopGameCheckbox) editTopGameCheckbox.checked = false;
}

function resetImagePreview() {
    const preview = document.getElementById('imagePreview');
    if (preview) {
        preview.innerHTML = `
            <div class="upload-icon">📁</div>
            <span>Click here or drag & drop your image</span>
            <small>Supports: JPG, PNG, GIF, WebP (Max: 5MB)</small>
        `;
        preview.classList.remove('has-image');
    }
}

// Screenshot Upload Functions
let gameScreenshots = [];
let editGameScreenshots = [];

// Video Upload Functions
let gameVideos = [];
let editGameVideos = [];

// Trigger screenshot upload for add form
function triggerScreenshotUpload() {
    document.getElementById('gameScreenshots').click();
}

// Trigger screenshot upload for edit form
function triggerEditScreenshotUpload() {
    document.getElementById('editGameScreenshots').click();
}

// Handle screenshot upload for add form
function handleScreenshotUpload(input) {
    const files = Array.from(input.files);
    const maxFiles = 6;
    const maxSize = 2 * 1024 * 1024; // 2MB
    
    // Check total number of screenshots
    if (gameScreenshots.length + files.length > maxFiles) {
        showNotification(`You can only upload up to ${maxFiles} screenshots`, 'error');
        return;
    }
    
    // Process each file
    files.forEach(file => {
        // Validate file size
        if (file.size > maxSize) {
            showNotification(`Screenshot "${file.name}" is too large. Max size: 2MB`, 'error');
            return;
        }
        
        // Validate file type
        if (!file.type.startsWith('image/')) {
            showNotification(`"${file.name}" is not a valid image file`, 'error');
            return;
        }
        
        // Read file and add to array
        const reader = new FileReader();
        reader.onload = function(e) {
            const screenshot = {
                id: Date.now() + Math.random(),
                file: file,
                dataUrl: e.target.result,
                name: file.name
            };
            
            gameScreenshots.push(screenshot);
            updateScreenshotPreview();
        };
        reader.readAsDataURL(file);
    });
}

// Handle screenshot upload for edit form
function handleEditScreenshotUpload(input) {
    const files = Array.from(input.files);
    const maxFiles = 6;
    const maxSize = 2 * 1024 * 1024; // 2MB
    
    // Check total number of screenshots
    if (editGameScreenshots.length + files.length > maxFiles) {
        showNotification(`You can only upload up to ${maxFiles} screenshots`, 'error');
        return;
    }
    
    // Process each file
    files.forEach(file => {
        // Validate file size
        if (file.size > maxSize) {
            showNotification(`Screenshot "${file.name}" is too large. Max size: 2MB`, 'error');
            return;
        }
        
        // Validate file type
        if (!file.type.startsWith('image/')) {
            showNotification(`"${file.name}" is not a valid image file`, 'error');
            return;
        }
        
        // Read file and add to array
        const reader = new FileReader();
        reader.onload = function(e) {
            const screenshot = {
                id: Date.now() + Math.random(),
                file: file,
                dataUrl: e.target.result,
                name: file.name
            };
            
            editGameScreenshots.push(screenshot);
            updateEditScreenshotPreview();
        };
        reader.readAsDataURL(file);
    });
}

// Update screenshot preview for add form
function updateScreenshotPreview() {
    const preview = document.getElementById('screenshotsPreview');
    if (!preview) return;
    
    preview.innerHTML = gameScreenshots.map(screenshot => `
        <div class="screenshot-item">
            <img src="${screenshot.dataUrl}" alt="${screenshot.name}">
            <button class="screenshot-remove" onclick="removeScreenshot('${screenshot.id}')" title="Remove screenshot">
                ×
            </button>
        </div>
    `).join('');
}

// Update screenshot preview for edit form
function updateEditScreenshotPreview() {
    const preview = document.getElementById('editScreenshotsPreview');
    if (!preview) return;
    
    preview.innerHTML = editGameScreenshots.map(screenshot => `
        <div class="screenshot-item">
            <img src="${screenshot.dataUrl}" alt="${screenshot.name}">
            <button class="screenshot-remove" onclick="removeEditScreenshot('${screenshot.id}')" title="Remove screenshot">
                ×
            </button>
        </div>
    `).join('');
}

// Remove screenshot from add form
function removeScreenshot(screenshotId) {
    gameScreenshots = gameScreenshots.filter(screenshot => screenshot.id !== screenshotId);
    updateScreenshotPreview();
    showNotification('Screenshot removed', 'success');
}

// Remove screenshot from edit form
function removeEditScreenshot(screenshotId) {
    editGameScreenshots = editGameScreenshots.filter(screenshot => screenshot.id !== screenshotId);
    updateEditScreenshotPreview();
    showNotification('Screenshot removed', 'success');
}

// Display current screenshots in edit modal
function displayCurrentScreenshots(screenshots) {
    const container = document.getElementById('currentScreenshotsGrid');
    if (!container) return;
    
    if (!screenshots || screenshots.length === 0) {
        container.innerHTML = '<p style="color: var(--text-muted); text-align: center; padding: 20px;">No screenshots available</p>';
        return;
    }
    
    container.innerHTML = screenshots.map((screenshot, index) => `
        <div class="current-screenshot-item">
            <img src="${screenshot}" alt="Screenshot ${index + 1}">
            <button class="current-screenshot-remove" onclick="removeCurrentScreenshot(${index})" title="Remove screenshot">
                ×
            </button>
        </div>
    `).join('');
}

// Remove current screenshot from game
function removeCurrentScreenshot(index) {
    const gameId = parseInt(document.getElementById('editGameId').value);
    const games = getAllGames();
    const game = games.find(g => parseInt(g.id) === gameId);
    
    if (game && game.screenshots) {
        game.screenshots.splice(index, 1);
        updateGameData(gameId, { screenshots: game.screenshots });
        displayCurrentScreenshots(game.screenshots);
        showNotification('Screenshot removed', 'success');
    }
}

// Clear screenshots for forms
function clearScreenshots() {
    gameScreenshots = [];
    editGameScreenshots = [];
    updateScreenshotPreview();
    updateEditScreenshotPreview();
    
    // Clear file inputs
    const addInput = document.getElementById('gameScreenshots');
    const editInput = document.getElementById('editGameScreenshots');
    if (addInput) addInput.value = '';
    if (editInput) editInput.value = '';
}

// Video Upload Functions

// Extract video ID and platform from URL
function extractVideoInfo(url) {
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const vimeoRegex = /vimeo\.com\/(?:video\/)?(\d+)/;
    
    let match = url.match(youtubeRegex);
    if (match) {
        return {
            platform: 'youtube',
            id: match[1],
            embedUrl: `https://www.youtube.com/embed/${match[1]}`,
            thumbnailUrl: `https://img.youtube.com/vi/${match[1]}/mqdefault.jpg`
        };
    }
    
    match = url.match(vimeoRegex);
    if (match) {
        return {
            platform: 'vimeo',
            id: match[1],
            embedUrl: `https://player.vimeo.com/video/${match[1]}`,
            thumbnailUrl: `https://vumbnail.com/${match[1]}.jpg`
        };
    }
    
    return null;
}

// Preview video URL (add form)
function previewVideo() {
    const input = document.getElementById('videoUrlInput');
    const url = input.value.trim();
    
    if (!url) return;
    
    const videoInfo = extractVideoInfo(url);
    if (!videoInfo) {
        showNotification('Invalid video URL. Please use YouTube or Vimeo links.', 'error');
        return;
    }
    
    // Visual feedback that URL is valid
    input.style.borderColor = '#10b981';
    setTimeout(() => {
        input.style.borderColor = '';
    }, 1000);
}

// Preview video URL (edit form)
function previewEditVideo() {
    const input = document.getElementById('editVideoUrlInput');
    const url = input.value.trim();
    
    if (!url) return;
    
    const videoInfo = extractVideoInfo(url);
    if (!videoInfo) {
        showNotification('Invalid video URL. Please use YouTube or Vimeo links.', 'error');
        return;
    }
    
    // Visual feedback that URL is valid
    input.style.borderColor = '#10b981';
    setTimeout(() => {
        input.style.borderColor = '';
    }, 1000);
}

// Add video URL (add form)
function addVideoUrl() {
    const input = document.getElementById('videoUrlInput');
    const url = input.value.trim();
    
    if (!url) {
        showNotification('Please enter a video URL', 'error');
        return;
    }
    
    if (gameVideos.length >= 3) {
        showNotification('You can only add up to 3 videos', 'error');
        return;
    }
    
    const videoInfo = extractVideoInfo(url);
    if (!videoInfo) {
        showNotification('Invalid video URL. Please use YouTube or Vimeo links.', 'error');
        return;
    }
    
    // Check for duplicates
    if (gameVideos.some(video => video.url === url)) {
        showNotification('This video has already been added', 'error');
        return;
    }
    
    const video = {
        id: Date.now() + Math.random(),
        url: url,
        platform: videoInfo.platform,
        videoId: videoInfo.id,
        embedUrl: videoInfo.embedUrl,
        thumbnailUrl: videoInfo.thumbnailUrl,
        title: `${videoInfo.platform.charAt(0).toUpperCase() + videoInfo.platform.slice(1)} Video`
    };
    
    gameVideos.push(video);
    updateVideoPreview();
    input.value = '';
    showNotification('Video added successfully!', 'success');
}

// Add video URL (edit form)
function addEditVideoUrl() {
    const input = document.getElementById('editVideoUrlInput');
    const url = input.value.trim();
    
    if (!url) {
        showNotification('Please enter a video URL', 'error');
        return;
    }
    
    if (editGameVideos.length >= 3) {
        showNotification('You can only add up to 3 videos', 'error');
        return;
    }
    
    const videoInfo = extractVideoInfo(url);
    if (!videoInfo) {
        showNotification('Invalid video URL. Please use YouTube or Vimeo links.', 'error');
        return;
    }
    
    // Check for duplicates
    if (editGameVideos.some(video => video.url === url)) {
        showNotification('This video has already been added', 'error');
        return;
    }
    
    const video = {
        id: Date.now() + Math.random(),
        url: url,
        platform: videoInfo.platform,
        videoId: videoInfo.id,
        embedUrl: videoInfo.embedUrl,
        thumbnailUrl: videoInfo.thumbnailUrl,
        title: `${videoInfo.platform.charAt(0).toUpperCase() + videoInfo.platform.slice(1)} Video`
    };
    
    editGameVideos.push(video);
    updateEditVideoPreview();
    input.value = '';
    showNotification('Video added successfully!', 'success');
}

// Update video preview (add form)
function updateVideoPreview() {
    const preview = document.getElementById('videosPreview');
    if (!preview) return;
    
    preview.innerHTML = gameVideos.map(video => `
        <div class="video-item">
            <iframe class="video-embed" src="${video.embedUrl}" frameborder="0" allowfullscreen></iframe>
            <div class="video-info">
                <div class="video-title">${video.title}</div>
                <div class="video-url">${video.url}</div>
            </div>
            <button class="video-remove" onclick="removeVideo('${video.id}')" title="Remove video">
                ×
            </button>
        </div>
    `).join('');
}

// Update video preview (edit form)
function updateEditVideoPreview() {
    const preview = document.getElementById('editVideosPreview');
    if (!preview) return;
    
    preview.innerHTML = editGameVideos.map(video => `
        <div class="video-item">
            <iframe class="video-embed" src="${video.embedUrl}" frameborder="0" allowfullscreen></iframe>
            <div class="video-info">
                <div class="video-title">${video.title}</div>
                <div class="video-url">${video.url}</div>
            </div>
            <button class="video-remove" onclick="removeEditVideo('${video.id}')" title="Remove video">
                ×
            </button>
        </div>
    `).join('');
}

// Remove video (add form)
function removeVideo(videoId) {
    gameVideos = gameVideos.filter(video => video.id !== videoId);
    updateVideoPreview();
    showNotification('Video removed', 'success');
}

// Remove video (edit form)
function removeEditVideo(videoId) {
    editGameVideos = editGameVideos.filter(video => video.id !== videoId);
    updateEditVideoPreview();
    showNotification('Video removed', 'success');
}

// Display current videos in edit modal
function displayCurrentVideos(videos) {
    const container = document.getElementById('currentVideosGrid');
    if (!container) return;
    
    if (!videos || videos.length === 0) {
        container.innerHTML = '<p style="color: var(--text-muted); text-align: center; padding: 20px;">No videos available</p>';
        return;
    }
    
    container.innerHTML = videos.map((video, index) => `
        <div class="current-video-item">
            <iframe class="video-embed" src="${video.embedUrl || video.url}" frameborder="0" allowfullscreen></iframe>
            <div class="video-info">
                <div class="video-title">${video.title || 'Video ' + (index + 1)}</div>
                <div class="video-url">${video.url}</div>
            </div>
            <button class="current-video-remove" onclick="removeCurrentVideo(${index})" title="Remove video">
                ×
            </button>
        </div>
    `).join('');
}

// Remove current video from game
function removeCurrentVideo(index) {
    const gameId = parseInt(document.getElementById('editGameId').value);
    const games = getAllGames();
    const game = games.find(g => parseInt(g.id) === gameId);
    
    if (game && game.videos) {
        game.videos.splice(index, 1);
        updateGameData(gameId, { videos: game.videos });
        displayCurrentVideos(game.videos);
        showNotification('Video removed', 'success');
    }
}

// Clear videos for forms
function clearVideos() {
    gameVideos = [];
    editGameVideos = [];
    updateVideoPreview();
    updateEditVideoPreview();
    
    // Clear video inputs
    const addInput = document.getElementById('videoUrlInput');
    const editInput = document.getElementById('editVideoUrlInput');
    if (addInput) addInput.value = '';
    if (editInput) editInput.value = '';
}

// Add to window for debugging
if (typeof window !== 'undefined') {
    window.debugAdminFunctions = debugAdminFunctions;
    window.resetAllForms = resetAllForms;
    window.clearScreenshots = clearScreenshots;
    window.clearVideos = clearVideos;
}

// Utility function (ensure it's available)
if (typeof capitalizeFirst === 'undefined') {
    function capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
}