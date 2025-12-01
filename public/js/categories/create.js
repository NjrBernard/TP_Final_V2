document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('categoryForm');
    const nameInput = document.getElementById('name');
    const colorInputs = document.querySelectorAll('input[name="color"]');
    const previewBadge = document.getElementById('previewBadge');
    
    // Gestion de la sélection de couleur
    colorInputs.forEach(input => {
        const label = input.parentElement;
        
        input.addEventListener('change', function() {
            // Retirer la classe selected de tous
            document.querySelectorAll('. color-option').forEach(option => {
                option.classList.remove('selected');
            });
            
            // Ajouter selected au choisi
            if (input.checked) {
                label.classList. add('selected');
                updatePreview();
            }
        });
        
        // Permettre le clic sur le label
        label.addEventListener('click', function() {
            input. checked = true;
            input.dispatchEvent(new Event('change'));
        });
    });

    // Mise à jour de l'aperçu
    function updatePreview() {
        const name = nameInput.value || 'Nom de la catégorie';
        const selectedColor = document.querySelector('input[name="color"]:checked')?.value || '#6b7280';
        
        previewBadge.style. background = selectedColor + '20';
        previewBadge.style.color = selectedColor;
        previewBadge.textContent = name;
    }

    nameInput.addEventListener('input', updatePreview);

    // Soumission du formulaire
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const submitBtn = form.querySelector('button[type="submit"]');
        const btnText = submitBtn.querySelector('.btn-text');
        const loading = submitBtn.querySelector('.loading');
        
        submitBtn.disabled = true;
        btnText.style.display = 'none';
        loading.style.display = 'inline-block';
        
        try {
            const formData = new FormData(form);
            const data = Object.fromEntries(formData);
            
            const response = await fetch('/api/categories', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                localStorage.setItem('success-message', 'Catégorie créée avec succès ! ');
                window.location.href = 'list.html';
            } else {
                const error = await response.json();
                throw new Error(error.message || 'Erreur lors de la création');
            }
        } catch (error) {
            alert('Erreur : ' + error.message);
        } finally {
            submitBtn.disabled = false;
            btnText.style. display = 'inline';
            loading.style.display = 'none';
        }
    });
});