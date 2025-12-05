// public/js/common/layout.js - VERSION AVEC NAVBAR TC POUSSAN

document.addEventListener('DOMContentLoaded', function() {
    console.log('Chargement de la sidebar et navbar...');
    
    const sidebar = document.getElementById('sidebar');
    const burgerBtn = document.getElementById('burgerBtn');
    const frame = document.getElementById('frame');
    
    // Charger la navbar ET la sidebar
    loadNavbar();
    
    if (sidebar) {
        loadSidebar();
    }
    
    // Gestion du burger menu
    if (burgerBtn) {
        burgerBtn.addEventListener('click', function() {
            if (window.innerWidth <= 768) {
                sidebar.classList.toggle('open');
                const overlay = document.querySelector('.sidebar-overlay');
                if (overlay) {
                    overlay.classList.toggle('show');
                }
            } else {
                sidebar.classList.toggle('closed');
                frame.classList.toggle('sidebar-closed');
            }
        });
    }

    // Fermer sidebar sur mobile en cliquant sur overlay
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('sidebar-overlay')) {
            sidebar.classList.remove('open');
            e.target.classList.remove('show');
        }
    });

    // ===== NOUVELLE FONCTION : CHARGER LA NAVBAR ===== 
    async function loadNavbar() {
        try {
            const navbar = document.querySelector('.navbar');
            if (navbar) {
                const response = await fetch('../components/navbar.html');
                const content = await response.text();
                navbar.outerHTML = content;
                console.log('Navbar TC Poussan chargée ! ');
                
                // Ré-attacher les événements après chargement
                setTimeout(() => {
                    const newBurgerBtn = document.getElementById('burgerBtn');
                    if (newBurgerBtn && !newBurgerBtn.hasAttribute('data-listener')) {
                        newBurgerBtn.setAttribute('data-listener', 'true');
                        newBurgerBtn.addEventListener('click', function() {
                            if (window.innerWidth <= 768) {
                                sidebar.classList.toggle('open');
                                const overlay = document.querySelector('.sidebar-overlay');
                                if (overlay) {
                                    overlay.classList.toggle('show');
                                }
                            } else {
                                sidebar.classList.toggle('closed');
                                frame.classList.toggle('sidebar-closed');
                            }
                        });
                    }
                }, 100);
            }
        } catch (error) {
            console.error('Erreur lors du chargement de la navbar:', error);
        }
    }

    async function loadSidebar() {
        try {
            const response = await fetch('../components/sidebar.html');
            const content = await response.text();
            sidebar.innerHTML = content;
            
            // Définir les menus SANS sous-menus
            setupSimpleNavigation();
            
            console.log('Sidebar chargée !');
        } catch (error) {
            console.error('Erreur lors du chargement de la sidebar:', error);
            // Fallback : créer la sidebar directement
            createFallbackSidebar();
        }
    }

    function setupSimpleNavigation() {
        // Créer le menu simple SANS sous-menus
        const menuData = [
            { icon: '📊', text: 'Tableau de bord', href: '../index.html' },
            { icon: '📅', text: 'Événements', href: '../events/list.html' },
            { icon: '👥', text: 'Participants', href: '../attendees/list.html' },
            { icon: '📍', text: 'Lieux', href: '../locations/list.html' },
            { icon: '🏷️', text: 'Catégories', href: '../categories/list.html' },
            { icon: '🗓️', text: 'Calendrier', href: '../calendar.html' }
        ];

        // Si le contenu de sidebar.html est déjà bon, on garde
        // Sinon on reconstruit
        const existingNavItems = sidebar.querySelectorAll('.nav-item');
        if (existingNavItems.length === 0) {
            // Reconstruire la sidebar
            createSimpleSidebar(menuData);
        }

        // Marquer l'élément actif
        highlightActiveMenuItem();
    }

    function createSimpleSidebar(menuData) {
        sidebar.innerHTML = `
            <div class="sidebar-header">
                <h3>🎛️ Menu Principal</h3>
            </div>
            <nav class="sidebar-nav">
                ${menuData.map(item => `
                    <a href="${item.href}" class="nav-item">
                        <span class="nav-icon">${item.icon}</span>
                        <span class="nav-text">${item.text}</span>
                    </a>
                `).join('')}
            </nav>
            <div class="sidebar-footer">
                <div class="sidebar-footer-text">
                    <span>🎾 TC Poussan</span>
                    <small>v2.0</small>
                </div>
            </div>
        `;
    }

    function createFallbackSidebar() {
        sidebar.innerHTML = `
            <ul class="sidebar-menu">
                <li class="sidebar-item">
                    <a href="../index.html" class="sidebar-link">
                        <span><span class="sidebar-icon">📊</span>Tableau de bord</span>
                    </a>
                </li>
                <li class="sidebar-item">
                    <a href="../events/list.html" class="sidebar-link">
                        <span><span class="sidebar-icon">📅</span>Événements</span>
                    </a>
                </li>
                <li class="sidebar-item">
                    <a href="../attendees/list.html" class="sidebar-link">
                        <span><span class="sidebar-icon">👥</span>Participants</span>
                    </a>
                </li>
                <li class="sidebar-item">
                    <a href="../locations/list.html" class="sidebar-link">
                        <span><span class="sidebar-icon">📍</span>Lieux</span>
                    </a>
                </li>
                <li class="sidebar-item">
                    <a href="../categories/list.html" class="sidebar-link">
                        <span><span class="sidebar-icon">🏷️</span>Catégories</span>
                    </a>
                </li>
                <li class="sidebar-item">
                    <a href="../calendar.html" class="sidebar-link">
                        <span><span class="sidebar-icon">🗓️</span>Calendrier</span>
                    </a>
                </li>
            </ul>
        `;
        
        highlightActiveMenuItem();
    }

    function highlightActiveMenuItem() {
        const currentPath = window.location.pathname;
        const links = sidebar.querySelectorAll('a');
        
        links.forEach(link => {
            link.classList.remove('active');
            const href = link.getAttribute('href');
            if (href && currentPath.includes(href.replace('../', ''))) {
                link.classList.add('active');
            }
        });
    }
});