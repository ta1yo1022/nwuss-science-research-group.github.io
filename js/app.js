const config = {
    domain: 'nwuss-ssh',
    key: 'PIDoux8MFLzwa8cLrhC7A3kBK5mEfpjP78vY'
};

const client = new MicroCMSClient(config.domain, config.key);

function formatDate(date) {
    return new Date(date).toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function buildCard(item) {
    const img = item.swiper_image || item.image;
    return `
        <article class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 h-full flex flex-col cursor-pointer" onclick="location.href='achievement-detail.html?id=${item.id}&type=achievement'">
            ${img ? `
                <div class="h-48 bg-gray-200 overflow-hidden">
                    <img src="${img.url}" alt="${item.title}" class="w-full h-full object-cover">
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

async function loadRecentItems() {
    try {
        const container = document.getElementById('achievements-container');
        const loader = document.getElementById('loading');
        if (!container || !loader) return;

        loader.classList.remove('hidden');
        container.classList.add('hidden');

        const data = await client.getAchievements(3);
        const items = data.contents;

        loader.classList.add('hidden');
        container.classList.remove('hidden');

        if (items.length === 0) {
            container.innerHTML = '<div class="col-span-full text-center text-gray-500">実績がまだありません</div>';
            return;
        }

        container.innerHTML = items.map(buildCard).join('');
    } catch (error) {
        console.error('読み込みエラー:', error);
        const container = document.getElementById('achievements-container');
        const loader = document.getElementById('loading');
        
        if (loader) loader.classList.add('hidden');
        if (container) {
            container.classList.remove('hidden');
            container.innerHTML = '<div class="col-span-full text-center text-red-500">該当する活動実績が見つかりません<br><span class="text-gray-600 text-sm">しばらく時間をおいて再度お試しください。</span></div>';
        }
    }
}

function startTyping(element, text, delay = 80) {
    let i = 0;
    element.innerHTML = '';
    
    function type() {
        if (i < text.length) {
            element.innerHTML += text.charAt(i);
            i++;
            setTimeout(type, delay);
        }
    }
    
    type();
}

function initTypingEffect() {
    const el = document.getElementById('typing-text');
    
    if (el) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        startTyping(el, '光らせることからはじめよう', 80);
                    }, 500);
                    observer.disconnect();
                }
            });
        }, { threshold: 0.5 });
        
        observer.observe(el.parentElement);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    loadRecentItems();
    initTypingEffect();
});