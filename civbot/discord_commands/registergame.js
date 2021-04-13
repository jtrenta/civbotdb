const gameController = require("../controllers/game.controller");
const channelController = require("../controllers/channel.controller");

module.exports = {
    args: true,
    usage: '<Game Name>',
    name: 'registergame',
    aliases: ['rg'],
    cooldown: 5,
    description: `<Game Name> is the name that the Civ servers will send in turn notifications.
    This function will register the Civ game to this channel.  If the game doesn't exist it will be created.`,
    guildOnly: true,
    args: true,
	async execute(message, args) {
        let gameName = args.join(' ');
        let gameObj = await gameController.findOrCreateGame(gameName, null);
        const channelArgs = { 
            guild : message.guild.id,
            channelNum : message.channel.id,
            guildName : message.guild.name,
            channelName : message.channel.name
        }
        let channelObj = await channelController.findOrCreateChannel(channelArgs);
        let channelExists = await gameController.hasChannel(gameObj.id, channelObj.id);
        if(!channelExists) {
            gameObj = await channelController.addGame(channelObj.id, gameObj.id);
            message.channel.send(`Registering _**${gameName}**_ to this channel.`);
        } else {
            message.channel.send(`_**${gameName}**_ already registered to this channel.`);
        }
	},
};