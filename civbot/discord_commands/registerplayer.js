const gameController = require("../controllers/game.controller");
const playerController = require("../controllers/player.controller");

module.exports = {
    args: true,
    usage: '<Steam Name> <Optional:Game Name>',
    name: 'registerplayer',
    aliases: ['rp'],
    cooldown: 5,
    description: `<Steam Name> is the player name that the Civ servers will send in turn notifications.
    This function associates your Steam name with your Discord ID (creating a player record).
    <Game Name> is the game name that the Civ servers will send in turn notifications.
    If your Steam name has spaces, please use quotation marks ("example name") around it.
    If your Steam name has quotation marks in it, fuck you!`,
    guildOnly: false,
    args: true,
	async execute(message, args) {
        let steamName = '';
        let found = false;
        let gameNameStartsAt = 1;
        steamName = args[0];
        if (steamName.length < 3 || steamName.length > 80) {
            message.reply(`Arguments: ${args}\nSteam Name must be between 3 and 80 characters!`);
            return;
        }
        let gameName = '';
        if(gameNameStartsAt < args.length) {
            for(index = args.length-1;index >= gameNameStartsAt;index--) {
                gameName = args[index].concat(` ${gameName}`).trim();
            }
            if (gameName.length < 3 || gameName.length > 80) {
                message.reply(`Arguments: ${args}\nGame Name must be between 3 and 80 characters!`);
                return;
            }
        }
        console.log(`registerplayer Arguments: ${args}\nSteam Name : ${steamName} | Game Name : ${gameName}`)
        let playerObj = await playerController.findOrCreatePlayer(steamName, message.author.id);
        if(!playerObj) {
            message.reply(`Arguments: ${args}\nPlayer _**${steamName}**_ could not be created or found!`);
            return;
        }
        if(gameNameStartsAt < args.length) {
            let gameObj = await gameController.findOrCreateGame(gameName, null);
            if(!gameObj) {
                message.reply(`Arguments: ${args}\nPlayer _**${steamName}**_ created but game _**${gameName}**_ could not be created or found.`);
                return;
            }
            const result = await gameController.addPlayer(gameObj.id, playerObj.id);
            if(!result) {
                message.reply(`Arguments: ${args}\nError adding player _**${steamName}**_ to game _**${gameName}**_.`);
                return;
            }
            message.reply(`Player _**${steamName}**_ added to game _**${gameName}**_.`);
        } else {
            message.reply(`Player _**${steamName}**_ registered.`);
        }
    },
};