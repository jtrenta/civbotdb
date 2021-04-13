const db = require("../models");
const Game = db.games;
const Player = db.players;
const Channel = db.channels;
const Op = db.Sequelize.Op;

// Create and Save a new Game
exports.create = async (req, res) => {
    if (!req.body.gameName) {
        res.status(400).send({
            message: "Game name is required!"
        });
        return;
    }
    const lastTurn = (req.body.lastTurn instanceof Date) && !isNaN(req.body.lastTurn) ? req.body.lastTurn : new Date();
    const lastNag = (req.body.lastNag instanceof Date) && !isNaN(req.body.lastNag) ? req.body.lastNag : new Date();
    const sleepTill = (req.body.sleepTill instanceof Date) && !isNaN(req.body.sleepTill) ? req.body.sleepTill : new Date();
    const game = {
        gameName : req.body.gameName,
        currentPlayerId: req.body.currentPlayerId,
        lastTurn : lastTurn,
        lastNag : lastNag,
        sleepTill : sleepTill
    };

    try {
        let data = await this.createGame(game);
        console.log(`game.controller.js: ${JSON.stringify(data)}`);
        res.send(data);
    }
    catch(err) {
        res.status(500).send({
            message: err.message || "Unknown error occurred creating game."
        });
    };
    return;
};

exports.createGame = async (gameObject) => {
    try {
        let data = await Game.create(gameObject);
        return data;
    }
    catch(err) {
        console.log(`createGame error: ${err.message}` || "Unknown error occurred creating game in createGame.");
        return null;
    };
};

// Retrieve all Games from the database.
exports.getAll = async (req, res) => {
    const gameName = req.query.gameName;
    const options = this.getGameOptions(null, gameName);
    try {
        let game = await Game.findAll(options)
        res.send(game);
    }
    catch(err) {
        res.status(500).send({
            message : err.message || "Unknown error occurred retrieving games."
        });
    };  
    return;
};

exports.getAllGamesNeedingReminders = async() => {
    let condition = { lastNag : { [Op.lt] : new Date(new Date() - (12 * 60 * 60 * 1000)) },
                      sleepTill : { [Op.lt] : new Date() } };
    const options = this.createGameOptions(condition);
    try {
        let games = await Game.findAll(options)
        return games;
    }
    catch(err) {
        console.log(err.message || "Unknown error occurred retrieving games in getAllGamesNeedingReminders.");
    };  
    return null;

};

exports.getGameOptions = (gameId, gameName) => {
    let condition = gameName ? { gameName: { [Op.eq]: `${gameName}` } } : null;
    if(condition == null) {
        condition = gameId ? { id : gameId } : null;
    } else {
        if(gameId) {
            condition.id = gameId;
        }
    }
    const options =  this.createGameOptions(condition);
    return options;
}

exports.createGameOptions = (condition) => {
    const options = {
        where : condition,
        include : [
            { 
                model : Player,
                attributes : ['id', 'steamName', 'discordId', 'notifyByDM'],
                as : 'players',
                through : {
                    attributes : []
                }
            }, 
            { 
                model : Channel,
                attributes : ['id', 'guild', 'channelNum', 'guildName', 'channelName'],
                through : {
                    attributes : []
                }
            },
            {
                model : Player,
                attributes : ['id', 'steamName', 'discordId', 'notifyByDM'],
                as : 'currentPlayer'
            }
        ],
        joinTableAttributes: []
    }
    return options;
}

// Find a single Game with an id
exports.getOne = async (req, res) => {
    const id = req.params.id;
    const options = this.getGameOptions(id, null);
    try{
        let game = await this.getGameByOptions(options);
        if(game == null) {
            res.status(500).send({
                message: `Unknown error retrieving Game with id= ${id}`
            });
        }
        res.send(game);
    }
    catch(err) {
        res.status(500).send({
            message: err.message || `Unknown error retrieving Game with id= ${id}`
        });
    };
    return;
};

exports.getGameByOptions = async (options) => {
    try{
        let game = await Game.findOne(options);
        return game;
    }
    catch(err) {
        console.log(`getGameByOptions error: ${err.message}` || `Unknown error retrieving Game with options= ${options}`);
        return null;
    };
};

