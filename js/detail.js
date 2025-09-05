const config = {
    domain: 'nwuss-ssh',
    key: 'PIDoux8MFLzwa8cLrhC7A3kBK5mEfpjP78vY'
};

const client = new MicroCMSClient(config.domain, config.key);

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function getParams() {
    const params = new URLSearchParams(window.location.search);
    return {
        id: params.get('id'),
        type: params.get('type') || 'achievement'
    };
}

function showLoader() {
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

function renderData(data, type) {
    const titleEl = document.getElementById('article-title');
    const dateEl = document.getElementById('article-date');
    const pageTitleEl = document.getElementById('page-title');
    const descEl = document.getElementById('article-description');
    
    if (titleEl) titleEl.textContent = data.title;
    if (dateEl) dateEl.textContent = formatDate(data.publishedAt);
    
    const section = type === 'news' ? 'お知らせ' : '活動実績';
    if (pageTitleEl) pageTitleEl.textContent = `${data.title} - ${section} - 奈良女子大学附属中等教育学校 サイエンス研究会 情報班・物理班`;

    if (descEl) {
        if (data.description) {
            descEl.textContent = data.description;
        } else {
            descEl.style.display = 'none';
        }
    }

    if (type === 'news' && data.category) {
        const badge = document.getElementById('article-category');
        if (badge) {
            badge.textContent = data.category;
            if (badge.parentElement) badge.parentElement.classList.remove('hidden');
        }
    }

    const mainImg = data.swiper_image || data.image;
    if (mainImg) {
        const mainImgEl = document.getElementById('main-img');
        const mainImageEl = document.getElementById('main-image');
        if (mainImgEl) {
            mainImgEl.src = mainImg.url;
            mainImgEl.alt = data.title;
        }
        if (mainImageEl) mainImageEl.classList.remove('hidden');
    }

    const bodyEl = document.getElementById('article-body');
    if (data.body && bodyEl) {
        bodyEl.innerHTML = data.body;
    }

    if (data.swiper_image && data.swiper_image.length > 1) {
        const gallery = document.getElementById('gallery-images');
        const imageGalleryEl = document.getElementById('image-gallery');
        if (gallery && imageGalleryEl) {
            const html = data.swiper_image.slice(1).map(img => `
                <div class="aspect-w-16 aspect-h-9">
                    <img src="${img.url}" alt="${data.title}" class="w-full h-48 object-cover rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer" onclick="openModal('${img.url}', '${data.title}')">
                </div>
            `).join('');
            
            gallery.innerHTML = html;
            imageGalleryEl.classList.remove('hidden');
        }
    }
}

function openModal(url, alt) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50';
    modal.onclick = () => modal.remove();
    
    const img = document.createElement('img');
    img.src = url;
    img.alt = alt;
    img.className = 'max-w-full max-h-full object-contain';
    img.onclick = (e) => e.stopPropagation();
    
    const close = document.createElement('button');
    close.innerHTML = '×';
    close.className = 'absolute top-4 right-4 text-white text-4xl hover:text-gray-300';
    close.onclick = () => modal.remove();
    
    modal.appendChild(img);
    modal.appendChild(close);
    document.body.appendChild(modal);
}

async function loadData() {
    const { id, type } = getParams();
    
    if (!id) {
        showError();
        return;
    }

    try {
        showLoader();
        
        let content;
        if (type === 'news') {
            content = await client.getNewsById(id);
        } else {
            content = await client.getAchievementById(id);
        }

        renderData(content, type);
        showContent();
        
    } catch (error) {
        console.error('読み込みエラー:', error);
        showError();
    }
}

document.addEventListener('DOMContentLoaded', loadData);
window.addEventListener('popstate', loadData);