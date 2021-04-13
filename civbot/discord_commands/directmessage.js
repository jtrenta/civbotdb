const playerController = require("../controllers/player.controller");

module.exports = {
    args: true,
    usage: '<on/off>',
    name: 'directmessage',
    aliases: ['dm'],
    cooldown: 5,
    description: `Use this command to turn off or on notifications by direct message.`,
    guildOnly: false,
    args: true,
	async execute(message, args) {
        let dm = false;
        if(args[0] == 'on') {
            dm = true;
        }
        let playerObj = await playerController.findOrCreatePlayer(null, message.author.id);
        if(!playerObj) {
            message.reply(`Arguments: ${args}\nPlayer could not be created or found!`);
            return;
        }
        let updateObj = {};
        updateObj.id = playerObj.id;
        updateObj.notifyByDM = dm;
        let result = await playerController.updatePlayer(playerObj.id, updateObj);
        if(result[0] === 0) {
            message.reply(`Arguments: ${args}\nFailed to update player record!`);
            return;
        }
        message.reply(`You will now be notified of turns by direct message.`)
        return;
    },
};