const MICROCMS_CONFIG = {
    serviceDomain: 'nwuss-ssh',
    apiKey: 'PIDoux8MFLzwa8cLrhC7A3kBK5mEfpjP78vY'
};

const microCMS = new MicroCMSClient(MICROCMS_CONFIG.serviceDomain, MICROCMS_CONFIG.apiKey);

let allNews = [];
let currentFilter = 'all';

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function createNewsCard(news) {
    const imageData = news.image;
    return `
        <article class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 h-full flex flex-col cursor-pointer" data-category="${news.category || ''}" onclick="location.href='news-detail.html?id=${news.id}&type=news'">
            ${imageData ? `
                <div class="h-48 bg-gray-200 overflow-hidden">
                    <img src="${imageData.url}" alt="${news.title}" class="w-full h-full object-cover">
                </div>
            ` : ''}
            <div class="p-6 flex-1 flex flex-col">
                <h2 class="text-xl font-bold text-gray-900 mb-3 line-clamp-2">${news.title}</h2>
                ${news.description ? `
                    <p class="text-gray-600 mb-4 flex-1 line-clamp-2">${news.description}</p>
                ` : ''}
                ${news.body ? `
                    <div class="text-gray-600 mb-4 flex-1 prose prose-sm line-clamp-2">
                        ${news.body.length > 100 ? news.body.substring(0, 100) + '...' : news.body}
                    </div>
                ` : ''}
                <div class="flex items-center justify-between mt-auto">
                    <span class="text-sm text-gray-500">${formatDate(news.publishedAt)}</span>
                    ${news.category && news.category.length > 0 ? `
                        <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-800">
                            ${Array.isArray(news.category) ? news.category.join(', ') : news.category}
                        </span>
                    ` : ''}
                </div>
            </div>
        </article>
    `;
}

function displayNews(newsItems) {
    const container = document.getElementById('news-container');
    const loading = document.getElementById('loading');
    const errorMessage = document.getElementById('error-message');
    const noNews = document.getElementById('no-news');

    // すべての表示要素を隠す
    loading.classList.add('hidden');
    errorMessage.classList.add('hidden');
    noNews.classList.add('hidden');
    container.classList.add('hidden');

    if (newsItems.length === 0) {
        noNews.classList.remove('hidden');
        return;
    }

    container.innerHTML = newsItems.map(createNewsCard).join('');
    container.classList.remove('hidden');
}

function filterNews(category) {
    currentFilter = category;
    
    // デバッグ用ログ
    console.log('フィルター対象カテゴリ:', category);
    console.log('全ニュース数:', allNews.length);
    console.log('各ニュースのカテゴリ:', allNews.map(news => ({ title: news.title, category: news.category })));
    
    // フィルターボタンのアクティブ状態を更新
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active', 'bg-black', 'text-white');
        btn.classList.add('text-black', 'hover:bg-gray-100');
    });
    
    // アクティブボタンを見つけて更新
    const activeBtn = Array.from(document.querySelectorAll('.filter-btn')).find(btn => 
        btn.textContent.trim() === category || (category === 'all' && btn.textContent.trim() === 'すべて')
    );
    
    if (activeBtn) {
        activeBtn.classList.add('active', 'bg-black', 'text-white');
        activeBtn.classList.remove('text-black', 'hover:bg-gray-100');
    }

    // ニュースをフィルタリング（配列対応）
    let filteredNews = allNews;
    if (category !== 'all') {
        filteredNews = allNews.filter(news => {
            if (Array.isArray(news.category)) {
                return news.category.includes(category);
            } else {
                return news.category === category;
            }
        });
    }
    
    console.log('フィルター後のニュース数:', filteredNews.length);
    displayNews(filteredNews);
}

async function loadNews() {
    try {
        const loading = document.getElementById('loading');
        const errorMessage = document.getElementById('error-message');
        
        // ローディング表示
        loading.classList.remove('hidden');
        errorMessage.classList.add('hidden');

        // ニュースを取得
        const response = await microCMS.getNews();
        allNews = response.contents;

        // デバッグ: 完全なJSONレスポンスを確認
        console.log('完全なAPIレスポンス:', response);
        console.log('ニュースデータ:', allNews);
        
        // 各ニュースの詳細を確認
        allNews.forEach((news, index) => {
            console.log(`ニュース ${index + 1}:`, {
                title: news.title,
                category: news.category,
                categoryType: typeof news.category,
                rawData: news
            });
        });

        // デバッグ: 利用可能なカテゴリを確認（配列対応）
        const categories = [...new Set(
            allNews
                .map(news => Array.isArray(news.category) ? news.category : [news.category])
                .flat()
                .filter(cat => cat)
        )];
        console.log('利用可能なカテゴリ:', categories);
        
        // カテゴリボタンを動的に更新
        updateCategoryButtons(categories);

        // フィルタリングして表示
        let filteredNews = allNews;
        if (currentFilter !== 'all') {
            filteredNews = allNews.filter(news => news.category === currentFilter);
        }

        displayNews(filteredNews);
    } catch (error) {
        console.error('ニュースの読み込みに失敗しました:', error);
        
        // エラー表示
        document.getElementById('loading').classList.add('hidden');
        document.getElementById('news-container').classList.add('hidden');
        document.getElementById('error-message').classList.remove('hidden');
    }
}

function updateCategoryButtons(categories) {
    const filterContainer = document.querySelector('.flex.flex-wrap.justify-center.gap-4');
    if (!filterContainer) return;
    
    // すべてボタンは残す
    const allButton = filterContainer.querySelector('button[onclick="filterNews(\'all\')"]');
    filterContainer.innerHTML = '';
    filterContainer.appendChild(allButton);
    
    // 固定カテゴリ（お知らせとブログ）を必ず表示
    const fixedCategories = ['お知らせ', 'ブログ'];
    
    // 固定カテゴリと実際のカテゴリを統合（重複排除）
    const allCategories = [...new Set([...fixedCategories, ...categories])];
    
    // カテゴリボタンを追加
    allCategories.forEach(category => {
        const button = document.createElement('button');
        button.onclick = () => filterNews(category);
        button.className = 'filter-btn px-6 py-2 rounded-full border border-black text-black hover:bg-gray-100 transition-colors';
        button.textContent = category;
        filterContainer.appendChild(button);
    });
}

// ページ読み込み時にニュースを取得
document.addEventListener('DOMContentLoaded', function() {
    loadNews();
});

// ユーティリティ関数: テキストの行数制限用CSS
const style = document.createElement('style');
style.textContent = `
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
document.head.appendChild(style);