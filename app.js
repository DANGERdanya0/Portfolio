
document.addEventListener('DOMContentLoaded', () => {
    const contentKeys = [
        'sidebar', 'hero', 'home', 'business-card', 'methodical',
        'results', 'blog', 'extracurricular', 'students', 'gallery', 'guestbook'
    ];

    const DB_NAME = 'portfolioContent';

    // --- Core Functions ---

    async function init() {
        let content = loadContentFromLocalStorage();
        if (!content) {
            console.log('Fetching initial content...');
            content = await fetchInitialContent();
            saveContentToLocalStorage(content);
        } else {
            console.log('Content loaded from Local Storage.');
        }
        renderPage(content);
        // Expose content globally for admin.js
        window.portfolioContent = content;
        // Notify admin.js that content is ready
        document.dispatchEvent(new CustomEvent('contentReady'));
    }

    function loadContentFromLocalStorage() {
        const data = localStorage.getItem(DB_NAME);
        return data ? JSON.parse(data) : null;
    }

    function saveContentToLocalStorage(content) {
        localStorage.setItem(DB_NAME, JSON.stringify(content));
    }

    async function fetchInitialContent() {
        const fetchPromises = contentKeys.map(key =>
            fetch(`content/${key}.json`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status} for ${key}.json`);
                    }
                    return response.json();
                })
                .then(data => ({ key, data }))
        );

        try {
            const results = await Promise.all(fetchPromises);
            const content = {};
            results.forEach(result => {
                content[result.key] = result.data;
            });
            return content;
        } catch (error) {
            console.error("Could not fetch initial content:", error);
            // Display an error message to the user on the page
            document.body.innerHTML = `<div style="text-align: center; padding: 50px; font-family: sans-serif;">
                <h1>Ошибка загрузки контента</h1>
                <p>Не удалось загрузить данные для сайта. Пожалуйста, убедитесь, что вы запустили сайт через локальный веб-сервер, а не открыли файл index.html напрямую.</p>
                <p>Инструкция: Откройте терминал в папке проекта и выполните команду: <code>python -m http.server</code> или <code>npx serve</code>, затем перейдите по адресу <a href="http://localhost:8000">http://localhost:8000</a>.</p>
                <p><i>Детали ошибки: ${error.message}</i></p>
            </div>`;
            return null;
        }
    }


    // --- Render Functions ---

    function renderPage(content) {
        if (!content) return;
        renderSidebar(content.sidebar);
        renderHero(content.hero);
        // Add other render functions here as they are created
        renderHome(content.home);
        renderBusinessCard(content['business-card']);
        renderMethodical(content.methodical);
        renderResults(content.results);
        renderBlog(content.blog);
        renderExtracurricular(content.extracurricular);
        renderStudents(content.students);
        renderGallery(content.gallery);
        renderGuestbook(content.guestbook);
    }

    function renderSidebar(data) {
        const sidebar = document.getElementById('sidebar');
        if (!data || !sidebar) return;

        const navLinks = data.navLinks.map(link => `<li><a href="${link.href}">${link.text}</a></li>`).join('');

        sidebar.innerHTML = `
            <div class="teacher-info">
                <h3>${data.teacherInfo.name}</h3>
                <p>${data.teacherInfo.description}</p>
            </div>
            <nav>
                <ul>${navLinks}</ul>
            </nav>
            <div class="admin-panel-button">
                <button id="open-admin-panel">⚙️ Админ-панель</button>
            </div>
        `;
        
        // Re-add smooth scrolling after dynamic render
        sidebar.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const targetElement = document.querySelector(this.getAttribute('href'));
                if (targetElement) {
                    targetElement.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });
    }

    function renderHero(data) {
        const hero = document.querySelector('.hero[data-content-key="hero"]');
        if (!data || !hero) return;

        const stats = data.stats.map(stat => `
            <div class="stat-item">
                <span class="stat-number">${stat.number}</span>
                <span class="stat-label">${stat.label}</span>
            </div>
        `).join('');

        const buttons = data.buttons.map(button => `
            <button class="${button.class}" onclick="${button.onclick}">${button.text}</button>
        `).join('');

        hero.innerHTML = `
            <div class="hero-content">
                <div class="hero-badge">${data.badge}</div>
                <h1>${data.title}</h1>
                <p class="hero-description">${data.description}</p>
                <div class="hero-stats">${stats}</div>
                <div class="hero-buttons">${buttons}</div>
            </div>
            <div class="hero-image">
                <div class="hero-photo-container"></div>
            </div>
        `;

        // --- Dynamic Background Image ---
        if (data.backgroundImage) {
            const photoContainer = hero.querySelector('.hero-photo-container');
            if (photoContainer) {
                photoContainer.style.backgroundImage = `url('${data.backgroundImage}')`;
            }
        }
        // --- End Dynamic Background Image ---
    }
    
    function renderHome(data) {
        const section = document.querySelector('#home[data-content-key="home"]');
        if (!data || !section) return;

        const contactItems = data.contactInfo.map(item => `<p><strong>${item.key}:</strong> ${item.value}</p>`).join('');
        const cards = data.cards.map(card => `
            <div class="card">
                <h4>${card.title}</h4>
                <p>${card.text}</p>
                ${card.date ? `<p class="news-date">${card.date}</p>` : ''}
            </div>
        `).join('');

        section.innerHTML = `
            <h2>${data.title}</h2>
            <div class="contact-info">${contactItems}</div>
            <h3>${data.mainSectionsTitle}</h3>
            <div class="card-grid">${cards}</div>
        `;
    }

    function renderBusinessCard(data) {
        const section = document.querySelector('#business-card[data-content-key="business-card"]');
        if (!data || !section) return;

        const details = data.details.map(item => `<p><strong>${item.key}:</strong> ${item.value}</p>`).join('');
        const tags = data.disciplines.tags.map(tag => `<span class="skill-tag">${tag}</span>`).join('');
        const awards = data.awards.items.map(item => `<div class="card">${item.text} <span class="doc-badge">${item.badge}</span></div>`).join('');

        section.innerHTML = `
            <h2>${data.title}</h2>
            <div style="display: flex; align-items: center; gap: 2rem; flex-wrap: wrap;">
                <div class="photo-placeholder">${data.photoPlaceholder}</div>
                <div>
                    <h3>${data.name}</h3>
                    ${details}
                    <p><strong>${data.disciplines.title}</strong></p>
                    <div>${tags}</div>
                </div>
            </div>
            <h3 style="margin-top: 2rem;">${data.awards.title}</h3>
            <div class="card-grid">${awards}</div>
        `;
    }

    function renderMethodical(data) {
        const section = document.querySelector('#methodical[data-content-key="methodical"]');
        if (!data || !section) return;

        const workProgramHeaders = data.workPrograms.headers.map(h => `<th>${h}</th>`).join('');
        const workProgramRows = data.workPrograms.rows.map(row => `
            <tr>${row.map(cell => `<td>${cell.includes('PDF') ? `<span class="doc-badge">${cell}</span>` : cell}</td>`).join('')}</tr>
        `).join('');

        const devCards = data.methodicalDevelopments.cards.map(card => `
            <div class="card">
                <h4>${card.title}</h4>
                <p>${card.description}</p>
                <span class="doc-badge">${card.badge}</span>
            </div>
        `).join('');
        
        const publications = data.publications.items.map(item => `
            <div class="card">${item.text} <span class="doc-badge">${item.badge}</span></div>
        `).join('');

        section.innerHTML = `
            <h2>${data.title}</h2>
            <h3>${data.workPrograms.title}</h3>
            <table>
                <thead><tr>${workProgramHeaders}</tr></thead>
                <tbody>${workProgramRows}</tbody>
            </table>

            <h3>${data.methodicalDevelopments.title}</h3>
            <div class="card-grid">${devCards}</div>

            <h3>${data.publications.title}</h3>
            <div class="card-grid">${publications}</div>
        `;
    }
    
    function renderResults(data) {
        const section = document.querySelector('#results[data-content-key="results"]');
        if(!data || !section) return;

        const renderTable = (tableData) => {
            const headers = tableData.headers.map(h => `<th>${h}</th>`).join('');
            const rows = tableData.rows.map(row => `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`).join('');
            return `
                <h3>${tableData.title}</h3>
                <table>
                    <thead><tr>${headers}</tr></thead>
                    <tbody>${rows}</tbody>
                </table>
            `;
        }

        section.innerHTML = `
            <h2>${data.title}</h2>
            ${renderTable(data.performanceMonitoring)}
            ${renderTable(data.comparativeAnalysis)}
            ${renderTable(data.championships)}
        `;
    }

    function renderBlog(data) {
        const section = document.querySelector('#blog[data-content-key="blog"]');
        if(!data || !section) return;

        const posts = data.posts.map(post => `
            <div class="news-item">
                <p class="news-date">${post.date}</p>
                <h3>${post.title}</h3>
                <p>${post.text}</p>
            </div>
        `).join('');

        section.innerHTML = `
            <h2>${data.title}</h2>
            ${posts}
        `;
    }

    function renderExtracurricular(data) {
        const section = document.querySelector('#extracurricular[data-content-key="extracurricular"]');
        if(!data || !section) return;

        const tableHeaders = data.achievementsTable.headers.map(h => `<th>${h}</th>`).join('');
        const tableRows = data.achievementsTable.rows.map(row => `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`).join('');
        const photos = data.eventPhotos.items.map(item => `<div class="gallery-item">${item}</div>`).join('');

        section.innerHTML = `
            <h2>${data.title}</h2>
            <table>
                <thead><tr>${tableHeaders}</tr></thead>
                <tbody>${tableRows}</tbody>
            </table>
            <h3>${data.eventPhotos.title}</h3>
            <div class="gallery" style="grid-template-columns: repeat(3, 1fr);">${photos}</div>
        `;
    }

    function renderStudents(data) {
        const section = document.querySelector('#students[data-content-key="students"]');
        if(!data || !section) return;
        
        const cards = data.cards.map(card => `
            <div class="card">
                <h4>${card.title}</h4>
                <ul style="list-style: none;">
                    ${card.items.map(item => `<li>${item}</li>`).join('')}
                </ul>
            </div>
        `).join('');

        const videos = data.videoLessons.items.map(item => `<div class="card">${item}</div>`).join('');

        section.innerHTML = `
            <h2>${data.title}</h2>
            <div class="card-grid">${cards}</div>
            <h3>${data.videoLessons.title}</h3>
            <div class="card-grid" style="grid-template-columns: repeat(2, 1fr);">${videos}</div>
        `;
    }

    function renderGallery(data) {
        const section = document.querySelector('#gallery[data-content-key="gallery"]');
        if(!data || !section) return;
        
        const items = data.items.map(item => `<div class="gallery-item">${item}</div>`).join('');

        section.innerHTML = `
            <h2>${data.title}</h2>
            <div class="gallery">${items}</div>
        `;
    }

    function renderGuestbook(data) {
        const section = document.querySelector('#guestbook[data-content-key="guestbook"]');
        if(!data || !section) return;

        const entries = data.entries.map(entry => `
            <div class="card">
                <p><strong>${entry.author}:</strong> ${entry.message}</p>
                <p class="news-date">${entry.date}</p>
            </div>
        `).join('');

        section.innerHTML = `
            <h2>${data.title}</h2>
            <p>${data.description}</p>
            <form>
                <div style="margin-bottom: 1rem;">
                    <label for="guest-name">${data.form.nameLabel}</label><br>
                    <input type="text" id="guest-name" style="width: 100%; padding: 0.8rem; border-radius: 10px; border: 1px solid #e2e8f0;">
                </div>
                <div style="margin-bottom: 1rem;">
                    <label for="guest-message">${data.form.messageLabel}</label><br>
                    <textarea id="guest-message" rows="5" style="width: 100%; padding: 0.8rem; border-radius: 10px; border: 1px solid #e2e8f0;"></textarea>
                </div>
                <button type="submit" class="btn">${data.form.buttonText}</button>
            </form>
            <div class="guestbook-entries" style="margin-top: 2rem;">${entries}</div>
        `;
    }

    // --- Init ---
    init();
});
