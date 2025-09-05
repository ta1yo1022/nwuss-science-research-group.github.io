const MICROCMS_CONFIG = {
    serviceDomain: 'nwuss-ssh',
    apiKey: 'PIDoux8MFLzwa8cLrhC7A3kBK5mEfpjP78vY'
};

const microCMS = new MicroCMSClient(MICROCMS_CONFIG.serviceDomain, MICROCMS_CONFIG.apiKey);

let allAchievements = [];
let currentFilter = 'all';

// ページ読み込み時の初期化
document.addEventListener('DOMContentLoaded', function () {
    loadAchievements();
});

// 活動実績を読み込む関数
async function loadAchievements() {
    try {
        const loading = document.getElementById('loading');
        const container = document.getElementById('achievements-container');
        const errorMessage = document.getElementById('error-message');
        const noAchievements = document.getElementById('no-achievements');

        // ローディング表示
        loading.classList.remove('hidden');
        container.classList.add('hidden');
        errorMessage.classList.add('hidden');
        noAchievements.classList.add('hidden');

        // 活動実績を取得
        const response = await microCMS.getAchievements(50);
        allAchievements = response.contents || [];

        // デバッグ: 完全なJSONレスポンスを確認
        console.log('完全なAPIレスポンス:', response);
        console.log('活動実績データ:', allAchievements);

        // 各実績の詳細を確認
        allAchievements.forEach((achievement, index) => {
            console.log(`活動実績 ${index + 1}:`, {
                title: achievement.title,
                category: achievement.category,
                description: achievement.description,
                rawData: achievement
            });
        });

        // 全ての活動実績を表示（フィルタリングなし）
        displayAchievements(allAchievements);
        loading.classList.add('hidden');
        container.classList.remove('hidden');
    } catch (error) {
        console.error('活動実績の読み込みに失敗しました:', error);

        // エラー時はサンプルデータを使用
        allAchievements = getSampleData();
        displayAchievements(allAchievements);

        // エラー表示の代わりにサンプルデータで継続
        document.getElementById('loading').classList.add('hidden');
        document.getElementById('achievements-container').classList.remove('hidden');
    }
}

function displayAchievements(achievements) {
    const container = document.getElementById('achievements-container');
    const loading = document.getElementById('loading');
    const errorMessage = document.getElementById('error-message');
    const noAchievements = document.getElementById('no-achievements');

    // すべての表示要素を隠す
    loading.classList.add('hidden');
    errorMessage.classList.add('hidden');
    noAchievements.classList.add('hidden');
    container.classList.add('hidden');

    if (achievements.length === 0) {
        noAchievements.classList.remove('hidden');
        return;
    }

    container.innerHTML = achievements.map(createAchievementCard).join('');
    container.classList.remove('hidden');
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function createAchievementCard(achievement) {
    const imageData = achievement.image || achievement.swiper_image;

    return `
        <article class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 h-full flex flex-col cursor-pointer" onclick="location.href='achievement-detail.html?id=${achievement.id}&type=achievement'">
            ${imageData ? `
                <div class="h-48 bg-gray-200 overflow-hidden">
                    <img src="${imageData.url}" alt="${achievement.title}" class="w-full h-full object-cover">
                </div>
            ` : ''}
            <div class="p-6 flex-1 flex flex-col">
                <h2 class="text-xl font-bold text-gray-900 mb-3 line-clamp-2">${achievement.title}</h2>
                ${achievement.description ? `
                    <p class="text-gray-600 mb-4 flex-1 line-clamp-2">${achievement.description}</p>
                ` : ''}
                ${achievement.body ? `
                    <div class="text-gray-600 mb-4 flex-1 prose prose-sm line-clamp-2">
                        ${achievement.body.length > 100 ? achievement.body.substring(0, 100) + '...' : achievement.body}
                    </div>
                ` : ''}
                <div class="flex items-center justify-between mt-auto">
                    <span class="text-sm text-gray-500">${formatDate(achievement.publishedAt)}</span>
                </div>
            </div>
        </article>
    `;
}

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
    .hover-lift {
        transition: transform 0.2s ease-in-out;
    }
    .hover-lift:hover {
        transform: translateY(-2px);
    }
`;
document.head.appendChild(style);
