// Game data storage (in real app, this would be a database)
let games = [];

let filteredGames = [...games];

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    displayGames();
    loadGamesFromStorage();
    initializeTheme();
    displayTopGames();
    initializeTopGamesSlider();
});

// Dark mode functionality
function initializeTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    const themeIcon = document.querySelector('.theme-toggle-icon');
    const mobileThemeIcon = document.querySelector('.mobile-theme-icon');
    
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    // Update desktop theme icon
    if (themeIcon) {
        themeIcon.textContent = savedTheme === 'dark' ? '☀️' : '🌙';
    }
    
    // Update mobile theme icon
    if (mobileThemeIcon) {
        mobileThemeIcon.textContent = savedTheme === 'dark' ? '☀️' : '🌙';
    }
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    const themeIcon = document.querySelector('.theme-toggle-icon');
    const mobileThemeIcon = document.querySelector('.mobile-theme-icon');
    
    // Add loading animation
    const toggleBtn = document.querySelector('.theme-toggle');
    const mobileToggleBtn = document.querySelector('.mobile-theme-toggle');
    
    if (toggleBtn) {
        toggleBtn.style.transform = 'scale(0.9)';
    }
    if (mobileToggleBtn) {
        mobileToggleBtn.style.transform = 'scale(0.9)';
    }
    
    setTimeout(() => {
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        
        // Update desktop theme icon
        if (themeIcon) {
            themeIcon.textContent = newTheme === 'dark' ? '☀️' : '🌙';
        }
        
        // Update mobile theme icon
        if (mobileThemeIcon) {
            mobileThemeIcon.textContent = newTheme === 'dark' ? '☀️' : '🌙';
        }
        
        if (toggleBtn) {
            toggleBtn.style.transform = 'scale(1)';
        }
        if (mobileToggleBtn) {
            mobileToggleBtn.style.transform = 'scale(1)';
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
        
        // Add ripple effect to whichever button was clicked
        const activeBtn = toggleBtn && toggleBtn.style.transform ? toggleBtn : mobileToggleBtn;
        if (activeBtn) {
            createRippleEffect(activeBtn);
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

// Load games from localStorage if available
function loadGamesFromStorage() {
    const storedGames = localStorage.getItem('games');
    if (storedGames) {
        games = JSON.parse(storedGames);
        filteredGames = [...games];
        displayGames();
    }
}

// Save games to localStorage
function saveGamesToStorage() {
    localStorage.setItem('games', JSON.stringify(games));
}

// Display games in the grid
function displayGames() {
    const gamesGrid = document.getElementById('gamesGrid');
    const noGames = document.getElementById('noGames');
    
    if (!gamesGrid) return;

    if (filteredGames.length === 0) {
        gamesGrid.style.display = 'none';
        noGames.style.display = 'block';
        return;
    }

    gamesGrid.style.display = 'grid';
    noGames.style.display = 'none';
    
    gamesGrid.innerHTML = filteredGames.map(game => `
        <div class="game-card" onclick="openGameModal(${game.id})">
            <div class="game-image">
                ${renderGameImage(game)}
            </div>
            <div class="game-info">
                <h3 class="game-title">${game.title}</h3>
                <div class="game-size">Size: ${game.size}</div>
                <div class="game-hover-text">Click for more details</div>
            </div>
        </div>
    `).join('');
}

// Render game image based on type
function renderGameImage(game) {
    if (game.imageType === 'url' && game.image) {
        return `<img src="${game.image}" alt="${game.title}" onerror="this.parentElement.innerHTML='<div class=\\"game-image-placeholder\\">🎮</div>'">`;
    } else if (game.imageType === 'upload' && game.image) {
        return `<img src="${game.image}" alt="${game.title}">`;
    } else {
        return `<div class="game-image-placeholder">${game.image || '🎮'}</div>`;
    }
}

// Search functionality
function searchGames() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const categoryFilter = document.getElementById('categoryFilter').value;
    
    filteredGames = games.filter(game => {
        const matchesSearch = game.title.toLowerCase().includes(searchTerm) || 
                            game.description.toLowerCase().includes(searchTerm);
        const matchesCategory = categoryFilter === '' || game.category === categoryFilter;
        
        return matchesSearch && matchesCategory;
    });
    
    displayGames();
}

// Filter by category
function filterByCategory() {
    searchGames(); // This will apply both search and category filters
}

// Smooth scroll to games section
function scrollToGames() {
    document.getElementById('games').scrollIntoView({ 
        behavior: 'smooth' 
    });
}

// Smooth scroll to home section
function scrollToHome() {
    document.getElementById('home').scrollIntoView({ 
        behavior: 'smooth' 
    });
}

// Admin access functionality
let logoClickCount = 0;
let logoClickTimeout = null;

function handleLogoClick() {
    // Always scroll to home first
    scrollToHome();
    
    // Increment click counter
    logoClickCount++;
    
    // Clear existing timeout
    if (logoClickTimeout) {
        clearTimeout(logoClickTimeout);
    }
    
    // Check if we've reached 5 clicks
    if (logoClickCount >= 5) {
        showAdminAccess();
        logoClickCount = 0; // Reset counter
        return;
    }
    
    // Reset counter after 3 seconds of no clicks
    logoClickTimeout = setTimeout(() => {
        logoClickCount = 0;
    }, 3000);
}

function showAdminAccess() {
    const adminLink = document.getElementById('adminLink');
    if (adminLink) {
        adminLink.style.display = 'inline-block';
        
        // Add a subtle animation to indicate it appeared
        adminLink.style.opacity = '0';
        adminLink.style.transition = 'opacity 0.5s ease-in-out';
        
        setTimeout(() => {
            adminLink.style.opacity = '1';
        }, 10);
        
        // Show a brief notification
        showSecretAccessNotification();
        
        // Hide the admin link again after 30 seconds for security
        setTimeout(() => {
            adminLink.style.transition = 'opacity 0.5s ease-in-out';
            adminLink.style.opacity = '0';
            setTimeout(() => {
                adminLink.style.display = 'none';
            }, 500);
        }, 30000);
    }
}

function showSecretAccessNotification() {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 500;
        z-index: 10000;
        box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        opacity: 0;
        transform: translateX(100%);
        transition: all 0.3s ease-in-out;
    `;
    notification.textContent = '🔓 Admin access unlocked!';
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';
    }, 10);
    
    // Animate out and remove
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Download game function
function downloadGame(gameTitle) {
    // Prevent any default behavior
    event.preventDefault();
    event.stopPropagation();
    
    // Track download for analytics
    console.log(`Download initiated for: ${gameTitle}`);
    
    // Find the game to get its download URL
    const game = games.find(g => g.title === gameTitle);
    if (game && game.downloadUrl && game.downloadUrl !== '#') {
        // Open the download URL in the same tab
        window.location.href = game.downloadUrl;
    }
}

// Add new game (used by admin panel)
function addGame(gameData) {
    // Ensure all existing games have valid IDs
    const validIds = games.map(g => parseInt(g.id)).filter(id => !isNaN(id));
    const newId = validIds.length > 0 ? Math.max(...validIds) + 1 : 1;
    
    const newGame = {
        id: newId,
        ...gameData
    };
    
    games.push(newGame);
    filteredGames = [...games];
    saveGamesToStorage();
    displayGames();
    
    return newGame;
}

// Remove game (used by admin panel)
function removeGame(gameId) {
    games = games.filter(game => game.id !== gameId);
    filteredGames = [...games];
    saveGamesToStorage();
    displayGames();
}

// Get all games (used by admin panel)
function getAllGames() {
    return [...games];
}

// Utility function to capitalize first letter
function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// Mobile menu functionality
function toggleMobileMenu() {
    const navLinks = document.getElementById('navLinks');
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    
    navLinks.classList.toggle('active');
    
    // Animate menu button
    if (navLinks.classList.contains('active')) {
        menuToggle.innerHTML = '✕';
        menuToggle.style.transform = 'rotate(180deg)';
    } else {
        menuToggle.innerHTML = '☰';
        menuToggle.style.transform = 'rotate(0deg)';
    }
}

function closeMobileMenu() {
    const navLinks = document.getElementById('navLinks');
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    
    navLinks.classList.remove('active');
    menuToggle.innerHTML = '☰';
    menuToggle.style.transform = 'rotate(0deg)';
}

// Close mobile menu when clicking outside
document.addEventListener('click', function(event) {
    const navLinks = document.getElementById('navLinks');
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    const navContainer = document.querySelector('.nav-container');
    
    if (navLinks && navLinks.classList.contains('active')) {
        if (!navContainer.contains(event.target)) {
            closeMobileMenu();
        }
    }
});

// Enhanced scroll handling
window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar');
    const scrollProgress = document.getElementById('scrollProgress');
    const scrollToTopBtn = document.getElementById('scrollToTop');
    
    // Navbar background change - respect theme
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    
    if (window.scrollY > 100) {
        // Scrolled state - more transparent
        if (currentTheme === 'dark') {
            navbar.style.background = 'rgba(26, 32, 44, 0.95)';
        } else {
            navbar.style.background = 'rgba(102, 126, 234, 0.95)';
        }
        navbar.style.backdropFilter = 'blur(15px)';
    } else {
        // Top state - use CSS variables
        navbar.style.background = '';
        navbar.style.backdropFilter = '';
    }
    
    // Scroll progress indicator
    if (scrollProgress) {
        const scrollTop = window.pageYOffset;
        const docHeight = document.body.scrollHeight - window.innerHeight;
        const scrollPercent = (scrollTop / docHeight) * 100;
        scrollProgress.style.width = Math.min(scrollPercent, 100) + '%';
    }
    
    // Show/hide scroll to top button
    if (scrollToTopBtn) {
        if (window.scrollY > 300) {
            scrollToTopBtn.classList.add('visible');
        } else {
            scrollToTopBtn.classList.remove('visible');
        }
    }
});

// Scroll to top function
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Enhanced animations with Intersection Observer
function initializeAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe game cards for animations
    const gameCards = document.querySelectorAll('.game-card');
    gameCards.forEach(card => {
        observer.observe(card);
    });
}

// Initialize animations when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(initializeAnimations, 100);
});

// Add loading states
function showLoadingState() {
    const gamesGrid = document.getElementById('gamesGrid');
    if (gamesGrid) {
        gamesGrid.innerHTML = Array.from({length: 6}, () => `
            <div class="game-card loading-shimmer" style="height: 400px;">
            </div>
        `).join('');
    }
}

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add some smooth animations
function addLoadingAnimation() {
    const gameCards = document.querySelectorAll('.game-card');
    gameCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 100);
    });
}

// Call animation after games are displayed
const originalDisplayGames = displayGames;
displayGames = function() {
    originalDisplayGames();
    setTimeout(addLoadingAnimation, 50);
};

// Game Modal Functions
let currentModalGame = null;

function openGameModal(gameId) {
    const game = games.find(g => g.id === gameId);
    if (!game) return;
    
    currentModalGame = game;
    
    // Populate modal with game data
    document.getElementById('modalGameTitle').textContent = game.title;
    document.getElementById('modalGameCategory').textContent = capitalizeFirst(game.category);
    document.getElementById('modalGameSize').textContent = game.size;
    document.getElementById('modalGameDescription').textContent = game.description || 'No description available.';
    
    // Populate additional info (if available in game data)
    document.getElementById('modalGameDeveloper').textContent = game.developer || 'Unknown Developer';
    document.getElementById('modalGameReleaseDate').textContent = game.releaseDate || 'TBA';
    
    // Populate system requirements (if available)
    document.getElementById('modalMinOS').textContent = game.minOS || 'Windows 10';
    document.getElementById('modalMinProcessor').textContent = game.minProcessor || 'Intel i3 or equivalent';
    document.getElementById('modalMinMemory').textContent = game.minMemory || '4 GB RAM';
    document.getElementById('modalMinGraphics').textContent = game.minGraphics || 'DirectX 11 compatible';
    document.getElementById('modalMinStorage').textContent = game.minStorage || game.size;
    
    document.getElementById('modalRecOS').textContent = game.recOS || 'Windows 11';
    document.getElementById('modalRecProcessor').textContent = game.recProcessor || 'Intel i5 or equivalent';
    document.getElementById('modalRecMemory').textContent = game.recMemory || '8 GB RAM';
    document.getElementById('modalRecGraphics').textContent = game.recGraphics || 'GTX 1060 or equivalent';
    document.getElementById('modalRecStorage').textContent = game.recStorage || 'SSD recommended';
    
    // Set game image
    const modalImage = document.getElementById('modalGameImage');
    modalImage.innerHTML = renderGameImage(game);
    
    // Populate screenshots if available
    const screenshotsContainer = document.getElementById('modalScreenshots');
    if (game.screenshots && game.screenshots.length > 0) {
        screenshotsContainer.innerHTML = game.screenshots.map(screenshot => 
            `<img src="${screenshot}" alt="Screenshot" class="screenshot-img">`
        ).join('');
    } else {
        screenshotsContainer.innerHTML = '<p class="no-screenshots">No screenshots available</p>';
    }
    
    // Show modal
    const modal = document.getElementById('gameModal');
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    
    // Add fade-in animation
    setTimeout(() => {
        modal.classList.add('modal-active');
    }, 10);
}

function closeGameModal() {
    const modal = document.getElementById('gameModal');
    modal.classList.remove('modal-active');
    
    setTimeout(() => {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        currentModalGame = null;
    }, 300);
}

function downloadGameFromModal() {
    if (currentModalGame) {
        downloadGame(currentModalGame.title);
    }
}

// Close modal when clicking outside
document.addEventListener('click', function(event) {
    const modal = document.getElementById('gameModal');
    if (event.target === modal) {
        closeGameModal();
    }
});

// Close modal with Escape key
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeGameModal();
    }
});

// Top Games Slider Functionality
let currentSlideIndex = 0;
let topGamesSlides = [];
let sliderInterval;

// Display top games in slider
function displayTopGames() {
    const topGames = games.filter(game => game.isTopGame);
    
    if (topGames.length === 0) {
        // Hide the top games section if no top games
        const topGamesSection = document.getElementById('topGames');
        if (topGamesSection) {
            topGamesSection.style.display = 'none';
        }
        return;
    }

    // Show the top games section
    const topGamesSection = document.getElementById('topGames');
    if (topGamesSection) {
        topGamesSection.style.display = 'block';
    }

    // Group games into slides (3 games per slide on desktop, 1 on mobile)
    const gamesPerSlide = window.innerWidth <= 768 ? 1 : 3;
    topGamesSlides = [];
    
    for (let i = 0; i < topGames.length; i += gamesPerSlide) {
        topGamesSlides.push(topGames.slice(i, i + gamesPerSlide));
    }

    const sliderContainer = document.getElementById('topGamesSlider');
    if (!sliderContainer) return;

    sliderContainer.innerHTML = topGamesSlides.map((slide, slideIndex) => `
        <div class="top-game-slide">
            ${slide.map(game => `
                <div class="top-game-card" onclick="openGameModal(${game.id})">
                    <div class="top-game-badge">🏆 TOP</div>
                    <div class="top-game-image">
                        ${renderTopGameImage(game)}
                    </div>
                    <div class="top-game-info">
                        <h3 class="top-game-title">${game.title}</h3>
                        <div class="top-game-category">${capitalizeFirst(game.category)}</div>
                        <p class="top-game-description">${game.description}</p>
                        <div class="top-game-size">Size: ${game.size}</div>
                    </div>
                </div>
            `).join('')}
        </div>
    `).join('');

    // Generate indicators
    generateSliderIndicators();
    updateSliderPosition();
}

// Render top game image
function renderTopGameImage(game) {
    if (game.imageType === 'url' && game.image) {
        return `<img src="${game.image}" alt="${game.title}" onerror="this.parentElement.innerHTML='<div class=\\\"top-game-image-placeholder\\\">🎮</div>'">`;
    } else if (game.imageType === 'upload' && game.image) {
        return `<img src="${game.image}" alt="${game.title}">`;
    } else {
        return `<div class="top-game-image-placeholder">${game.image || '🎮'}</div>`;
    }
}

// Generate slider indicators
function generateSliderIndicators() {
    const indicatorsContainer = document.getElementById('sliderIndicators');
    if (!indicatorsContainer) return;

    indicatorsContainer.innerHTML = topGamesSlides.map((_, index) => `
        <div class="slider-indicator ${index === currentSlideIndex ? 'active' : ''}" 
             onclick="goToSlide(${index})">
        </div>
    `).join('');
}

// Update slider position
function updateSliderPosition() {
    const sliderContainer = document.getElementById('topGamesSlider');
    if (!sliderContainer) return;

    const translateX = -currentSlideIndex * 100;
    sliderContainer.style.transform = `translateX(${translateX}%)`;

    // Update indicators
    const indicators = document.querySelectorAll('.slider-indicator');
    indicators.forEach((indicator, index) => {
        indicator.classList.toggle('active', index === currentSlideIndex);
    });

    // Handle navigation buttons
    const prevBtn = document.getElementById('sliderPrev');
    const nextBtn = document.getElementById('sliderNext');
    
    if (prevBtn) prevBtn.style.opacity = currentSlideIndex === 0 ? '0.5' : '1';
    if (nextBtn) nextBtn.style.opacity = currentSlideIndex === topGamesSlides.length - 1 ? '0.5' : '1';
}

// Slide navigation
function slideTopGames(direction) {
    if (topGamesSlides.length === 0) return;

    if (direction === 'next' && currentSlideIndex < topGamesSlides.length - 1) {
        currentSlideIndex++;
    } else if (direction === 'prev' && currentSlideIndex > 0) {
        currentSlideIndex--;
    } else if (direction === 'next' && currentSlideIndex === topGamesSlides.length - 1) {
        // Loop to first slide
        currentSlideIndex = 0;
    } else if (direction === 'prev' && currentSlideIndex === 0) {
        // Loop to last slide
        currentSlideIndex = topGamesSlides.length - 1;
    }

    updateSliderPosition();
    resetSliderTimer();
}

// Go to specific slide
function goToSlide(slideIndex) {
    if (slideIndex >= 0 && slideIndex < topGamesSlides.length) {
        currentSlideIndex = slideIndex;
        updateSliderPosition();
        resetSliderTimer();
    }
}

// Initialize auto-play timer
function initializeTopGamesSlider() {
    // Start auto-play if there are multiple slides
    if (topGamesSlides.length > 1) {
        startSliderTimer();
    }

    // Pause on hover
    const sliderContainer = document.getElementById('topGamesSlider');
    if (sliderContainer) {
        sliderContainer.addEventListener('mouseenter', pauseSliderTimer);
        sliderContainer.addEventListener('mouseleave', startSliderTimer);
    }
}

// Auto-play timer functions
function startSliderTimer() {
    if (topGamesSlides.length <= 1) return;
    
    sliderInterval = setInterval(() => {
        slideTopGames('next');
    }, 5000); // 5 seconds
}

function pauseSliderTimer() {
    if (sliderInterval) {
        clearInterval(sliderInterval);
    }
}

function resetSliderTimer() {
    pauseSliderTimer();
    startSliderTimer();
}

// Handle window resize for responsive slider
window.addEventListener('resize', function() {
    // Recalculate slides on resize
    displayTopGames();
    currentSlideIndex = 0;
});

// Update the original displayGames to also refresh top games
const originalDisplayGamesFunction = displayGames;
displayGames = function() {
    originalDisplayGamesFunction();
    displayTopGames(); // Update top games when games change
    setTimeout(addLoadingAnimation, 50);
};