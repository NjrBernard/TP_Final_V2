// public/js/common/layout.js - VERSION DE TEST
document.addEventListener('DOMContentLoaded', async function() {
    const sidebar = document.getElementById('sidebar');
    
    console.log('Chargement de la sidebar...');
    
    // Version de test avec HTML directement
    sidebar.innerHTML = `
        <nav>
            <ul class="sidebar-menu">
                <li class="sidebar-item">
                    <a href="#" class="sidebar-link" data-section="events">
                        <span><span class="sidebar-icon">📅</span>Événements</span>
                        <span class="sidebar-arrow">▶</span>
                    </a>
                    <ul class="sidebar-submenu">
                        <li><a href="../events/list.html" class="sidebar-sublink">📋 Afficher</a></li>
                        <li><a href="../events/create.html" class="sidebar-sublink">➕ Créer</a></li>
                        <li><a href="../events/list.html" class="sidebar-sublink">✏️ Modifier</a></li>
                        <li><a href="../events/list.html" class="sidebar-sublink">🗑️ Supprimer</a></li>
                    </ul>
                </li>
                <li class="sidebar-item">
                    <a href="#" class="sidebar-link" data-section="locations">
                        <span><span class="sidebar-icon">📍</span>Lieux</span>
                        <span class="sidebar-arrow">▶</span>
                    </a>
                    <ul class="sidebar-submenu">
                        <li><a href="../locations/list.html" class="sidebar-sublink">📋 Afficher</a></li>
                        <li><a href="../locations/create.html" class="sidebar-sublink">➕ Créer</a></li>
                        <li><a href="../locations/list.html" class="sidebar-sublink">✏️ Modifier</a></li>
                        <li><a href="../locations/list.html" class="sidebar-sublink">🗑️ Supprimer</a></li>
                    </ul>
                </li>
                <li class="sidebar-item">
                    <a href="#" class="sidebar-link" data-section="attendees">
                        <span><span class="sidebar-icon">👥</span>Participants</span>
                        <span class="sidebar-arrow">▶</span>
                    </a>
                    <ul class="sidebar-submenu">
                        <li><a href="../attendees/list.html" class="sidebar-sublink">📋 Afficher</a></li>
                        <li><a href="../attendees/create.html" class="sidebar-sublink">➕ Créer</a></li>
                        <li><a href="../attendees/list.html" class="sidebar-sublink">✏️ Modifier</a></li>
                        <li><a href="../attendees/list.html" class="sidebar-sublink">🗑️ Supprimer</a></li>
                    </ul>
                </li>
                <li class="sidebar-item">
                    <a href="#" class="sidebar-link" data-section="categories">
                        <span><span class="sidebar-icon">🏷️</span>Catégories</span>
                        <span class="sidebar-arrow">▶</span>
                    </a>
                    <ul class="sidebar-submenu">
                        <li><a href="../categories/list.html" class="sidebar-sublink">📋 Afficher</a></li>
                        <li><a href="../categories/create.html" class="sidebar-sublink">➕ Créer</a></li>
                        <li><a href="../categories/list.html" class="sidebar-sublink">✏️ Modifier</a></li>
                        <li><a href="../categories/list.html" class="sidebar-sublink">🗑️ Supprimer</a></li>
                    </ul>
                </li>
            </ul>
        </nav>
    `;
    
    // Gérer les clics et le burger menu
    setupEvents();
    
    function setupEvents() {
        const frame = document.getElementById('frame');
        const burgerBtn = document.getElementById('burgerBtn');
        
        // Toggle sidebar
        burgerBtn.addEventListener('click', function() {
            if (window.innerWidth <= 768) {
                sidebar.classList.toggle('open');
            } else {
                frame.classList.toggle('sidebar-closed');
                sidebar.classList.toggle('closed');
            }
        });
        
        // Gestion des menus déroulants
        const sidebarLinks = sidebar.querySelectorAll('.sidebar-link[data-section]');
        
        sidebarLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const parentItem = this.closest('.sidebar-item');
                const wasOpen = parentItem.classList.contains('open');
                
                sidebar.querySelectorAll('.sidebar-item').forEach(item => {
                    item.classList.remove('open');
                });
                
                if (!wasOpen) {
                    parentItem.classList.add('open');
                }
            });
        });
        
        // Ouvrir automatiquement selon la section
        const currentPath = window.location.pathname;
        if (currentPath.includes('/events/')) {
            const item = sidebar.querySelector('[data-section="events"]');
            if (item) item.closest('.sidebar-item').classList.add('open');
        } else if (currentPath.includes('/locations/')) {
            const item = sidebar.querySelector('[data-section="locations"]');
            if (item) item.closest('.sidebar-item').classList.add('open');
        } else if (currentPath.includes('/attendees/')) {
            const item = sidebar.querySelector('[data-section="attendees"]');
            if (item) item.closest('.sidebar-item').classList.add('open');
        } else if (currentPath.includes('/categories/')) {
            const item = sidebar.querySelector('[data-section="categories"]');
            if (item) item.closest('.sidebar-item').classList.add('open');
        }
    }
    
    console.log('Sidebar chargée ! ');
});