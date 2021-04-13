const gameController = require("../controllers/game.controller");
const channelController = require("../controllers/channel.controller");
const playerController = require("../controllers/player.controller");
const quotes = require("../quotes");
module.exports = {
    args: false,
    usage: '',
    name: 'info',
    aliases: ['gamestate', 'gs'],
    cooldown: 5,
    description: `This function returns all games registered to this channel.`,
    guildOnly: true,
	async execute(message, args) {
        let answer = `‎ \n__**Current Game State**__:`
        let options = channelController.getChannelOptions(null, message.guild.id, message.channel.id);
        let channelObj = await channelController.getChannelByOptions(options);
        if(!channelObj) {
            message.channel.send(`There are no games registered to this channel.`);
            return;
        }
        let condition = { '$channels.id$' : channelObj.id }
        let gamesObj = await gameController.getMultipleGamesByOptions(gameController.createGameOptions(condition));
        gamesObj.forEach(game => {
            answer = `${answer}\nIn **${game.gameName}** it has been ${playerController.discordIdString(game.currentPlayer)}'s turn for **${gameController.since(game.lastTurn)}**.`            
        });
        answer = `${answer}\n\n__**Random Civilization Quote**__:\n${quotes.getQuote()}\n`;
        message.channel.send(`${answer}`);
	},
};