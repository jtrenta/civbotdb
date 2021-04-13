const gameController = require('./game.controller');
const playerController = require('./player.controller');
const client = require('../bot');
let lastTurnReceived = {};

// Create and Save a new Player
exports.base = async (req, res, next) => {
    res.render('index', { title: 'Express' });
    return;  
}

exports.processMessage = async (req, res) => {
    try {
        console.log(`app.post - req.body:${JSON.stringify(req.body)}`);
        if (req.body.value1 === undefined || req.body.value1 === undefined || req.body.value3 === undefined ) {
            console.error('app.post - no body');
            res.status(400).send({
                message: "No req.body in request!"
            });
            return;
        }
        if (JSON.stringify(lastTurnReceived) == JSON.stringify(req.body)) {
            console.log('app.post - duplicate request');
            res.status(400).send({
                message: "Duplicate request!"
            });
            return;
        }
        lastTurnReceived = req.body;
        let guildObj, channelObj;
        const gameName = req.body.value1
        const playerName = req.body.value2
        const turnNumber = req.body.value3
        let gameObj = await gameController.findOrCreateGame(gameName);
        const playerObj = await playerController.findOrCreatePlayer(playerName);
        let playerExists = await gameController.hasPlayer(gameObj.id, playerObj.id);
        if(!playerExists) {
            await gameController.addPlayer(gameObj.id, playerObj.id);
        }
        let updateObj = {}
        updateObj.id = gameObj.id;
        updateObj.currentPlayerId = playerObj.id;
        updateObj.turnNumber = turnNumber;
        updateObj.lastTurn = new Date();
        updateObj.lastNag = new Date();
        const result = await gameController.updateGame(gameObj.id, updateObj);
        if(result[0] === 1) {
            console.log(`processMessage: Game ${gameObj.gameName} updated successfully.`)
        } else {
            console.warn(`processMessage: Game ${gameObj.gameName} was not updated successfully!`)
            res.end();
        }
        let content = `Hey ${playerController.discordIdString(playerObj)}, it's time to take turn **#${turnNumber}** in **${gameName}**!`
        let channels = await gameController.getChannels(gameObj.id);
        for (index = 0; index < channels.length; index++) {
            guildObj = client.guilds.cache.get(channels[index].guild);
            channelObj = guildObj.channels.cache.get(channels[index].channelNum);
            channelObj.send(content);
        }
        if(playerObj.notifyByDM) {
            userObj = client.users.cache.get(playerObj.discordId);
            if(!userObj) {
                userObj = client.users.fetch(playerObj.discordId, true, true);
            }
            if(userObj) userObj.send(content)
        }
    res.end();
    }
    catch(err) {
    res.status(500).send({
            message: `processMessage error: ${err}` || "Unknown error occurred in processMessage."
        });
    }
    return;

};

exports.checkForTurnReminders = async (req, res) => {
    try {
        let games = await gameController.getAllGamesNeedingReminders();
        let content, gameObj, guildObj, channelObj, playerObj, header;
        let sentHeaderList = [];
        header = '‎__**Automated turn reminder**__\n';
        console.log(`checkForTurnReminders - lastTurnReceived:${JSON.stringify(lastTurnReceived)}`);
        for (gameIndex = 0; gameIndex < games.length; gameIndex++) {
            gameObj = games[gameIndex];
            playerObj = await playerController.getPlayerByOptions(playerController.getPlayerOptions(gameObj.currentPlayerId));
            content = `In **${gameObj.gameName}** it has been ${playerController.discordIdString(playerObj)}'s turn for **${gameController.since(gameObj.lastTurn)}**.\n`
            for (channelIndex = 0; channelIndex < gameObj.channels.length; channelIndex++) {
                guildObj = client.guilds.cache.get(gameObj.channels[channelIndex].guild);
                channelObj = guildObj.channels.cache.get(gameObj.channels[channelIndex].channelNum);
                if(!sentHeaderList.includes(channelObj)) {
                    channelObj.send(header);
                    sentHeaderList.push(channelObj);
                }
                channelObj.send(content);
            }
            let updateObj = {};
            updateObj.id = gameObj.id;
            updateObj.lastNag = new Date();
            const result = await gameController.updateGame(gameObj.id, updateObj);
            if(result[0] === 1) {
                console.log(`checkForTurnReminders: Game ${gameObj.gameName} updated successfully.`)
            } else {
                console.warn(`checkForTurnReminders: Game ${gameObj.gameName} was not updated successfully!`)
                res.sendStatus(280);
            }
            if(playerObj.notifyByDM) {
                userObj = client.users.cache.get(playerObj.discordId);
                if(!userObj) {
                    userObj = client.users.fetch(playerObj.discordId, true, true);
                }
                if(userObj) userObj.send(content)
            }
        }
        res.sendStatus(280);
    }
    catch(err) {
    res.status(500).send({
            message: `checkForTurnReminders error: ${err}` || "Unknown error occurred in checkForTurnReminders."
        });
    }
    return;
}

