document.addEventListener('DOMContentLoaded', async function() {
    const urlParams = new URLSearchParams(window.location.search);
    const attendeeId = urlParams.get('id');
    
    const form = document.getElementById('attendeeForm');
    const loading = document.getElementById('loading');
    const alertContainer = document.getElementById('alert-container');
    const eventSelect = document.getElementById('event_id');
    const eventInfo = document.getElementById('eventInfo');
    const eventDetails = document.getElementById('eventDetails');

    let allEvents = [];
    let allLocations = [];
    let allCategories = [];

    if (! attendeeId) {
        window.location.href = 'list.html';
        return;
    }

    await loadData();
    await loadAttendee();

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
            showAlert('danger', 'Erreur lors du chargement des données');
        }
    }

    function populateEventSelect() {
        eventSelect.innerHTML = '<option value="">Sélectionnez un événement</option>';
        
        allEvents.forEach(event => {
            const option = document.createElement('option');
            option.value = event.id;
            option.textContent = `${event.name} - ${formatDateTime(event.start_date)}`;
            eventSelect.appendChild(option);
        });
    }

    async function loadAttendee() {
        try {
            const response = await fetch(`/api/attendees/${attendeeId}`);
            
            if (!response.ok) {
                throw new Error('Participant non trouvé');
            }
            
            const attendee = await response.json();
            
            populateForm(attendee);
            loading.style.display = 'none';
            form.style.display = 'block';
        } catch (error) {
            showAlert('danger', 'Erreur lors du chargement du participant');
            console.error(error);
            loading.style.display = 'none';
        }
    }

    function populateForm(attendee) {
        document.getElementById('first_name').value = attendee.first_name || '';
        document.getElementById('last_name').value = attendee.last_name || '';
        document.getElementById('email').value = attendee.email || '';
        document.getElementById('phone').value = attendee.phone || '';
        document.getElementById('event_id').value = attendee.event_id || '';

        if (attendee.event_id) {
            showEventDetails(attendee.event_id);
        }
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

    function showEventDetails(eventId) {
        const event = allEvents.find(e => e.id == eventId);
        if (!event) {
            eventInfo.style.display = 'none';
            return;
        }

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
                    ${location.capacity} places
                </div>
                ` : ''}
            </div>
            ${event.description ?  `
                <div style="margin-top: 16px;">
                    <strong>📝 Description:</strong><br>
                    ${event.description}
                </div>
            ` : ''}
        `;

        eventInfo.style.display = 'block';
    }

    eventSelect.addEventListener('change', function() {
        const selectedEventId = eventSelect.value;
        if (selectedEventId) {
            showEventDetails(selectedEventId);
        } else {
            eventInfo.style.display = 'none';
        }
    });

    const phoneInput = document.getElementById('phone');
    phoneInput.addEventListener('input', function() {
        let value = phoneInput.value.replace(/\D/g, '');
        
        if (value.length > 0) {
            if (value.startsWith('33')) {
                value = value.replace(/(\d{2})(\d{1})(\d{2})(\d{2})(\d{2})(\d{2})/, '+$1 $2 $3 $4 $5 $6');
            } else if (value.startsWith('0')) {
                value = value.replace(/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5');
            }
        }
        
        phoneInput.value = value;
    });

    function showAlert(type, message) {
        alertContainer.innerHTML = `
            <div class="alert alert-${type}">
                ${message}
            </div>
        `;
        setTimeout(() => {
            alertContainer.innerHTML = '';
        }, 5000);
    }

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const submitBtn = form.querySelector('button[type="submit"]');
        const btnText = submitBtn.querySelector('.btn-text');
        const loadingIcon = submitBtn.querySelector('.loading');
        
        submitBtn.disabled = true;
        btnText.style.display = 'none';
        loadingIcon.style.display = 'inline-block';
        
        try {
            const formData = new FormData(form);
            const data = Object.fromEntries(formData);
            
            const response = await fetch(`/api/attendees/${attendeeId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                localStorage.setItem('success-message', 'Participant modifié avec succès !');
                window.location.href = 'list.html';
            } else {
                const error = await response.json();
                throw new Error(error.message || 'Erreur lors de la modification');
            }
        } catch (error) {
            showAlert('danger', 'Erreur : ' + error.message);
        } finally {
            submitBtn.disabled = false;
            btnText.style.display = 'inline';
            loadingIcon.style.display = 'none';
        }
    });
});