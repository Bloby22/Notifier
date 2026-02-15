const sqlite = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const logger = require('../Utils/logger');

const DB_PATH = path.join(__dirname, '..', '..', 'data', 'notifier.db');

// 📁 Třída
class Database {
    constructor() {
        this.db = null;
    }

    // 🔃 Inicializace
    async initialize() {
        return new Promise((resolve, reject) => {
            const dataDir = path.dirname(DB_PATH);
            if (!fs.existsSync(dataDir)) {
                fs.mkdirSync(dataDir, { recursive: true });
            }

            this.db = new sqlite3.Database(DB_PATH, (error) => {
                if (error) {
                    logger.error('[CHYBA] Databáze se nepřipojila:', error);
                    return reject(error);
                }

                logger.info('[INFO] Připojena databáze.');
                this.createTable().then(resolve).catch(reject);
            });
        });
    }

    // 📜 Vytvořit tabulku
    async createTable() {
        const tables = [
            `CREATE TABLE IF NOT EXISTS guilds (
                guild_id TEXT PRIMARY KEY.
                guild_name TEXT,
                created_at INTEGER DEFAULT(strftime('%s', 'now'))
            )`,
            `CREATE TABLE IF NOT EXISTS streamers (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                guild_id TEXT NOT NULL,
                username TEXT NOT NULL,
                channel_id TEXT NOT NULL,
                language TEXT NOT NULL,
                custom_message TEXT,
                created_at INTEGER DEFAULT (strftime('%s', 'now')),
                FOREIGN KEY (guild_id) REFERENCES guilds(guild_id) ON DELETE CASCADE,
                UNIQUE(guild_id, username)
            )`,
            `CREATE TABLE IF NOT EXISTS cache (
                username TEXT PRIMARY KEY,
                is_live INTEGER DEFAULT 0,
                notified INTEGER DEFAULT 0,
                last_checked INTEGER DEFAULT (strftime('%s', 'now'))
            )`
        ];

        for (const query of tables) {
            await this.run(query);
        }

        logger.info('[Databáze] Tabulka je vytvořena.');
    }

    // ⚡ Spustit SQL
    run(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.run(sql, params, function(error) {
                if (error) return reject(error);
                resolve(this);
            });
        });
    }

    // ➕ Získat
    get(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.get(sql, params, (error, row) => {
                if (error) return reject(error);
                resolve(row);
            });
        });
    }

    // 🔎 Všechno
    all(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.all(sql, params, (error, rows) => {
                if (error) return reject(error);
                resolve(rows);
            });
        });
    }

    // 🔑 Přidat streamera
    async addStreamer(guildId, username, channelId, language, customMessage) {
        const sql = `INSERT OR REPLACE INTO streamers 
                     (guild_id, username, channel_id, language, custom_message) 
                     VALUES (?, ?, ?, ?, ?)`;
        return await this.run(sql, [guildId, username, channelId, language, customMessage]);
    }

    // ❌ Odebrat streamera
    async removeSteamer(guildId, username) {
        const sql = `DELETE FROM streamers WHERE guild_id = ? AND username = ?`;
        return await this.run(sql, [guildId, username]);
    }

    // 📜 Získat GUILD
    async getGuild(guildId) {
       const sql = `SELECT * FROM streamers WHERE guild_id = ?`;
        return await this.all(sql, [guildId]); 
    }

    // 🔗 Všechny streamery
    async getAll() {
        const sql = `SELECT * FROM streamers`;
        return await this.all(sql);
    }

    // 📁 UNIQUE
    async getUnique() {
        const sql = `SELECT DISTINCT username FROM streamers`;
        const rows = await this.all(sql);
        return rows.map(r => r.slug);
    }

    // 💗 Aktualizování Cache
    async updateCache(username, isLive, notified) {
        const sql = `INSERT OR REPLACE INTO cache (username, is_live, notified, last_checked) 
                     VALUES (?, ?, ?, strftime('%s', 'now'))`;
        return await this.run(sql, [username, isLive ? 1 : 0, notified ? 1 : 0]);
    }

    async getCache(username) {
        const sql = `SELECT * FROM cache WHERE username = ?`;
        return await this.get(sql, [username]);
    }

    async clearCache(username) {
        const sql = `UPDATE cache SET is_live = 0, notified = 0 WHERE username = ?`;
        return await this.run(sql, [username]);
    }

    async addGuild(guildId, guildName) {
        const sql = `INSERT OR IGNORE INTO guilds (guild_id, guild_name) VALUES (?, ?)`;
        return await this.run(sql, [guildId, guildName]);
    }

    async close() {
        return new Promise((resolve, reject) => {
            if (!this.db) return resolve();
            this.db.close((error) => {
                if (error) return reject(error);
                logger.info('[Database] Closed');
                resolve();
            });
        });
    }
}
