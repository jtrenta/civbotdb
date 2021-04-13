const db = require("../models");
const Player = db.players;
const Game = db.games;
const Op = db.Sequelize.Op;

// Create and Save a new Player
exports.create = async (req, res) => {
    if (!req.body.steamName) {
        res.status(400).send({
            message: "Steamname is required!"
        });
        return;
    }

    const player = {
        steamName : req.body.steamName,
        discordId : req.body.discordId,
    };
    try {
        let data = await this.createPlayer(player);
        console.log(`player.controller.js: ${JSON.stringify(data)}`);
        res.send(data);
    }
    catch(err) {
        res.status(500).send({
            message: err.message || "Unknown error occurred creating player."
        });
    };
};

exports.createPlayer = async (playerObject) => {
    try {
        let data = await Player.create(playerObject);
        return data;
    }
    catch(err) {
        console.log(`createPlayer error: ${err.message}` || "Unknown error occurred creating player in createPlayer.");
        return null;
    };
};

exports.findOrCreatePlayer = async (steamName, discordId = null) => {
    try {
        const options = this.getPlayerOptions(null, steamName, discordId);
        let player = await this.getPlayerByOptions(options)
        if(player == null) {
            player = {
                steamName : steamName,
                discordId : discordId,
            };
            const data = await this.createPlayer(player);
            return data;
        }
        return player;
    }
    catch(err) {
        console.log(`createPlayer error: ${err.message}` || "Unknown error occurred creating player in createPlayer.");
        return null;
    };
};

// Retrieve all Players from the database.
exports.getAll = async (req, res) => {
    const steamName = req.query.steamName;
    var condition = steamName ? { steamName: { [Op.eq]: `%${steamName}%` } } : null;

    try {
        let data = await Player.findAll({ where: condition })
        res.send(data);
    }
    catch(err) {
        res.status(500).send({
            message : err.message || "Unknown error occurred retrieving players."
        });
    };  
    return;
};

// Find a single Player with an id
exports.getOne = async (req, res) => {
    const id = req.params.id;
    try {
        let data = await Player.findByPk(id);
        res.send(data);
    }
    catch(err) {
        res.status(500).send({
            message: err.message || `Error retrieving Player with id=${id}`
        });
    };
    return;
};

exports.getPlayerOptions = (playerId = null, steamName = null, discordId = null) => {
    let condition
    if(playerId) {
        condition = { id : playerId };
    } else {
        condition = steamName ? { steamName: { [Op.eq]: `${steamName}` } } : null;
        if(condition == null) {
            condition = discordId ? { discordId : discordId } : null;
        } else {
            if(discordId) {
                condition.discordId = discordId;
            }
        }
    }
    const options = {
        where : condition,
        include : [
            { 
                model : Game,
                //attributes : ['id', 'gameName', 'currentPlayerId', 'lastTurn', 'lastNag', 'sleepTill'],
                through : {
                    attributes : []
                }
            }
        ],
        joinTableAttributes: []
    }
    return options;
}

exports.getPlayerByOptions = async (options) => {
    try{
        let game = await Player.findOne(options);
        return game;
    }
    catch(err) {
        console.log(`getPlayerByOptions error: ${err.message}` || `Unknown error retrieving Player with options= ${options}`);
        return null;
    };
};

// Find a single Player with an id and return all games associated with that player
exports.getGames = async (req, res) => {
    const id = req.params.id;
    try {
        const player = await Player.findOne({
            includeIgnoreAttributes: false,
            include: { 
                model : Game,
                through : {
                    attributes : []
                }
            },
            where: { id: id }
        });
        //console.log(`getGames returned ${JSON.stringify(player)}`);
        const gameList = await player.getGames({joinTableAttributes: []})
        console.log(`getGames returned ${JSON.stringify(gameList)}`);
        res.send(gameList);
    }
    catch(err) {
        res.status(500).send({
            message: err.message || `Unknown error retrieving games for Player with id=${id}`
        });
    };
    return;
};

