const gameController = require("../controllers/game.controller");

module.exports = {
    args: true,
    usage: '<days> <Game Name>',
    name: 'sleep',
    aliases: [],
    cooldown: 5,
    description: `<Game Name> is the name that the Civ servers will send in turn notifications.
    This function will turn off turn reminders for the given numbers of days.`,
    guildOnly: false,
    args: true,
	async execute(message, args) {
        if(args.length < 2) {
            message.reply(`Type **civbot sleep days _gamename_** to sleep automated turn notifications.\n`);
            return;
        }
        let days = args.shift();
        console.log(`client.on message sleep days: ${days}\n`)
        if(isNaN(days)) {
            console.log('client.on message sleep days is NaN\n');
            message.reply('Type **civbot sleep days _gamename_** to sleep automated turn notifications.\n');
            return;
        }
        let gameName = args.join(' ');
        let gameObj = await gameController.getGameByOptions(gameController.getGameOptions(null, gameName));
        if(!gameObj) {
            message.reply(`Arguments: ${args}\nGame _**${gameName}**_ not found.`);
            return;
        }
        // let sleepTill = new Date()
        // sleepTill.setDate(sleepTill.getDate() + days);
        gameObj.sleepTill = new Date(Date.now() + (1000 * 60 * 60 * 24 * days));
        const result = await gameController.updateGame(gameObj.id, {sleepTill : gameObj.sleepTill});
        if(result[0] === 1) {
            gameObj = result[1][0];
            message.reply(`Game _**${gameName}**_ notifications slept till ${gameObj.sleepTill}\n`)
        } else {
            message.reply(`Could not sleep game named _**${gameName}**_\n`)
        }
        return;
	},
};