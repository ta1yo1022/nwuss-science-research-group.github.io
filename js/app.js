const MICROCMS_CONFIG = {
    serviceDomain: 'nwuss-ssh',
    apiKey: 'PIDoux8MFLzwa8cLrhC7A3kBK5mEfpjP78vY'
};

const microCMS = new MicroCMSClient(MICROCMS_CONFIG.serviceDomain, MICROCMS_CONFIG.apiKey);

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function createAchievementCard(achievement) {
    const imageData = achievement.swiper_image || achievement.image;
    return `
        <article class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 h-full flex flex-col">
            ${imageData ? `
                <div class="h-48 bg-gray-200 overflow-hidden">
                    <img src="${imageData.url}" alt="${achievement.title}" class="w-full h-full object-cover hover-lift">
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

async function loadLatestAchievements() {
    try {
        const achievementsContainer = document.getElementById('achievements-container');
        if (!achievementsContainer) return;

        achievementsContainer.innerHTML = `
            <div class="bg-gray-300 rounded-lg h-80 animate-pulse"></div>
            <div class="bg-gray-300 rounded-lg h-80 animate-pulse"></div>
            <div class="bg-gray-300 rounded-lg h-80 animate-pulse"></div>
        `;

        const response = await microCMS.getAchievements(3);
        const achievements = response.contents;

        if (achievements.length === 0) {
            achievementsContainer.innerHTML = '<div class="col-span-full text-center text-gray-500">実績がまだありません</div>';
            return;
        }

        achievementsContainer.innerHTML = achievements.map(createAchievementCard).join('');
    } catch (error) {
        console.error('実績の読み込みに失敗しました:', error);
        const achievementsContainer = document.getElementById('achievements-container');
        if (achievementsContainer) {
            achievementsContainer.innerHTML = '<div class="col-span-full text-center text-red-500">実績の読み込みに失敗しました</div>';
        }
    }
}

function typeWriter(element, text, speed = 80) {
    let i = 0;
    element.innerHTML = '';
    
    function typing() {
        if (i < text.length) {
            element.innerHTML += text.charAt(i);
            i++;
            setTimeout(typing, speed);
        }
    }
    
    typing();
}

function startTypingAnimation() {
    const typingElement = document.getElementById('typing-text');
    const cursor = document.getElementById('cursor');
    
    if (typingElement) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        typeWriter(typingElement, '光らせることからはじめよう', 80);
                    }, 500);
                    observer.disconnect();
                }
            });
        }, { threshold: 0.5 });
        
        observer.observe(typingElement.parentElement);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    loadLatestAchievements();
    startTypingAnimation();
});