require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const readline = require('readline');

// ==========================================
// 👇 YOUR DETAILS
// ==========================================
const BOT_TOKEN = process.env.BOT_TOKEN;
// ==========================================

// Database Simulation — map each tag to a Telegram chat ID via .env
const PASSENGER_DB = {
  '001': process.env.CHAT_ID_001,
  '002': process.env.CHAT_ID_002,
  '003': process.env.CHAT_ID_003,
  '004': process.env.CHAT_ID_004,
  '005': process.env.CHAT_ID_005,
};

// --- 1. TELEGRAM BOT SETUP ---
const bot = new TelegramBot(BOT_TOKEN, { polling: true });

bot.onText(/\/start/, (msg) => {
  const userName = msg.from.first_name || 'Passenger';
  bot.sendMessage(
    msg.chat.id,
    `Hello ${userName}!\n\nWe are currently checking your bag status. Please wait for updates here.`
  );
});

bot.on('polling_error', (err) => {
  console.error('❌ Polling error:', err.message);
});

console.log('🤖 Telegram Bot is listening for /start commands...');

const os = require('os');

function getLocalIpAddress() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost'; // Fallback
}

// --- 2. ALERT FUNCTION ---
function sendTelegramAlert(chatId, tagId) {
  console.log(`📡 Attempting to contact Passenger ${chatId}...`);

  const ipAddress = getLocalIpAddress();

  const message =
    `LEBAG ALERT: Your bag (ID: ${tagId}) is now 2 minutes away from collection!\n\n` +
    `View status here: http://${ipAddress}:3000`; // Assuming npx serve uses port 3000

  bot.sendMessage(chatId, message)
    .then(() => console.log('✅ SUCCESS: Notification sent to phone!'))
    .catch((err) => console.error('❌ FAILED:', err.message));
}

// --- 3. INTERACTIVE SCANNER LOOP ---
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

console.log('\n-------------------------------------------------');
console.log('🤖 BAGGAGE SYSTEM SIMULATION STARTED');
console.log("   Tags: TAG_001 | TAG_002 | TAG_003 | TAG_004 | TAG_005");
console.log('-------------------------------------------------');

function promptScan() {
  rl.question('\n🔎 Enter a Tag ID to scan: ', (scannedTag) => {
    const tag = scannedTag.trim();

    if (tag === '') {
      // Skip empty input
      promptScan();
    } else if (tag.toLowerCase() === 'exit') {
      console.log('\nShutting down...');
      rl.close();
      bot.stopPolling();
      process.exit(0);
    } else if (PASSENGER_DB[tag]) {
      const userId = PASSENGER_DB[tag];
      console.log(`👤 OWNER FOUND! Belongs to ID ${userId}`);
      sendTelegramAlert(userId, tag);
      promptScan();
    } else {
      console.log(`⚠️  UNKNOWN BAG: Tag '${tag}' is not in the database.`);
      promptScan();
    }
  });
}

promptScan();