// Update a Player by the id in the request
exports.update = async (req, res) => {
    if (!req.body.steamName) {
        res.status(400).send({
            message: "Steamname is required!"
        });
        return;
    }

    const id = req.params.id;
    try {
        let resultCode = await Player.update(req.body, {
            where: { id: id }
        });
        if (resultCode == 1) {
            res.send({
                message: "Player was updated successfully."
            });
        } else {
            res.send({
                message: `Cannot update Player with id=${id}. Maybe Player was not found or req.body is empty!`
            });
        }
    }
    catch(err) {
        res.status(500).send({
            message: err.message || `Error updating Player with id=${id}`
        });
    };
    return;
};

exports.updatePlayer = async (playerId, playerObject) => {
    try {
        let resultCode = await Player.update(playerObject, { where: { id : playerId }, returning: true});
        return resultCode;
    }
    catch(err) {
        console.log(`updatePlayer error: ${err.message}` || "Unknown error occurred updating player in updatePlayer.");
        return 0;
    };
};


// Delete a Player with the specified id in the request
exports.delete = async(req, res) => {
    const id = req.params.id;
    try {
        let resultCode = await Player.destroy({
            where: { id: id }
        });
        if (resultCode == 1) {
            res.send({
                message: "Player was deleted successfully!"
            });
        } else {
            res.send({
                message: `Cannot delete Player with id=${id}. Maybe Player was not found!`
            });
        }
    }
    catch(err) {
        res.status(500).send({
            message: err.message || `Could not delete Player with id=${id}`
        });
    };
    return;
};

// Delete all Players from the database.
exports.deleteAll = async (req, res) => {
    try {
        let numDeleted = await Player.destroy({
            where: {},
            truncate: false
        });
        res.send({ message: `${numDeleted} Players were deleted successfully!` });
    }
    catch(err) {
        res.status(500).send({
            message: err.message || "Some error occurred while removing all Players."
        });
    };
    return;
};

// Find all published Players
exports.findbyDiscordId = async (req, res) => {
    const discordId = req.query.discordId;
    let condition = discordId ? { discordId: { [Op.eq]: `%${discordId}%` } } : null;
    try {
        let data = await Player.findAll({ where: condition })
        res.send(data);
    }
    catch(err) {
        res.status(500).send({
            message : err.message || "Unknown error occurred retrieving players."
        });
    };  
    return;
};

exports.addGamebyId = async (req, res) => {
    const gameId = req.params.gameId;
    const playerId = req.params.playerId;
    try {
        let result = await this.addGame(playerId, gameId);
        if (result == null) {
            res.status(400).send({
                message: "player.controller.js.addGame failed - returned null"
            });
            return;
        }
        res.send({ message: `Game ${gameId} added to Player ${playerId}`})
    }
    catch(err) {
        res.status(500).send({
            message : err.message || "Unknown error occurred adding game to player."
        });
    };
    return;
};


exports.addGame = async (playerId, gameId) => {
    try {
        let player = await Player.findByPk(playerId);
        if (!player) {
            console.log("Player not found!");
            return null;
        }
        let game = await Game.findByPk(gameId);
        if (!game) {
            console.log("Game not found!");
            return null;
        }
        await player.addGame(game);
        console.log(`>> added Game id=${game.id} to Player id=${player.id}`);
        game = await Game.findByPk(gameId);
        return game;
    }
    catch(err) {
        console.log(">> Error while adding Game to Player: ", err);
    };
    return;
};

exports.discordIdString = (playerObj) => {
    if (playerObj.discordId === undefined || !playerObj.discordId) {
      console.log(`DiscordIDString - returning player string: ${playerObj.steamName}`)
      return '**' + playerObj.steamName + '**'
    }
  
    console.log(`DiscordIDString - returning player ID: ${playerObj.discordId}`)
  
    return ('<@' + playerObj.discordId + '>')
}
