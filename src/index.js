const { Client, GatewayIntentBits, Collection, Partials } = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// 🔋 Manager
const logger = require('./utils/logger');
const streamChecker = require('./services/streamChecker');
const database = require('./sql/database');

// 💎 Proměny
const TOKEN = process.env.BOT;

// 📃 Client
const client = new Client({
  intents: Object.keys(GatewayIntentBits).map(k => GatewayIntentBits[k]),
  partials: Object.keys(Partials).map(k => Partials[k])
});

// 🦺 Kolekce
client.commands = new Collection();
client.events = new Collection();

// 📰 Příkazy
const loadCommands = () => {
  const folders = fs.readdirSync(path.join(__dirname, 'commands'));
  for (const folder of folders) {
    const files = fs.readdirSync(path.join(__dirname, 'commands', folder)).filter(f => f.endsWith('.js'));
    for (const file of files) {
      const cmd = require(`./commands/${folder}/${file}`);
      if (cmd.data) client.commands.set(cmd.data.name, cmd);
    }
  }
};

// 🚨 Eventy
const loadEvents = () => {
  const files = fs.readdirSync(path.join(__dirname, 'events')).filter(f => f.endsWith('.js'));
  for (const file of files) {
    const event = require(`./events/${file}`);
    client[event.once ? 'once' : 'on'](event.name, (...args) => event.execute(...args, client));
  }
};

// 🚧 Databáze
database.initialize().then(() => {
  loadCommands();
  loadEvents();
  client.login(TOKEN);
});
