const TelegramBot = require('node-telegram-bot-api');
const utils = require("../../utils");


const bot = new TelegramBot(process.env.TELEGRAM_TOKEN, { polling: true });

function startupBot() {
  console.log("Starting up bot polling...")

  bot.onText(/\/start/, (msg) => {
    bot.sendMessage(msg.chat.id, 'Welcome! Send me a receipt and I will process it for you.');
  });

  bot.on('message', async (msg) => {
    if (msg.photo) {
      try {
        const fileId = msg.photo[msg.photo.length - 1].file_id;
        const file = await bot.getFile(fileId);
        const fileUrl = `https://api.telegram.org/file/bot${process.env.TELEGRAM_TOKEN}/${file.file_path}`;
        await utils.downloadImage(fileUrl, '../../receipts');

        const result = await utils.processReceipt('../../receipts');

        if (result) {
          bot.sendMessage(msg.chat.id, `O valor total da nota é: ${result}`);
        } else {
          bot.sendMessage(msg.chat.id, 'Error: Unable to process the image.');
        }
      } catch (error) {
        bot.sendMessage(msg.chat.id, 'Error: Unable to process the image.');
        console.error(error);
      }
    }
  });
}

module.exports = {bot, startupBot};

