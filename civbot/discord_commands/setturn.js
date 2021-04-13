const gameController = require("../controllers/game.controller");
const playerController = require("../controllers/player.controller");

module.exports = {
    args: true,
    usage: '<Discord Name/Steam Name> <Game Name>',
    name: 'setturn',
    aliases: ['set_turn'],
    cooldown: 5,
    description: `This function sets the current turn in <Game Name> to the player named <Steam Name>.
    This command takes either a Discord user (using the @ symbol) or a Steam Name as its first argument.
    If the Steam name has spaces, please use quotation marks ("example name") around it.`,
    guildOnly: true,
	async execute(message, args) {
        let steamName = null;
        let playerObj = null;
        let gameObj = null;
        let discordId = null;
        if(args[0].startsWith('<')) {
            discordId = args[0]
            discordId = discordId.replace('@','')
            discordId = discordId.replace('<','')
            discordId = discordId.replace('>','')
            discordId = discordId.replace('!','')
            playerObj = await playerController.getPlayerByOptions(playerController.getPlayerOptions(null, null, discordId));
        } 
        if(!playerObj) {
            steamName = args[0];
            if (steamName.length < 3 || steamName.length > 80) {
                message.channel.send(`Arguments: ${args}\nSteam Name must be between 3 and 80 characters!`);
                return;
            }
            playerObj = await playerController.getPlayerByOptions(playerController.getPlayerOptions(null, steamName, null));
        }
        if(!playerObj) {
            message.channel.send(`Arguments: ${args}\nPlayer _**${args[0]}**_ could not be found!`);
            return;
        }
        let gameName = '';
        if(args.length > 1) {
            for(index = args.length-1;index >= 1;index--) {
                gameName = args[index].concat(` ${gameName}`).trim();
            }
            if (gameName.length < 3 || gameName.length > 80) {
                message.channel.send(`Arguments: ${args}\nGame Name must be between 3 and 80 characters!`);
                return;
            }
            console.log(`setturn Arguments: ${args}\nName : ${playerObj.steamName} | Game Name : ${gameName}`)
            gameObj = await gameController.getGameByOptions(gameController.getGameOptions(null, gameName));
            if(!gameObj) {
                message.channel.send(`Arguments: ${args}\nGame _**${gameName}**_ could not be found.`);
                return;
            }
            let updateObj = {};
            updateObj.currentPlayerId = playerObj.id;
            updateObj.lastTurn = new Date();
            updateObj.lastNag = new Date();
            const result = await gameController.updateGame(gameObj.id, updateObj);
            if(result[0] === 0) {
                message.channel.send(`Arguments: ${args}\nError setting turn to player _**${playerObj.steamName}**_ in game _**${gameName}**_.`);
                return;
            }
            message.channel.send(`Current turn in game _**${gameName}**_ set to player _**${playerObj.steamName}**_.`);
        } else {
            message.channel.send(`Arguments: ${args}\nTurn not set, missing game name.`);
        }
    },
};