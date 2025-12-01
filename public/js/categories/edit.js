// public/js/categories/edit.js
document.addEventListener('DOMContentLoaded', async function() {
    const urlParams = new URLSearchParams(window.location.search);
    const categoryId = urlParams.get('id');
    
    const form = document.getElementById('categoryForm');
    const loading = document.getElementById('loading');
    const alertContainer = document.getElementById('alert-container');
    const nameInput = document.getElementById('name');
    const colorInputs = document.querySelectorAll('input[name="color"]');
    const previewBadge = document.getElementById('previewBadge');

    if (! categoryId) {
        window.location.href = 'list.html';
        return;
    }

    // Gestion de la sélection de couleur
    colorInputs.forEach(input => {
        const label = input.parentElement;
        
        input.addEventListener('change', function() {
            document.querySelectorAll('. color-option').forEach(option => {
                option.classList. remove('selected');
            });
            
            if (input.checked) {
                label.classList.add('selected');
                updatePreview();
            }
        });
        
        label.addEventListener('click', function() {
            input.checked = true;
            input.dispatchEvent(new Event('change'));
        });
    });

    // Mise à jour de l'aperçu
    function updatePreview() {
        const name = nameInput.value || 'Nom de la catégorie';
        const selectedColor = document.querySelector('input[name="color"]:checked')?.value || '#6b7280';
        
        previewBadge.style.background = selectedColor + '20';
        previewBadge.style.color = selectedColor;
        previewBadge.textContent = name;
    }

    nameInput.addEventListener('input', updatePreview);

    await loadCategory();

    async function loadCategory() {
        try {
            const response = await fetch(`/api/categories/${categoryId}`);
            const category = await response.json();
            
            populateForm(category);
            loading.style.display = 'none';
            form.style.display = 'block';
        } catch (error) {
            showAlert('danger', 'Erreur lors du chargement de la catégorie');
            console.error(error);
        }
    }

    function populateForm(category) {
        nameInput.value = category.name || '';
        document.getElementById('description').value = category.description || '';
        
        // Sélectionner la couleur
        const colorInput = document.querySelector(`input[name="color"][value="${category.color}"]`);
        if (colorInput) {
            colorInput.checked = true;
            colorInput.parentElement.classList.add('selected');
        }
        
        updatePreview();
    }

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

    // Soumission du formulaire
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const submitBtn = form.querySelector('button[type="submit"]');
        const btnText = submitBtn.querySelector('. btn-text');
        const loadingIcon = submitBtn.querySelector('.loading');
        
        submitBtn.disabled = true;
        btnText.style.display = 'none';
        loadingIcon.style.display = 'inline-block';
        
        try {
            const formData = new FormData(form);
            const data = Object.fromEntries(formData);
            
            const response = await fetch(`/api/categories/${categoryId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                localStorage.setItem('success-message', 'Catégorie modifiée avec succès ! ');
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