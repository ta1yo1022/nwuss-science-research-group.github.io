const config = {
    domain: 'nwuss-ssh',
    key: 'PIDoux8MFLzwa8cLrhC7A3kBK5mEfpjP78vY'
};

const api = new MicroCMSClient(config.domain, config.key);
let items = [];
let filter = 'all';

document.addEventListener('DOMContentLoaded', function () {
    loadItems();
});

async function loadItems() {
    try {
        const loader = document.getElementById('loading');
        const container = document.getElementById('achievements-container');
        const errorMsg = document.getElementById('error-message');
        const noItems = document.getElementById('no-achievements');

        showLoader();
        hideElements([container, errorMsg, noItems]);

        const response = await api.getAchievements(50);
        items = response.contents || [];

        showItems(items);
        showContainer();
    } catch (error) {
        console.error('読み込み失敗:', error);
        items = [];
        showItems(items);
        showContainer();
    }
}

function showItems(data) {
    const container = document.getElementById('achievements-container');
    if (data.length === 0) {
        document.getElementById('no-achievements').classList.remove('hidden');
        return;
    }
    container.innerHTML = data.map(buildItemCard).join('');
}

function showLoader() {
    document.getElementById('loading').classList.remove('hidden');
}

function showContainer() {
    hideElements([document.getElementById('loading')]);
    document.getElementById('achievements-container').classList.remove('hidden');
}

function hideElements(elements) {
    elements.forEach(el => el?.classList.add('hidden'));
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function buildItemCard(item) {
    const image = item.image || item.swiper_image;

    return `
        <article class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 h-full flex flex-col cursor-pointer" onclick="location.href='achievement-detail.html?id=${item.id}&type=achievement'">
            ${image ? `
                <div class="h-48 bg-gray-200 overflow-hidden">
                    <img src="${image.url}" alt="${item.title}" class="w-full h-full object-cover">
                </div>
            ` : ''}
            <div class="p-6 flex-1 flex flex-col">
                <h2 class="text-xl font-bold text-gray-900 mb-3 line-clamp-2">${item.title}</h2>
                ${item.description ? `
                    <p class="text-gray-600 mb-4 flex-1 line-clamp-2">${item.description}</p>
                ` : ''}
                ${item.body ? `
                    <div class="text-gray-600 mb-4 flex-1 prose prose-sm line-clamp-2">
                        ${item.body.length > 100 ? item.body.substring(0, 100) + '...' : item.body}
                    </div>
                ` : ''}
                <div class="flex items-center justify-between mt-auto">
                    <span class="text-sm text-gray-500">${formatDate(item.publishedAt)}</span>
                </div>
            </div>
        </article>
    `;
}

const styles = document.createElement('style');
styles.textContent = `
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
document.head.appendChild(styles);