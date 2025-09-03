class MicroCMSClient {
    constructor(serviceDomain, apiKey) {
        this.baseURL = `https://${serviceDomain}.microcms.io/api/v1`;
        this.apiKey = apiKey;
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const headers = {
            'X-MICROCMS-API-KEY': this.apiKey,
            'Content-Type': 'application/json',
            ...options.headers
        };

        try {
            const response = await fetch(url, {
                ...options,
                headers
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('MicroCMS API Error:', error);
            throw error;
        }
    }

    async getAchievements(limit = 10, offset = 0) {
        const params = new URLSearchParams({
            limit: limit.toString(),
            offset: offset.toString(),
            orders: '-publishedAt'
        });
        return this.request(`/achievements?${params}`);
    }

    async getNews(limit = 10, offset = 0) {
        const params = new URLSearchParams({
            limit: limit.toString(),
            offset: offset.toString(),
            orders: '-publishedAt'
        });
        return this.request(`/news?${params}`);
    }

    async getAchievementById(id) {
        return this.request(`/achievements/${id}`);
    }

    async getNewsById(id) {
        return this.request(`/news/${id}`);
    }
}