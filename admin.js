
document.addEventListener('contentReady', () => {
    // Content is loaded by app.js and is available at window.portfolioContent
    const content = window.portfolioContent;
    const DB_NAME = 'portfolioContent'; // Should be the same as in app.js

    // --- DOM Elements ---
    const adminModal = document.getElementById('admin-modal');
    const modalBody = adminModal.querySelector('.modal-body');
    const closeAdminBtn = document.getElementById('close-admin-panel');

    // The open button is loaded dynamically, so we attach the listener to the body.
    document.body.addEventListener('click', (e) => {
        if (e.target && e.target.id === 'open-admin-panel') {
            openAdminPanel();
        }
    });
    
    // --- Functions ---

    function openAdminPanel() {
        buildAdminUI();
        adminModal.style.display = 'flex';
    }

    function closeAdminPanel() {
        adminModal.style.display = 'none';
    }

    function saveChanges() {
        try {
            saveHeroChanges();
            saveHomeChanges();
            saveBusinessCardChanges();

            localStorage.setItem(DB_NAME, JSON.stringify(content));
            alert('Изменения сохранены! Страница будет перезагружена.');
            window.location.reload();
        } catch (error) {
            console.error("Ошибка сохранения:", error);
            alert(`Ошибка при сохранении данных: ${error.message}`);
        }
    }

    function saveHeroChanges() {
        content.hero.title = document.getElementById('hero-title-input').value;
        content.hero.description = document.getElementById('hero-description-input').value;
        content.hero.backgroundImage = document.getElementById('hero-bg-url-input').value;
    }

    function saveHomeChanges() {
        content.home.title = document.getElementById('home-title-input').value;
        
        const contactInfoValues = document.querySelectorAll('.contact-info-value');
        content.home.contactInfo.forEach((item, index) => {
            if(contactInfoValues[index]) {
                item.value = contactInfoValues[index].value;
            }
        });
    }

    function saveBusinessCardChanges() {
        const data = content['business-card'];
        data.title = document.getElementById('bc-title-input').value;
        data.name = document.getElementById('bc-name-input').value;

        // Save details
        const detailsData = [];
        document.querySelectorAll('#bc-details-container .dynamic-list-item').forEach(item => {
            const key = item.querySelector('input:nth-child(1)').value;
            const value = item.querySelector('input:nth-child(2)').value;
            if (key) { // Only save if key is not empty
                detailsData.push({ key, value });
            }
        });
        data.details = detailsData;

        // Save disciplines
        data.disciplines.title = document.getElementById('bc-disciplines-title-input').value;
        data.disciplines.tags = document.getElementById('bc-disciplines-tags-input').value.split(',').map(tag => tag.trim()).filter(tag => tag);

        // Save awards
        const awardsData = [];
        document.querySelectorAll('#bc-awards-container .dynamic-list-item').forEach(item => {
            const text = item.querySelector('input:nth-child(1)').value;
            const badge = item.querySelector('input:nth-child(2)').value;
            if (text) { // Only save if text is not empty
                awardsData.push({ text, badge });
            }
        });
        data.awards.items = awardsData;
    }

    function buildAdminUI() {
        // Clear previous UI
        modalBody.innerHTML = '';

        // Create a tabbed interface
        const tabContainer = document.createElement('div');
        tabContainer.className = 'admin-tabs';
        const contentContainer = document.createElement('div');
        contentContainer.className = 'admin-tab-content';

        // Add tabs for each content key
        for (const key in content) {
            const tab = document.createElement('button');
            tab.className = 'admin-tab-link';
            tab.textContent = key;
            tab.dataset.tab = key;
            tab.addEventListener('click', (e) => {
                // Hide all tab contents
                contentContainer.querySelectorAll('.admin-section').forEach(s => s.style.display = 'none');
                // Deactivate all tabs
                tabContainer.querySelectorAll('.admin-tab-link').forEach(t => t.classList.remove('active'));
                // Show the selected tab content
                contentContainer.querySelector(`.admin-section[data-section="${key}"]`).style.display = 'block';
                // Activate the selected tab
                e.target.classList.add('active');
            });
            tabContainer.appendChild(tab);

            const sectionContent = document.createElement('div');
            sectionContent.className = 'admin-section';
            sectionContent.dataset.section = key;
            sectionContent.style.display = 'none'; // Hide by default
            contentContainer.appendChild(sectionContent);
        }

        modalBody.appendChild(tabContainer);
        modalBody.appendChild(contentContainer);
        
        // Build the form for the 'hero' section
        buildHeroAdmin(content.hero);
        buildHomeAdmin(content.home);
        buildBusinessCardAdmin(content['business-card']);
        // Add other builders here

        // Add a master save button
        const saveButton = document.createElement('button');
        saveButton.id = 'save-all-changes';
        saveButton.className = 'btn-primary';
        saveButton.textContent = 'Сохранить все изменения';
        saveButton.addEventListener('click', saveChanges); // This will need to be smarter
        modalBody.appendChild(saveButton);

        // Activate the first tab by default
        tabContainer.querySelector('.admin-tab-link').click();
    }
    
    function createFormGroup(labelText, ...inputElements) {
        const group = document.createElement('div');
        group.className = 'form-group';
        const label = document.createElement('label');
        label.textContent = labelText;
        group.appendChild(label);
        inputElements.forEach(el => group.appendChild(el));
        return group;
    }

    function buildHeroAdmin(data) {
        const section = document.querySelector('.admin-section[data-section="hero"]');
        if (!data || !section) return;

        section.innerHTML = '<h3>Редактирование Hero-секции</h3>';

        const titleInput = document.createElement('input');
        titleInput.type = 'text';
        titleInput.id = 'hero-title-input';
        titleInput.className = 'form-control';
        titleInput.value = data.title;
        section.appendChild(createFormGroup('Заголовок (HTML разрешен):', titleInput));

        const descriptionTextarea = document.createElement('textarea');
        descriptionTextarea.id = 'hero-description-input';
        descriptionTextarea.className = 'form-control';
        descriptionTextarea.rows = 4;
        descriptionTextarea.value = data.description;
        section.appendChild(createFormGroup('Описание:', descriptionTextarea));

        // Input for image URL
        const imageUrlInput = document.createElement('input');
        imageUrlInput.type = 'text';
        imageUrlInput.className = 'form-control';
        imageUrlInput.id = 'hero-bg-url-input';
        imageUrlInput.value = data.backgroundImage || '';
        section.appendChild(createFormGroup('URL фонового изображения:', imageUrlInput));

        // Placeholder button for file upload
        const uploadButton = document.createElement('button');
        uploadButton.type = 'button'; // Important to prevent form submission
        uploadButton.className = 'btn-secondary';
        uploadButton.textContent = 'Загрузить фото (пока не работает)';
        uploadButton.style.marginTop = '0.5rem';
        uploadButton.disabled = true; // Disable the button

        const uploadGroup = createFormGroup('Или выберите файл:', uploadButton);
        section.appendChild(uploadGroup);
    }

    function buildHomeAdmin(data) {
        const section = document.querySelector('.admin-section[data-section="home"]');
        if (!data || !section) return;

        section.innerHTML = '<h3>Редактирование секции "Главная"</h3>';
        
        const titleInput = document.createElement('input');
        titleInput.type = 'text';
        titleInput.id = 'home-title-input';
        titleInput.className = 'form-control';
        titleInput.value = data.title;
        section.appendChild(createFormGroup('Заголовок секции:', titleInput));

        // Add simple inputs for contact info
        data.contactInfo.forEach((item, index) => {
             const input = document.createElement('input');
             input.type = 'text';
             input.className = 'form-control contact-info-value';
             input.value = item.value;
             section.appendChild(createFormGroup(item.key, input));
        });
    }

    function createDynamicList(container, items, itemRenderer) {
        items.forEach(item => container.appendChild(itemRenderer(item)));
    }

    function buildBusinessCardAdmin(data) {
        const section = document.querySelector('.admin-section[data-section="business-card"]');
        if (!data || !section) return;

        section.innerHTML = '<h3>Редактирование Визитной карточки</h3>';

        // Simple fields
        const titleInput = document.createElement('input');
        titleInput.type = 'text';
        titleInput.id = 'bc-title-input';
        titleInput.className = 'form-control';
        titleInput.value = data.title;
        section.appendChild(createFormGroup('Заголовок:', titleInput));
        
        const nameInput = document.createElement('input');
        nameInput.type = 'text';
        nameInput.id = 'bc-name-input';
        nameInput.className = 'form-control';
        nameInput.value = data.name;
        section.appendChild(createFormGroup('Имя:', nameInput));

        // --- Details list ---
        const detailsContainer = document.createElement('div');
        detailsContainer.id = 'bc-details-container';
        detailsContainer.className = 'dynamic-list-container';
        section.appendChild(detailsContainer);

        const detailItemRenderer = (item) => {
            const itemGroup = document.createElement('div');
            itemGroup.className = 'dynamic-list-item';
            
            const keyInput = document.createElement('input');
            keyInput.type = 'text';
            keyInput.className = 'form-control';
            keyInput.placeholder = 'Свойство';
            keyInput.value = item.key;
            
            const valueInput = document.createElement('input');
            valueInput.type = 'text';
            valueInput.className = 'form-control';
            valueInput.placeholder = 'Значение';
            valueInput.value = item.value;
            
            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'Удалить';
            deleteBtn.type = 'button';
            deleteBtn.className = 'btn-danger';
            deleteBtn.onclick = () => itemGroup.remove();

            itemGroup.append(keyInput, valueInput, deleteBtn);
            return itemGroup;
        };

        detailsContainer.innerHTML = '<h4>Детали:</h4>';
        createDynamicList(detailsContainer, data.details, detailItemRenderer);

        const addDetailBtn = document.createElement('button');
        addDetailBtn.textContent = 'Добавить деталь';
        addDetailBtn.type = 'button';
        addDetailBtn.className = 'btn-secondary';
        addDetailBtn.onclick = () => {
            detailsContainer.appendChild(detailItemRenderer({key: '', value: ''}));
        };
        section.appendChild(addDetailBtn);
        
        // --- Disciplines ---
        section.appendChild(document.createElement('hr'));
        const disciplinesTitle = document.createElement('input');
        disciplinesTitle.type = 'text';
        disciplinesTitle.id = 'bc-disciplines-title-input';
        disciplinesTitle.className = 'form-control';
        disciplinesTitle.value = data.disciplines.title;
        section.appendChild(createFormGroup('Заголовок дисциплин:', disciplinesTitle));
        
        const disciplinesTags = document.createElement('textarea');
        disciplinesTags.id = 'bc-disciplines-tags-input';
        disciplinesTags.className = 'form-control';
        disciplinesTags.placeholder = 'Введите теги через запятую';
        disciplinesTags.value = data.disciplines.tags.join(', ');
        section.appendChild(createFormGroup('Теги дисциплин (через запятую):', disciplinesTags));

        // --- Awards list ---
        section.appendChild(document.createElement('hr'));
        const awardsContainer = document.createElement('div');
        awardsContainer.id = 'bc-awards-container';
        awardsContainer.className = 'dynamic-list-container';
        section.appendChild(awardsContainer);
        
        const awardItemRenderer = (item) => {
            const itemGroup = document.createElement('div');
            itemGroup.className = 'dynamic-list-item';

            const textInput = document.createElement('input');
            textInput.type = 'text';
            textInput.className = 'form-control';
            textInput.placeholder = 'Текст награды';
            textInput.value = item.text;
            
            const badgeInput = document.createElement('input');
            badgeInput.type = 'text';
            badgeInput.className = 'form-control';
            badgeInput.placeholder = 'Значок (e.g., PDF)';
            badgeInput.value = item.badge;
            
            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'Удалить';
            deleteBtn.type = 'button';
            deleteBtn.className = 'btn-danger';
            deleteBtn.onclick = () => itemGroup.remove();

            itemGroup.append(textInput, badgeInput, deleteBtn);
            return itemGroup;
        };
        
        awardsContainer.innerHTML = '<h4>Награды:</h4>';
        createDynamicList(awardsContainer, data.awards.items, awardItemRenderer);
        
        const addAwardBtn = document.createElement('button');
        addAwardBtn.textContent = 'Добавить награду';
        addAwardBtn.type = 'button';
        addAwardBtn.className = 'btn-secondary';
        addAwardBtn.onclick = () => {
            awardsContainer.appendChild(awardItemRenderer({text: '', badge: ''}));
        };
        section.appendChild(addAwardBtn);
    }
    
    // --- Event Listeners ---
    closeAdminBtn.addEventListener('click', closeAdminPanel);
    adminModal.addEventListener('click', (e) => {
        if (e.target === adminModal) closeAdminPanel();
    });

    console.log("admin.js initialized and waiting for content.");
});
