// @ts-check
const TelegramBot = require('node-telegram-bot-api');
const utils = require("../utils");
const { addRow } = require('../google/sheets');


const bot = new TelegramBot(process.env.TELEGRAM_TOKEN ?? '', { polling: true });

/**
 * @param {number} chatId
 * @param {string} errorMessage
 * @returns {void}
 */
function handleError(chatId, errorMessage) {
  bot.sendMessage(chatId, `ERROR: ${errorMessage}`);
  console.error(errorMessage);
}

function startupBot() {
  console.log("Starting up bot polling...")

  bot.onText(/\/start/, (msg) => {
    bot.sendMessage(msg.chat.id, 'Welcome! Send me a receipt and I will process it for you.');
  });

  bot.on('message', async (msg) => {
    const user = msg.from

    if (!user) {
      /** this error will probably never happen but, if it happens, we can
       later on we can offer to the user "do you want to proceed anyways?". this
       would mean parsing the receipt but not saving to db */
      handleError(msg.chat.id, 'Failed to get user info')
      return
    }

    if (msg.photo) {
      try {
        const fileId = msg.photo[msg.photo.length - 1].file_id;
        const file = await bot.getFile(fileId);
        const fileUrl = `https://api.telegram.org/file/bot${process.env.TELEGRAM_TOKEN}/${file.file_path}`;
        await utils.downloadImage(fileUrl, '../../receipts');

        const result = await utils.processReceipt('../../receipts');

        if (result) {
          bot.sendMessage(msg.chat.id, `Order total is: ${result}.\n Saving result into the database...`);

          const currentDate = new Date().toLocaleDateString('pt-BR');
          const appendSuccess = await addRow(user.id, [currentDate, result])

          if (appendSuccess) {
            // TODO: supply link to the spreadsheet
            bot.sendMessage(msg.chat.id, `Order total successfully added to DB.`);
          } else {
            bot.sendMessage(msg.chat.id, `Failed to add order total to DB.`);
          }
        } else {
          handleError(msg.chat.id, 'Unable to process the image.');
        }
      } catch (error) {
        handleError(msg.chat.id, 'Unable to process the image.');
      }
    }
  });
}

module.exports = {bot, startupBot};

