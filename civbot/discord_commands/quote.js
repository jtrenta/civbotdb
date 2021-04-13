const quotes = require("../quotes");
module.exports = {
    args: false,
    usage: '',
    name: 'quote',
    aliases: ['q'],
    cooldown: 5,
    description: `This function returns a random quote from Civ VI.`,
    guildOnly: false,
	async execute(message, args) {
        let answer = `‎ ‎\n__**Random Civilization Quote**__:\n${quotes.getQuote()}\n`;
        message.reply(`${answer}`);
	},
};