exports.getMultipleGamesByOptions = async (options) => {
    try{
        let game = await Game.findAll(options);
        return game;
    }
    catch(err) {
        console.log(`getGameByOptions error: ${err.message}` || `Unknown error retrieving Game with options= ${options}`);
        return null;
    };
};

exports.findOrCreateGame = async (gameName = null, gameId = null) => {
    try{
        const options = this.getGameOptions(gameId,gameName);
        let game = await this.getGameByOptions(options);
        if(game == null) {
            game = {
                gameName : gameName,
                currentPlayerId: null,
                lastTurn : new Date(),
                lastNag : new Date(),
                sleepTill : new Date()
            };
            let newGame = await this.createGame(game);
            return newGame;
        }
        return game;
    }
    catch(err) {
        console.log(`findOrCreateGame error: ${err.message}` || `Unknown error finding or creating Game with name= ${gameName}`);
        return null;
    };
}

// Find a single Game with an id and return all players in Game
exports.getPlayersById = async (req, res) => {
    const id = req.params.id;
    try {
        const playerList = await this.getPlayers(id);
        res.send(playerList);
    }
    catch(err) {
        res.status(500).send({
            message: err.message || `Unknown error retrieving players for Game with id=${id}`
        });
    };
    return;
};

exports.getPlayers = async (gameId) => {
    try {
        const options = this.getGameOptions(gameId,null);
        const game = await this.getGameByOptions(options);
        console.log(`getPlayers returned ${JSON.stringify(game)}`);
        const playerList = game.players;
        console.log(`getPlayers returned ${JSON.stringify(playerList)}`);
        return playerList;
    } 
    catch(err) {
        console.log(err.message || `Unknown error retrieving players for Game with id=${id}`);
    };
}

exports.hasPlayer = async (gameId, playerId) => {
    const hasPlayer = await Game.findAll({
        where: { id: gameId, '$players.id$' : playerId },
        include: [{
            model:Player, 
            attributes: ['id'], 
            through: { }
        }],
    });
    console.log(`game.controllger.hasPlayer: hasPlayer = ${JSON.stringify(hasPlayer)}`)
    const result = (hasPlayer.length > 0);

    console.log(`game.controllger.hasPlayer: result = ${result}`)
    return result;   
}

// Find a single Game with an id and return all players in Game
exports.getChannelsById = async (req, res) => {
    const id = req.params.id;
    try {
        const channelList = await this.getChannels(id);
        res.send(channelList);
    }
    catch(err) {
        res.status(500).send({
            message: err.message || `Unknown error retrieving channels for Game with id=${id}`
        });
    };
    return;
};

exports.getChannels = async (gameId) => {
    try {
        const options = this.getGameOptions(gameId,null);
        const game = await this.getGameByOptions(options);
        console.log(`getChannels returned ${JSON.stringify(game)}`);
        const channelList = game.channels;
        console.log(`getChannels returned ${JSON.stringify(channelList)}`);
        return channelList;
    } 
    catch(err) {
        console.log(err.message || `Unknown error retrieving channels for Game with id=${id}`);
    };
}

exports.hasChannel = async (gameId, channelId) => {
    const hasChannel = await Game.findAll({
        where: { id: gameId, '$channels.id$' : channelId },
        include: [{
            model:Channel, 
            attributes: ['id'], 
            through: { }
        }],
    });
    console.log(`game.controllger.hasChannel: hasChannel = ${JSON.stringify(hasChannel)}`)
    const result = (hasChannel.length > 0);

    console.log(`game.controllger.hasChannel: result = ${result}`)
    return result;   
}

// Update a Game by the id in the request
exports.update = async (req, res) => {
    if (!req.body.gameName) {
        res.status(400).send({
            message: "Game name is required!"
        });
        return;
    }

    const id = req.params.id;
    try {
        let resultCode = await updateGame(req.body, id);
        if (resultCode[0] === 1) {
            res.send({
                message: "Game was updated successfully."
            });
        } else {
            res.send({
                message: `Cannot update Game with id=${id}. Maybe Game was not found or req.body is empty!`
            });
        }
    }
    catch(err) {
        res.status(500).send({
            message: err.message || `Unknown error updating Game with id=${id}`
        });
    };
    return;
};

