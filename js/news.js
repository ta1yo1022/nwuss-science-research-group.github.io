const config = {
    domain: 'nwuss-ssh',
    key: 'PIDoux8MFLzwa8cLrhC7A3kBK5mEfpjP78vY'
};

const api = new MicroCMSClient(config.domain, config.key);
let articles = [];
let activeCategory = 'all';

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function getCategoryStyle(category) {
    return 'bg-black text-white';
}

function buildNewsCard(article) {
    const img = article.image;
    return `
        <article class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 h-full flex flex-col cursor-pointer" data-category="${article.category || ''}" onclick="location.href='news-detail.html?id=${article.id}&type=news'">
            ${img ? `
                <div class="h-48 bg-gray-200 overflow-hidden">
                    <img src="${img.url}" alt="${article.title}" class="w-full h-full object-cover">
                </div>
            ` : ''}
            <div class="p-6 flex-1 flex flex-col">
                <h2 class="text-xl font-bold text-gray-900 mb-3 line-clamp-2">${article.title}</h2>
                ${article.description ? `
                    <p class="text-gray-600 mb-4 flex-1 line-clamp-2">${article.description}</p>
                ` : ''}
                ${article.body ? `
                    <div class="text-gray-600 mb-4 flex-1 prose prose-sm line-clamp-2">
                        ${article.body.length > 100 ? article.body.substring(0, 100) + '...' : article.body}
                    </div>
                ` : ''}
                <div class="flex items-center justify-between mt-auto">
                    <span class="text-sm text-gray-500">${formatDate(article.publishedAt)}</span>
                    ${article.category && article.category.length > 0 ? `
                        <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getCategoryStyle(article.category)}">
                            ${Array.isArray(article.category) ? article.category.join(', ') : article.category}
                        </span>
                    ` : ''}
                </div>
            </div>
        </article>
    `;
}

function displayItems(items) {
    const container = document.getElementById('news-container');
    const loader = document.getElementById('loading');
    const errorMsg = document.getElementById('error-message');
    const noNews = document.getElementById('no-news');

    hideAll([loader, errorMsg, noNews, container]);

    if (items.length === 0) {
        noNews.classList.remove('hidden');
        return;
    }

    container.innerHTML = items.map(buildNewsCard).join('');
    container.classList.remove('hidden');
}

function hideAll(elements) {
    elements.forEach(el => el?.classList.add('hidden'));
}

function filterNews(category) {
    activeCategory = category;
    
    updateFilterButtons();

    let filtered = articles;
    if (category !== 'all') {
        filtered = articles.filter(article => {
            if (Array.isArray(article.category)) {
                return article.category.includes(category);
            } else {
                return article.category === category;
            }
        });
    }
    
    displayItems(filtered);
}

function updateFilterButtons() {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active', 'bg-black', 'text-white');
        btn.classList.add('text-black', 'hover:bg-gray-100');
    });
    
    const activeBtn = Array.from(document.querySelectorAll('.filter-btn')).find(btn => 
        btn.textContent.trim() === activeCategory || (activeCategory === 'all' && btn.textContent.trim() === 'すべて')
    );
    
    if (activeBtn) {
        activeBtn.classList.add('active', 'bg-black', 'text-white');
        activeBtn.classList.remove('text-black', 'hover:bg-gray-100');
    }
}

async function loadNews() {
    try {
        const loader = document.getElementById('loading');
        const errorMsg = document.getElementById('error-message');
        
        loader.classList.remove('hidden');
        errorMsg.classList.add('hidden');

        const response = await api.getNews();
        articles = response.contents;
        
        const categories = [...new Set(
            articles
                .map(news => Array.isArray(news.category) ? news.category : [news.category])
                .flat()
                .filter(cat => cat)
        )];
        
        updateCategoryButtons(categories);

        let filtered = articles;
        if (activeCategory !== 'all') {
            filtered = articles.filter(news => news.category === activeCategory);
        }

        displayItems(filtered);
    } catch (error) {
        console.error('読み込みエラー:', error);
        
        document.getElementById('loading').classList.add('hidden');
        document.getElementById('news-container').classList.add('hidden');
        document.getElementById('error-message').classList.remove('hidden');
    }
}

function updateCategoryButtons(categories) {
    const container = document.querySelector('.flex.flex-wrap.justify-center.gap-4');
    if (!container) return;
    
    const allBtn = container.querySelector('button[onclick="filterNews(\'all\')"]');
    container.innerHTML = '';
    container.appendChild(allBtn);
    
    const fixed = ['お知らせ', 'ブログ'];
    const all = [...new Set([...fixed, ...categories])];
    
    all.forEach(category => {
        const btn = document.createElement('button');
        btn.onclick = () => filterNews(category);
        btn.className = 'filter-btn px-6 py-2 rounded-full border border-black text-black hover:bg-gray-100 transition-colors';
        btn.textContent = category;
        container.appendChild(btn);
    });
}

document.addEventListener('DOMContentLoaded', function() {
    loadNews();
});

const css = document.createElement('style');
css.textContent = `
    .line-clamp-2 {
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }
    .line-clamp-3 {
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }
    .prose {
        max-width: none;
    }
    .prose p {
        margin: 0;
    }
`;
document.head.appendChild(css);