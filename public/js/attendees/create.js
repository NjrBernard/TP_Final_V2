document.addEventListener('DOMContentLoaded', async function() {
    const form = document.getElementById('attendeeForm');
    const eventSelect = document.getElementById('event_id');
    const eventInfo = document.getElementById('eventInfo');
    const eventDetails = document.getElementById('eventDetails');

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
            const option = document. createElement('option');
            option. value = event.id;
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

    // Afficher les détails de l'événement sélectionné
    eventSelect.addEventListener('change', function() {
        const selectedEventId = eventSelect.value;
        
        if (! selectedEventId) {
            eventInfo.style.display = 'none';
            return;
        }

        const event = allEvents.find(e => e.id == selectedEventId);
        const location = allLocations.find(l => l.id == event.location_id);
        const category = allCategories.find(c => c.id == event.category_id);

        eventDetails.innerHTML = `
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;">
                <div>
                    <strong>📅 Date de début:</strong><br>
                    ${formatDateTime(event.start_date)}
                </div>
                <div>
                    <strong>🏁 Date de fin:</strong><br>
                    ${formatDateTime(event. end_date)}
                </div>
                <div>
                    <strong>📍 Lieu:</strong><br>
                    ${location ?  `${location.name}, ${location.city}` : 'Non défini'}
                </div>
                <div>
                    <strong>🏷️ Catégorie:</strong><br>
                    ${category ? `<span class="badge" style="background: ${category.color}20; color: ${category.color};">${category.name}</span>` : 'Non définie'}
                </div>
                ${location ?  `
                <div>
                    <strong>👥 Capacité:</strong><br>
                    ${location.capacity} places
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
    });

    // Validation du téléphone français
    const phoneInput = document.getElementById('phone');
    phoneInput.addEventListener('input', function() {
        let value = phoneInput.value.replace(/\D/g, ''); // Supprimer les non-chiffres
        
        if (value.length > 0) {
            if (value.startsWith('33')) {
                // Format international
                value = value.replace(/(\d{2})(\d{1})(\d{2})(\d{2})(\d{2})(\d{2})/, '+$1 $2 $3 $4 $5 $6');
            } else if (value. startsWith('0')) {
                // Format français
                value = value.replace(/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5');
            }
        }
        
        phoneInput.value = value;
    });

    // Soumission du formulaire
    form. addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const submitBtn = form.querySelector('button[type="submit"]');
        const btnText = submitBtn.querySelector('.btn-text');
        const loading = submitBtn.querySelector('.loading');
        
        submitBtn.disabled = true;
        btnText.style. display = 'none';
        loading.style.display = 'inline-block';
        
        try {
            const formData = new FormData(form);
            const data = Object.fromEntries(formData);
            
            const response = await fetch('/api/attendees', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON. stringify(data)
            });

            if (response.ok) {
                localStorage.setItem('success-message', 'Participant inscrit avec succès !');
                window.location.href = 'list.html';
            } else {
                const error = await response.json();
                throw new Error(error.message || 'Erreur lors de l\'inscription');
            }
        } catch (error) {
            alert('Erreur : ' + error.message);
        } finally {
            submitBtn.disabled = false;
            btnText.style.display = 'inline';
            loading. style.display = 'none';
        }
    });
});