exports.updateGame = async (gameId, gameObject) => {
    try {
        let resultCode = await Game.update(gameObject, { where: { id : gameId }, returning: true});
        return resultCode;
    }
    catch(err) {
        console.log(`updateGame error: ${err.message}` || "Unknown error occurred creating game in createGame.");
        return 0;
    };
};

// Delete a Game with the specified id in the request
exports.delete = async (req, res) => {
    const id = req.params.id;
    try {
        let resultCode = await Game.destroy({
            where: { id: id }
        });
        if (resultCode == 1) {
            res.send({
              message: "Game was deleted successfully!"
            });
        } else {
            res.send({
                message: `Cannot delete Game with id=${id}. Maybe Game was not found!`
            });
        }
    }
    catch(err) {
        res.status(500).send({
            message: "Could not delete Game with id=" + id
        });
    };
    return;
};

// Delete all Games from the database.
exports.deleteAll = async (req, res) => {
    try {
        let numDeleted = await Game.destroy({
            where: {},
            truncate: false
        });
        res.send({ message: `${numDeleted} Games were deleted successfully!` });
    }
    catch(err) {
        res.status(500).send({
            message: err.message || "Unknown error occurred while removing all Games."
        });
    };
};

exports.addPlayerbyId = async (req, res) => {
    const gameId = req.params.gameId;
    const playerId = req.params.playerId;
    try {
        let result = await this.addPlayer(gameId, playerId);
        if (result == null) {
            res.status(400).send({
                message: "game.controller.js.addPlayer failed - returned null"
            });
            return;
        }
        res.send(result)
    }
    catch(err) {
        res.status(500).send({
            message: err.message || "Unknown error occurred while adding Player to Game."
        });
    };
    return;
};

exports.addPlayer = async (gameId, playerId) => {
    try {
        let game = await Game.findByPk(gameId);
        if (!game) {
            console.log("Game not found!");
            return null;
        }
        let player = await Player.findByPk(playerId);
        if (!player) {
            console.log("Player not found!");
            return null;
        }
        await game.addPlayer(player);
        console.log(`>> added Player id=${player.id} to Game id=${game.id}`);
        game = await this.getGameByOptions(this.getGameOptions(gameId));
        return game;
    }
    catch(err) {
        console.log(">> Error while adding Player to Game: ", err);
    };
};

exports.since = (pDate) => {
    console.log(`Since pDate: + ${pDate}`)
    console.log(`Since pDate.tz: + ${pDate.getTimezoneOffset()}`)
    
    let millisecDiff = this.getTimeDiff(pDate)
    const days = Math.floor(millisecDiff / 1000 / 60 / (60 * 24))
    millisecDiff = millisecDiff - days*1000*60*60*24;
    const hours = Math.floor(millisecDiff / 1000 / 60 / 60);
    millisecDiff = millisecDiff - hours*1000*60*60;
    const minutes = Math.floor(millisecDiff / 1000 / 60);
    millisecDiff = millisecDiff - minutes*1000*60;
    const seconds = Math.floor(millisecDiff / 1000);
    const returnVal = (days > 0 ? days + ' Days ' : '') +
                    (hours > 0 ? hours + ' Hours ' : '') +
                    (minutes > 0 ? minutes + ' Minutes ' : '') +
                    (seconds > 0 ? seconds + ' Seconds' : '')
  
    console.log('Since - returnval:' + returnVal)
    return returnVal
  }
  
exports.getTimeDiff = (pDate) => {
    pDate = typeof pDate !== 'undefined' ? pDate : new Date()
    console.log('GetTimeDiff - pDate:' + pDate)

    const iTime = pDate.getTime()
    const now = new Date().getTime()
  
    if (isNaN(iTime)) {
      return ''
    }

  console.log('GetTimeDiff - iTime' + iTime)
  console.log('GetTimeDiff - now:' + now)

  let millisecDiff = now - iTime

  return millisecDiff
}    