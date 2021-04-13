const gameController = require("../controllers/game.controller");
const channelController = require("../controllers/channel.controller");

module.exports = {
    args: true,
    usage: '<Game Name>',
    name: 'unregistergame',
    aliases: ['ug'],
    cooldown: 5,
    description: `<Game Name> is the name that the Civ servers will send in turn notifications.
    This function will unregister the Civ game to this channel.`,
    guildOnly: true,
    args: true,
	async execute(message, args) {
        let gameName = args.join(' ');
        let gameObj = await gameController.getGameByOptions(gameController.getGameOptions(null, gameName));
        let channelObj = await channelController.getChannelByOptions(channelController.getChannelOptions(null, message.guild.id, message.channel.id));
        let channelExists = await gameController.hasChannel(gameObj.id, channelObj.id);
        if(channelExists) {
            let result = await channelController.removeGame(channelObj.id, gameObj.id);
            if(result == 1) {
                message.channel.send(`Unregistering _**${gameName}**_ from this channel.`);
            } else {
                message.channel.send(`_**${gameName}**_ was not unregistered from this channel.`);
            }
        } else {
            message.channel.send(`_**${gameName}**_ is not registered to this channel.`);
        }
	},
};