const db = require("./models");

beforeAll(async () => {
    await db.sequelize.sync({ force : true });
});

const playerController = require("./controllers/player.controller");
const gameController = require("./controllers/game.controller");
const channelController = require("./controllers/channel.controller");
var httpMocks = require('node-mocks-http');


let req, res, gameObj, playerObj, channelObj, lastNag, result;

test('playerController.create', async () => {
    expect.assertions(2);
    req = httpMocks.createRequest({
        method: 'POST',
        url: '/api/players',
        body : {
            steamName : process.env.TEST_USER,
            discordId : process.env.TEST_USERDISCORDID
        }
    });
    let res = httpMocks.createResponse();
    await playerController.create(req, res);
    playerObj = res._getData();
    console.log(`Player created: ${JSON.stringify(playerObj)}`);
    expect(playerObj.steamName).toEqual(process.env.TEST_USER);
    expect(playerObj.discordId).toEqual(process.env.TEST_USERDISCORDID);
});

test('gameController.create', async () => {
    expect.assertions(5);
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
    expect(gameObj.gameName).toEqual('Debug Game');
    expect(gameObj.currentPlayerId).toEqual(1);
    expect(gameObj.lastNag).toEqual(lastNag);
    expect(gameObj.lastTurn).toEqual(lastNag);
    expect(gameObj.turnNumber).toEqual(0);
});

test('channelController.create', async () => {
    expect.assertions(2);
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
    expect(channelObj.guild).toEqual(process.env.TEST_GUILD);
    expect(channelObj.channelNum).toEqual(process.env.TEST_CHANNEL);
});

test('gameController.addPlayerbyId', async () => {
    expect.assertions(1);
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
    expect(gameObj.players[0].id).toEqual(1);
});

test('gameController.hasPlayer', async () => {
    expect.assertions(2);
    result = await gameController.hasPlayer(1, 1);
    expect(result).toEqual(true);
    result = await gameController.hasPlayer(1, 2);
    expect(result).toEqual(false);
});

test('channelController.addGamebyID', async () => {
    expect.assertions(1);
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
    gameObj = await gameController.getGameByOptions(gameController.getGameOptions(1));
    expect(gameObj.channels[0].id).toEqual(1);
});
test('playerController.findOrCreatePlayer', async () => {
    expect.assertions(4);
    playerObj = await playerController.findOrCreatePlayer('Test Player 2', null);
    expect(playerObj.steamName).toEqual('Test Player 2');
    expect(playerObj.discordId).toEqual(null);
    playerObj = await playerController.findOrCreatePlayer(process.env.TEST_USER, null);
    expect(playerObj.steamName).toEqual(process.env.TEST_USER);
    expect(playerObj.discordId).toEqual(process.env.TEST_USERDISCORDID);
});

test('gameController.getPlayersById', async () => {
    expect.assertions(3);
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
    expect(playerObj.length).toEqual(2);
    expect(playerObj[0].id).toEqual(1);
    expect(playerObj[1].id).toEqual(2);
});

test('gameController.getOne', async () => {
    expect.assertions(1);
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
    expect(gameObj.id).toEqual(1);
});

test('channelController.findOrCreateChannel', async () => {
    expect.assertions(1);
    let channelObj = await channelController.findOrCreateChannel({ guild : '602935809150025763', channelNum: '603273965535756339'});
    console.log(`channelObj.id = ${channelObj.id}`);
    expect(channelObj.id).toEqual(1);
});

afterAll(async () => {
    await db.sequelize.close();
});