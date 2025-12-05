/* public/js/calendar.js - VERSION SIMPLE SANS COLORING WEEK-END */
document.addEventListener('DOMContentLoaded', async function() {
    const currentMonthElement = document.getElementById('currentMonth');
    const calendarBody = document.getElementById('calendarBody');
    const prevMonthBtn = document.getElementById('prevMonth');
    const nextMonthBtn = document.getElementById('nextMonth');
    const todayBtn = document.getElementById('todayBtn');
    const categoryFilter = document.getElementById('categoryFilter');
    const categoryLegend = document.getElementById('categoryLegend');
    
    // Modal elements
    const eventModal = document.getElementById('eventModal');
    const modalEventTitle = document.getElementById('modalEventTitle');
    const modalEventContent = document.getElementById('modalEventContent');
    const editEventBtn = document.getElementById('editEventBtn');
    const closeModal = document.getElementById('closeModal');
    const closeModalBtn = document.getElementById('closeModalBtn');

    let currentDate = new Date();
    let allEvents = [];
    let allCategories = [];
    let allLocations = [];
    let filteredEvents = [];

    // Chargement initial des données
    await loadData();
    renderCalendar();

    async function loadData() {
        try {
            const [eventsRes, categoriesRes, locationsRes] = await Promise.all([
                fetch('/api/events'),
                fetch('/api/categories'),
                fetch('/api/locations')
            ]);

            allEvents = await eventsRes.json();
            allCategories = await categoriesRes.json();
            allLocations = await locationsRes.json();

            populateCategoryFilter();
            populateCategoryLegend();
            applyFilters();
        } catch (error) {
            console.error('Erreur lors du chargement des données:', error);
        }
    }

    function populateCategoryFilter() {
        allCategories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.name;
            categoryFilter.appendChild(option);
        });
    }

    function populateCategoryLegend() {
        categoryLegend.innerHTML = allCategories.map(category => `
            <div class="legend-item">
                <div class="legend-color" style="background-color: ${category.color};"></div>
                <span>${category.name}</span>
            </div>
        `).join('');
    }

    function applyFilters() {
        const selectedCategoryId = categoryFilter.value;
        
        if (selectedCategoryId) {
            filteredEvents = allEvents.filter(event => event.category_id == selectedCategoryId);
        } else {
            filteredEvents = allEvents;
        }
        
        renderCalendar();
    }

    function renderCalendar() {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        // Titre du mois AVEC MAJUSCULE
        const monthYear = new Date(year, month).toLocaleDateString('fr-FR', {
            month: 'long',
            year: 'numeric'
        });
        currentMonthElement.textContent = monthYear.charAt(0).toUpperCase() + monthYear.slice(1);

        // Calculer les dates
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const firstDayOfWeek = (firstDay.getDay() + 6) % 7; // Lundi = 0
        const daysInMonth = lastDay.getDate();

        // Vider le calendrier
        calendarBody.innerHTML = '';

        // Jours du mois précédent
        const prevMonth = new Date(year, month - 1, 0);
        const prevMonthDays = prevMonth.getDate();
        
        for (let i = firstDayOfWeek - 1; i >= 0; i--) {
            const dayElement = createDayElement(prevMonthDays - i, true, new Date(year, month - 1, prevMonthDays - i));
            calendarBody.appendChild(dayElement);
        }

        // Jours du mois actuel
        for (let day = 1; day <= daysInMonth; day++) {
            const dayElement = createDayElement(day, false, new Date(year, month, day));
            calendarBody.appendChild(dayElement);
        }

        // Jours du mois suivant pour compléter la grille
        const totalCells = calendarBody.children.length;
        const remainingCells = 42 - totalCells; // 6 semaines × 7 jours
        
        for (let day = 1; day <= remainingCells; day++) {
            const dayElement = createDayElement(day, true, new Date(year, month + 1, day));
            calendarBody.appendChild(dayElement);
        }
    }

    function createDayElement(dayNumber, isOtherMonth, currentDayDate) {
        const dayElement = document.createElement('div');
        dayElement.classList.add('calendar-day');
        
        if (isOtherMonth) {
            dayElement.classList.add('other-month');
        }

        // Marquer aujourd'hui
        const today = new Date();
        if (
            currentDayDate.getDate() === today.getDate() &&
            currentDayDate.getMonth() === today.getMonth() &&
            currentDayDate.getFullYear() === today.getFullYear()
        ) {
            dayElement.classList.add('today');
        }

        dayElement.innerHTML = `
            <div class="calendar-day-number">${dayNumber}</div>
            <div class="calendar-events"></div>
        `;

        // Ajouter les événements de ce jour
        const dayEvents = getEventsForDay(currentDayDate);
        const eventsContainer = dayElement.querySelector('.calendar-events');
        
        if (dayEvents.length > 0) {
            dayElement.classList.add('has-events');
        }
        
        dayEvents.forEach(event => {
            const eventElement = document.createElement('div');
            eventElement.classList.add('calendar-event');
            
            const category = allCategories.find(c => c.id == event.category_id);
            if (category) {
                eventElement.style.backgroundColor = category.color;
            }
            
            // Limiter la longueur du texte pour les événements
            const eventName = event.name.length > 15 ? event.name.substring(0, 12) + '...' : event.name;
            eventElement.textContent = eventName;
            eventElement.title = event.name; // Tooltip avec le nom complet
            
            eventElement.addEventListener('click', (e) => {
                e.stopPropagation();
                showEventModal(event);
            });
            
            eventsContainer.appendChild(eventElement);
        });

        return dayElement;
    }

    function getEventsForDay(date) {
        return filteredEvents.filter(event => {
            const eventStart = new Date(event.start_date);
            const eventEnd = new Date(event.end_date);
            
            // Vérifier si l'événement se déroule ce jour-là
            const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
            const dayEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59);
            
            return (eventStart <= dayEnd && eventEnd >= dayStart);
        });
    }

    function showEventModal(event) {
        const category = allCategories.find(c => c.id == event.category_id);
        const location = allLocations.find(l => l.id == event.location_id);
        
        modalEventTitle.textContent = event.name;
        editEventBtn.href = `events/edit.html?id=${event.id}`;
        
        modalEventContent.innerHTML = `
            <div class="event-detail">
                <strong>📅 Date de début:</strong>
                <span>${formatDateTime(event.start_date)}</span>
            </div>
            <div class="event-detail">
                <strong>🏁 Date de fin:</strong>
                <span>${formatDateTime(event.end_date)}</span>
            </div>
            <div class="event-detail">
                <strong>📍 Lieu:</strong>
                <span>${location ?   `${location.name}, ${location.city}` : 'Non défini'}</span>
            </div>
            <div class="event-detail">
                <strong>🏷️ Catégorie:</strong>
                <span>${category ? `<span class="badge" style="background: ${category.color}20; color: ${category.color};">${category.name}</span>` : 'Non définie'}</span>
            </div>
            ${event.description ? `
                <div class="event-detail">
                    <strong>📝 Description:</strong>
                    <span>${event.description}</span>
                </div>
            ` : ''}
            ${location ? `
                <div class="event-detail">
                    <strong>👥 Capacité:</strong>
                    <span>${location.capacity} places</span>
                </div>
            ` : ''}
        `;
        
        eventModal.style.display = 'flex';
    }

    function hideEventModal() {
        eventModal.style.display = 'none';
    }

    function formatDateTime(dateString) {
        return new Date(dateString).toLocaleString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    // Event listeners
    prevMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
    });

    nextMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
    });

    todayBtn.addEventListener('click', () => {
        currentDate = new Date();
        renderCalendar();
    });

    categoryFilter.addEventListener('change', applyFilters);

    if (closeModal) {
        closeModal.addEventListener('click', hideEventModal);
    }
    
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', hideEventModal);
    }

    // Fermer la modal en cliquant en dehors
    if (eventModal) {
        eventModal.addEventListener('click', (e) => {
            if (e.target === eventModal) {
                hideEventModal();
            }
        });
    }

    // Fermer la modal avec Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && eventModal && eventModal.style.display === 'flex') {
            hideEventModal();
        }
    });

    console.log('📅 Calendrier initialisé avec succès ! ');
});