const playerController = require("./controllers/player.controller");
const gameController = require("./controllers/game.controller");
const channelController = require("./controllers/channel.controller");
var httpMocks = require('node-mocks-http');

exports.createDevDB = async () => {

    let req, res, gameObj, playerObj, channelObj, lastNag, result;

    req = httpMocks.createRequest({
        method: 'POST',
        url: '/api/players',
        body : {
            steamName : process.env.TEST_USER,
            discordId : process.env.TEST_USERDISCORDID
        }
    });
    res = httpMocks.createResponse();
    await playerController.create(req, res);
    playerObj = res._getData();
    console.log(`Player created: ${JSON.stringify(playerObj)}`);

    lastNag = new Date();
    lastNag.setDate(lastNag.getDate() - 1);
    req = httpMocks.createRequest({
        method: 'POST',
        url: '/api/games',
        body : {
            gameName : 'Debug Game',
            currentPlayerId : 1,
            lastNag : lastNag,
            lastTurn : lastNag
        }
    });
    res = httpMocks.createResponse();
    await gameController.create(req, res);
    gameObj = res._getData();
    console.log(`Game created: ${JSON.stringify(gameObj)}`);

    req = httpMocks.createRequest({
        method: 'POST',
        url: '/api/channels',
        body : {
            guild : process.env.TEST_GUILD,
            channel : process.env.TEST_CHANNEL
        }
    });
    res = httpMocks.createResponse();
    await channelController.create(req, res);
    channelObj = res._getData();
    console.log(`Channel created: ${JSON.stringify(channelObj)}`);

    req = httpMocks.createRequest({
        method: 'PUT',
        url: `/api/games/1/addPlayer/1`,
        params: { gameId : "1", playerId : "1"},
        body : {}
    });
    res = httpMocks.createResponse();
    await gameController.addPlayerbyId(req, res);
    gameObj = res._getData();
    console.log(`Game/AddPlayerbyID created: ${JSON.stringify(gameObj)}`);

    result = await gameController.hasPlayer(1, 1);
    result = await gameController.hasPlayer(1, 2);

    req = httpMocks.createRequest({
        method: 'PUT',
        url: `/api/channel/1/addGame/1`,
        params: { channelId : "1", gameId : "1"},
        body : {}
    });
    res = httpMocks.createResponse();
    await channelController.addGamebyID(req, res);
    gameObj = res._getData();
    console.log(`Channel/AddGamebyID created: ${JSON.stringify(gameObj)}`);

    playerObj = await playerController.findOrCreatePlayer('Test Player 2', null);
    console.log(`playerController.findOrCreatePlayer created: ${JSON.stringify(playerObj)}`);

    playerObj = await playerController.findOrCreatePlayer(process.env.TEST_USER, null);
    console.log(`playerController.findOrCreatePlayer created: ${JSON.stringify(playerObj)}`);

    await gameController.addPlayer(1, 2);
    req = httpMocks.createRequest({
        method: 'GET',
        url: `/api/games/1/getPlayers`,
        params: { id : "1"},
        body : {}
    });
    res = httpMocks.createResponse();
    await gameController.getPlayersById(req, res);
    playerObj = res._getData();
    console.log(`Game/GetPlayers returned: ${JSON.stringify(playerObj)}`);

    req = httpMocks.createRequest({
        method: 'GET',
        url: `/api/games`,
        params: { id : "1"},
        body : {}
    });
    res = httpMocks.createResponse();
    await gameController.getOne(req, res);
    gameObj = res._getData();
    console.log(`Game/GetOne returned: ${JSON.stringify(gameObj)}`);
    const channelArgs = {   
        channelId : null, 
        guild : process.env.TEST_GUILD, 
        channelNum : process.env.TEST_CHANNEL,
        guildName : 'Tartarus Control Center',
        channelName : 'civbot-debug'
    }

    channelObj = await channelController.findOrCreateChannel(channelArgs);
    console.log(`channelObj.id = ${channelObj.id}`);

    gameObj = await gameController.findOrCreateGame('Another Debug Game');
    if(gameObj && channelObj) {
        await channelController.addGame(channelObj.id, gameObj.id);
    }
    await gameController.addPlayer(gameObj.id, 2);
    await gameController.updateGame(gameObj.id, {currentPlayerId : 2});

}

