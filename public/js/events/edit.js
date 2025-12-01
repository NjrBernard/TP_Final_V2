document.addEventListener('DOMContentLoaded', async function() {
    const urlParams = new URLSearchParams(window.location.search);
    const eventId = urlParams.get('id');
    
    const form = document.getElementById('eventForm');
    const loading = document.getElementById('loading');
    const alertContainer = document.getElementById('alert-container');

    if (!eventId) {
        window.location.href = 'list.html';
        return;
    }

    await loadEvent();

    async function loadEvent() {
        try {
            const [eventRes, categoriesRes, locationsRes] = await Promise.all([
                fetch(`/api/events/${eventId}`),
                fetch('/api/categories'),
                fetch('/api/locations')
            ]);

            const event = await eventRes.json();
            const categories = await categoriesRes.json();
            const locations = await locationsRes.json();

            populateForm(event, categories, locations);
            loading.style.display = 'none';
            form.style.display = 'block';
        } catch (error) {
            showAlert('danger', 'Erreur lors du chargement de l\'événement');
            console.error(error);
        }
    }

    function populateForm(event, categories, locations) {
        document.getElementById('name').value = event.name || '';
        document.getElementById('description').value = event.description || '';
        
        // Formatage des dates pour datetime-local
        if (event.start_date) {
            document.getElementById('start_date').value = formatDateTimeLocal(event.start_date);
        }
        if (event.end_date) {
            document.getElementById('end_date').value = formatDateTimeLocal(event.end_date);
        }

        // Remplir les catégories
        const categorySelect = document.getElementById('category_id');
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category. name;
            option.selected = category.id == event.category_id;
            categorySelect.appendChild(option);
        });

        // Remplir les lieux
        const locationSelect = document.getElementById('location_id');
        locations.forEach(location => {
            const option = document.createElement('option');
            option.value = location.id;
            option.textContent = `${location.name} - ${location.city} (${location.capacity} places)`;
            option.selected = location.id == event.location_id;
            locationSelect.appendChild(option);
        });
    }

    function formatDateTimeLocal(dateString) {
        const date = new Date(dateString);
        return date.toISOString().slice(0, 16);
    }

    function showAlert(type, message) {
        alertContainer.innerHTML = `
            <div class="alert alert-${type}">
                ${message}
            </div>
        `;
        setTimeout(() => {
            alertContainer. innerHTML = '';
        }, 5000);
    }

    // Soumission du formulaire
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
            const data = Object. fromEntries(formData);
            
            const response = await fetch(`/api/events/${eventId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                localStorage.setItem('success-message', 'Événement modifié avec succès ! ');
                window.location.href = 'list.html';
            } else {
                const error = await response.json();
                throw new Error(error.message || 'Erreur lors de la modification');
            }
        } catch (error) {
            showAlert('danger', 'Erreur : ' + error.message);
        } finally {
            submitBtn. disabled = false;
            btnText.style.display = 'inline';
            loadingIcon.style. display = 'none';
        }
    });
});