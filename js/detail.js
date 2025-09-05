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

function getUrlParams() {
    const urlParams = new URLSearchParams(window.location.search);
    return {
        id: urlParams.get('id'),
        type: urlParams.get('type') || 'achievement'
    };
}

function showLoading() {
    document.getElementById('loading').classList.remove('hidden');
    document.getElementById('main-content').classList.add('hidden');
    document.getElementById('error-message').classList.add('hidden');
}

function showContent() {
    document.getElementById('loading').classList.add('hidden');
    document.getElementById('main-content').classList.remove('hidden');
    document.getElementById('error-message').classList.add('hidden');
}

function showError() {
    document.getElementById('loading').classList.add('hidden');
    document.getElementById('main-content').classList.add('hidden');
    document.getElementById('error-message').classList.remove('hidden');
}

function renderContent(content, type) {
    // タイトルとメタ情報を設定
    document.getElementById('article-title').textContent = content.title;
    document.getElementById('article-date').textContent = formatDate(content.publishedAt);
    
    // ページタイトルを動的に設定
    const pageTitle = type === 'news' ? 'お知らせ' : '活動実績';
    document.getElementById('page-title').textContent = `${content.title} - ${pageTitle} - 奈良女子大学附属中等教育学校 サイエンス研究会 情報班・物理班`;

    // 説明文があれば表示
    if (content.description) {
        document.getElementById('article-description').textContent = content.description;
    } else {
        document.getElementById('article-description').style.display = 'none';
    }

    // カテゴリ（ニュースのみ）
    if (type === 'news' && content.category) {
        const categoryElement = document.getElementById('article-category');
        if (categoryElement) {
            categoryElement.textContent = content.category;
            categoryElement.parentElement.classList.remove('hidden');
        }
    }

    // メイン画像を表示
    const mainImage = content.swiper_image || content.image;
    if (mainImage) {
        document.getElementById('main-img').src = mainImage.url;
        document.getElementById('main-img').alt = content.title;
        document.getElementById('main-image').classList.remove('hidden');
    }

    // 本文を表示
    if (content.body) {
        document.getElementById('article-body').innerHTML = content.body;
    }

    // 画像ギャラリー（複数画像がある場合）
    if (content.swiper_image && content.swiper_image.length > 1) {
        const galleryContainer = document.getElementById('gallery-images');
        const galleryHtml = content.swiper_image.slice(1).map(image => `
            <div class="aspect-w-16 aspect-h-9">
                <img src="${image.url}" alt="${content.title}" class="w-full h-48 object-cover rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer" onclick="openImageModal('${image.url}', '${content.title}')">
            </div>
        `).join('');
        
        galleryContainer.innerHTML = galleryHtml;
        document.getElementById('image-gallery').classList.remove('hidden');
    }
}

function openImageModal(imageUrl, altText) {
    // シンプルな画像モーダル実装
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50';
    modal.onclick = () => modal.remove();
    
    const img = document.createElement('img');
    img.src = imageUrl;
    img.alt = altText;
    img.className = 'max-w-full max-h-full object-contain';
    img.onclick = (e) => e.stopPropagation();
    
    const closeButton = document.createElement('button');
    closeButton.innerHTML = '×';
    closeButton.className = 'absolute top-4 right-4 text-white text-4xl hover:text-gray-300';
    closeButton.onclick = () => modal.remove();
    
    modal.appendChild(img);
    modal.appendChild(closeButton);
    document.body.appendChild(modal);
}

async function loadContent() {
    const { id, type } = getUrlParams();
    
    if (!id) {
        showError();
        return;
    }

    try {
        showLoading();
        
        let content;
        if (type === 'news') {
            content = await microCMS.getNewsById(id);
        } else {
            content = await microCMS.getAchievementById(id);
        }

        renderContent(content, type);
        showContent();
        
    } catch (error) {
        console.error('コンテンツの読み込みに失敗しました:', error);
        showError();
    }
}

// ページ読み込み時に実行
document.addEventListener('DOMContentLoaded', loadContent);

// ブラウザの戻る/進むボタンでの履歴変更に対応
window.addEventListener('popstate', loadContent);