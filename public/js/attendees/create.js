// public/js/attendees/create.js - VERSION AVEC EMAIL/TÉLÉPHONE OPTIONNELS
document.addEventListener('DOMContentLoaded', async function() {
    const form = document.getElementById('attendeeForm');
    const eventSelect = document.getElementById('event_id');
    const companionsInput = document.getElementById('companions_count');
    const eventInfo = document.getElementById('eventInfo');
    const eventDetails = document.getElementById('eventDetails');
    const availabilityAlert = document.getElementById('availabilityAlert');
    const submitBtn = document.getElementById('submitBtn');

    let allEvents = [];
    let allLocations = [];
    let allCategories = [];

    // Charger les données
    await loadData();

    async function loadData() {
        try {
            const [eventsRes, locationsRes, categoriesRes] = await Promise.all([
                fetch('/api/events'),
                fetch('/api/locations'),
                fetch('/api/categories')
            ]);

            allEvents = await eventsRes.json();
            allLocations = await locationsRes.json();
            allCategories = await categoriesRes.json();

            populateEventSelect();
        } catch (error) {
            console.error('Erreur lors du chargement:', error);
        }
    }

    function populateEventSelect() {
        // Filtrer les événements futurs
        const now = new Date();
        const upcomingEvents = allEvents.filter(event => new Date(event.start_date) > now);
        
        upcomingEvents.forEach(event => {
            const option = document.createElement('option');
            option.value = event.id;
            option.textContent = `${event.name} - ${formatDateTime(event.start_date)}`;
            eventSelect.appendChild(option);
        });
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

    // ===== NOUVELLE FONCTION : VALIDATION EMAIL ===== 
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // ===== NOUVELLE FONCTION : VALIDATION DES CHAMPS ===== 
    function validateForm() {
        const firstName = document.getElementById('first_name').value.trim();
        const lastName = document.getElementById('last_name').value.trim();
        const email = document.getElementById('email').value.trim();
        const eventId = document.getElementById('event_id').value;

        // Champs obligatoires
        if (!firstName || !lastName || !eventId) {
            showAlert('danger', 'Le prénom, nom et événement sont obligatoires');
            return false;
        }

        // Email optionnel mais format correct si rempli
        if (email && !isValidEmail(email)) {
            showAlert('danger', 'Format d\'email invalide');
            return false;
        }

        return true;
    }

    function showAlert(type, message) {
        const alertContainer = document.getElementById('alert-container');
        if (alertContainer) {
            alertContainer.innerHTML = `
                <div class="alert alert-${type}">
                    ${message}
                </div>
            `;
            setTimeout(() => {
                alertContainer.innerHTML = '';
            }, 5000);
        }
    }

    function checkAvailability() {
        const selectedEventId = eventSelect.value;
        const requestedPlaces = parseInt(companionsInput.value) || 1;

        if (! selectedEventId) {
            availabilityAlert.innerHTML = '';
            return;
        }

        const event = allEvents.find(e => e.id == selectedEventId);
        if (! event) return;

        const location = allLocations.find(l => l.id == event.location_id);
        const capacity = location ? location.capacity : 0;
        const registered = event.registered_count || 0;
        const available = capacity - registered;

        let alertHtml = '';
        let canSubmit = true;

        if (capacity === 0) {
            alertHtml = `
                <div style="padding: 12px; background: #fbbf24; color: white; border-radius: 6px; font-weight: 600;">
                    ⚠️ Capacité du lieu non définie
                </div>
            `;
        } else if (requestedPlaces > available) {
            alertHtml = `
                <div style="padding: 12px; background: var(--danger); color: white; border-radius: 6px; font-weight: 600;">
                    ❌ Pas assez de places disponibles !   
                    <br>Demandé: ${requestedPlaces} • Disponible: ${available}
                </div>
            `;
            canSubmit = false;
        } else if (available <= 5) {
            alertHtml = `
                <div style="padding: 12px; background: #f59e0b; color: white; border-radius: 6px; font-weight: 600;">
                    ⚠️ Attention: Plus que ${available} places disponibles ! 
                </div>
            `;
        } else {
            alertHtml = `
                <div style="padding: 12px; background: #10b981; color: white; border-radius: 6px; font-weight: 600;">
                    ✅ ${available} places disponibles
                </div>
            `;
        }

        availabilityAlert.innerHTML = alertHtml;
        submitBtn.disabled = ! canSubmit;
        
        if (! canSubmit) {
            submitBtn.style.opacity = '0.5';
            submitBtn.style.cursor = 'not-allowed';
        } else {
            submitBtn.style.opacity = '1';
            submitBtn.style.cursor = 'pointer';
        }
    }

    // Afficher les détails de l'événement sélectionné
    eventSelect.addEventListener('change', function() {
        const selectedEventId = eventSelect.value;
        
        if (!selectedEventId) {
            eventInfo.style.display = 'none';
            return;
        }

        const event = allEvents.find(e => e.id == selectedEventId);
        const location = allLocations.find(l => l.id == event.location_id);
        const category = allCategories.find(c => c.id == event.category_id);

        // Calculer les places occupées et restantes
        const registered = event.registered_count || 0;
        const capacity = location ? location.capacity : 0;
        const available = capacity - registered;

        eventDetails.innerHTML = `
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;">
                <div>
                    <strong>📅 Date de début:</strong><br>
                    ${formatDateTime(event.start_date)}
                </div>
                <div>
                    <strong>🏁 Date de fin:</strong><br>
                    ${formatDateTime(event.end_date)}
                </div>
                <div>
                    <strong>📍 Lieu:</strong><br>
                    ${location ? `${location.name}, ${location.city}` : 'Non défini'}
                </div>
                <div>
                    <strong>🏷️ Catégorie:</strong><br>
                    ${category ? `<span class="badge" style="background: ${category.color}20; color: ${category.color};">${category.name}</span>` : 'Non définie'}
                </div>
                ${location ?  `
                <div>
                    <strong>👥 Capacité:</strong><br>
                    ${capacity} places
                </div>
                <div>
                    <strong>📊 Occupation:</strong><br>
                    ${registered}/${capacity} • ${available} libres
                </div>
                ` : ''}
            </div>
            ${event.description ? `
                <div style="margin-top: 16px;">
                    <strong>📝 Description:</strong><br>
                    ${event.description}
                </div>
            ` : ''}
        `;

        eventInfo.style.display = 'block';
        checkAvailability();
    });

    // Vérifier la disponibilité quand on change le nombre de personnes
    companionsInput.addEventListener('input', checkAvailability);

    // ===== VALIDATION TÉLÉPHONE OPTIONNELLE ===== 
    const phoneInput = document.getElementById('phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', function() {
            let value = phoneInput.value.replace(/\D/g, ''); // Supprimer les non-chiffres
            
            if (value.length > 0) {
                if (value.startsWith('33')) {
                    // Format international
                    value = value.replace(/(\d{2})(\d{1})(\d{2})(\d{2})(\d{2})(\d{2})/, '+$1 $2 $3 $4 $5 $6');
                } else if (value.startsWith('0')) {
                    // Format français
                    value = value.replace(/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5');
                }
            }
            
            phoneInput.value = value;
        });
    }

    // ===== VALIDATION EMAIL EN TEMPS RÉEL ===== 
    const emailInput = document.getElementById('email');
    if (emailInput) {
        emailInput.addEventListener('blur', function() {
            const email = emailInput.value.trim();
            if (email && !isValidEmail(email)) {
                emailInput.style.borderColor = 'var(--danger)';
                showAlert('warning', 'Format d\'email invalide');
            } else {
                emailInput.style.borderColor = '';
            }
        });
    }

    // ===== SOUMISSION DU FORMULAIRE MODIFIÉE ===== 
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Validation côté client
        if (!validateForm()) {
            return;
        }
        
        const btnText = submitBtn.querySelector('.btn-text');
        const loading = submitBtn.querySelector('.loading');
        
        submitBtn.disabled = true;
        btnText.style.display = 'none';
        loading.style.display = 'inline-block';
        
        try {
            const formData = new FormData(form);
            const data = Object.fromEntries(formData);
            
            // Nettoyer les données
            data.companions_count = parseInt(data.companions_count) || 1;
            data.email = data.email.trim() || null;      // NULL si vide
            data.phone = data.phone.trim() || null;      // NULL si vide
            data.first_name = data.first_name.trim();
            data.last_name = data.last_name.trim();
            
            const response = await fetch('/api/attendees', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                const result = await response.json();
                const companionsText = data.companions_count > 1 ? 
                    ` (pour ${data.companions_count} personnes)` : '';
                    
                localStorage.setItem('success-message', 
                    `Participant inscrit avec succès${companionsText} !`);
                window.location.href = 'list.html';
            } else {
                const error = await response.json();
                throw new Error(error.message || 'Erreur lors de l\'inscription');
            }
        } catch (error) {
            showAlert('danger', 'Erreur : ' + error.message);
        } finally {
            submitBtn.disabled = false;
            btnText.style.display = 'inline';
            loading.style.display = 'none';
        }
    });
});