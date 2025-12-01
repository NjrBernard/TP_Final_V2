document.addEventListener('DOMContentLoaded', async function() {
    const form = document.getElementById('eventForm');
    const categorySelect = document.getElementById('category_id');
    const locationSelect = document.getElementById('location_id');

    // Charger les catégories et lieux
    await Promise.all([
        loadCategories(),
        loadLocations()
    ]);

    async function loadCategories() {
        try {
            const response = await fetch('/api/categories');
            const categories = await response.json();
            
            categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category.id;
                option.textContent = category.name;
                categorySelect.appendChild(option);
            });
        } catch (error) {
            console.error('Erreur lors du chargement des catégories:', error);
        }
    }

    async function loadLocations() {
        try {
            const response = await fetch('/api/locations');
            const locations = await response.json();
            
            locations.forEach(location => {
                const option = document.createElement('option');
                option.value = location.id;
                option.textContent = `${location.name} - ${location.city} (${location.capacity} places)`;
                locationSelect. appendChild(option);
            });
        } catch (error) {
            console.error('Erreur lors du chargement des lieux:', error);
        }
    }

    // Validation des dates
    const startDateInput = document.getElementById('start_date');
    const endDateInput = document.getElementById('end_date');

    startDateInput.addEventListener('change', function() {
        if (startDateInput.value) {
            endDateInput.min = startDateInput.value;
            if (endDateInput.value && endDateInput.value <= startDateInput.value) {
                endDateInput.value = '';
            }
        }
    });

    // Soumission du formulaire
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const submitBtn = form.querySelector('button[type="submit"]');
        const btnText = submitBtn.querySelector('.btn-text');
        const loading = submitBtn.querySelector('.loading');
        
        // État de chargement
        submitBtn.disabled = true;
        btnText. style.display = 'none';
        loading.style.display = 'inline-block';
        
        try {
            const formData = new FormData(form);
            const data = Object.fromEntries(formData);
            
            const response = await fetch('/api/events', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                // Rediriger vers la liste avec message de succès
                localStorage.setItem('success-message', 'Événement créé avec succès !');
                window.location.href = 'list.html';
            } else {
                const error = await response.json();
                throw new Error(error.message || 'Erreur lors de la création');
            }
        } catch (error) {
            alert('Erreur : ' + error.message);
        } finally {
            // Restaurer l'état du bouton
            submitBtn.disabled = false;
            btnText. style.display = 'inline';
            loading.style.display = 'none';
        }
    });
});