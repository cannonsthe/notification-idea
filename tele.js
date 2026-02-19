const TelegramBot = require('node-telegram-bot-api');
const readline = require('readline');
const https = require('https');

// ==========================================
// 👇 YOUR DETAILS
// ==========================================
const BOT_TOKEN = '8451047315:AAFuz_5Nfup5qJGT_SzwI5AHs6XHLi_iTFc';
const MY_CHAT_ID = '526465552';
// ==========================================

// Database Simulation
const PASSENGER_DB = {
  'TAG_001': MY_CHAT_ID,
  'TAG_002': '987654321',
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

// --- 2. ALERT FUNCTION ---
function sendTelegramAlert(chatId, tagId) {
  console.log(`📡 Attempting to contact Passenger ${chatId}...`);

  const message =
    `LEBAG ALERT: Your bag (ID: ${tagId}) is now 2 minutes away from collection!\n\n` +
    `View status here: http://10.185.186.32:8501`;

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
console.log("   (Type 'TAG_001' to test)");
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
