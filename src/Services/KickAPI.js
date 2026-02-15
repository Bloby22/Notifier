const axios = require('axios');
const logger = require('../Utils/logger');

// 🔑 API KICK 
const BASE_URL = 'https://api.kick.com/public/v1';
const TIMEOUT = 5000;

class KickAPI {
    constructor() {
        this.client = axios.create({
            baseURL: BASE_URL,
            timeout: TIMEOUT,
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'Notifier/1.0'
            }
        });
    }

    // 🔗 Získání uživatele
    async getChannel(username) {
        try {
            const { data } = await this.client.get('/channels', {
                params: { user: [username] }
            });

            if (!data.data || data.data.length === 0) return null;
            return data.data[0];
        } catch (error) {
            if (error.response?.status === 404) return null;
            logger.error(`[❌ KickAPI] Chyba, nemůžu získat kanál: ${username}`);
            throw error;
        }
    }

    // ⚡ Kontrola - zda streamuje
    async isLive(username) {
        const channel = await this.getChannel(username);
            return channel?.stream?.is_live || false;
    }

    // 📜 Získání stream dat
    async getData(username) {
        const channel = await this.getChannel(username);
        if (!channel?.stream?.is_live) return null;

        // ☑️ Stream
        const stream = channel.stream;

        return {
            username: channel.username,
            broadcastId: channel.broadcast_user_id,
            title: channel.stream_title || 'No title',
            category: channel.category?.name || 'Just Chatting',
            categoryId: channel.category?.id || null,
            thumbnail: stream.thumbnail || null,
            viewers: stream.viewer_count || 0,
            isLive: stream.is_live,
            isMature: stream.is_mature || false,
            language: stream.language || 'en',
            startedAt: stream.start_time,
            tags: stream.custom_tags || [],
            url: `https://kick.com/${channel.username}`
        };
    }

    // 🔗 Timeout
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

module.exports = new KickAPI();
