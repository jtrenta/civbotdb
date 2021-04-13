const db = require("../models");
const Channel = db.channels;
const Game = db.games;
const Op = db.Sequelize.Op;

// Create and Save a new Channel
exports.create = async (req, res) => {
    if (!req.body.guild || !req.body.channel) {
        res.status(400).send({
            message: "Guild and channel are required!"
        });
        return;
    }

    const channel = {
        guild : req.body.guild,
        channelNum : req.body.channel,
    };
    try {
        let data = await this.createChannel(channel);
        console.log(`channel.controller.js: ${JSON.stringify(data)}`);
        res.send(data);
    }
    catch(err) {
        res.status(500).send({
            message: err.message || "Unknown error occurred creating channel."
        });
    };
};

exports.createChannel = async (channelObject) => {
    try {
        let data = await Channel.create(channelObject);
        return data;
    }
    catch(err) {
        console.error(`createChannel error: ${err.message}` || "Unknown error occurred creating channel in createChannel.");
        return null;
    };
};

exports.getChannelOptions = (channelId, guild, channelNum) => {
    let condition = guild ? { guild: { [Op.eq]: `${guild}` } } : null;
    if(condition == null) {
        condition = channelNum ? { channelNum : { [Op.eq]: `${channelNum}` } } : null;
    } else {
        condition.channelNum = { [Op.eq]: `${channelNum}` };
    }
    if(channelId) {
       if(condition == null) {
            condition = channelId ? { id : channelId } : null;
        } else {
            condition.id = channelId;
        }
    }
    const options = {
        where : condition,
        include : [
            { 
                model : Game,
                attributes : ['id', 'gameName'],
                through : {
                    attributes : []
                }
            }
        ],
        joinTableAttributes: []
    }
    return options;
}


// Retrieve all Channels from the database.
exports.getAll = async (req, res) => {
    const guildCnd = req.query.guild;
    const channelCnd = req.query.channel;
    var condition = guildCnd ? { guild: { [Op.eq]: `${guildCnd}` }, channel: { [Op.eq]: `${channelCnd}` } } : null;

    try {
        let data = await Channel.findAll({ where: condition })
        res.send(data);
    }
    catch(err) {
        res.status(500).send({
            message : err.message || "Unknown error occurred retrieving channels."
        });
    };  
    return;
};

// Find a single Channel with an id
exports.getOne = async (req, res) => {
    const id = req.params.id;
    const options = this.getChannelOptions(id, null, null);
    try{
        let channel = await this.getChannelByOptions(options);
        if(channel == null) {
            res.status(500).send({
                message: `Unknown error retrieving Channel with id= ${id}`
            });
        }
        res.send(channel);
    }
    catch(err) {
        res.status(500).send({
            message: err.message || `Unknown error retrieving Channel with id= ${id}`
        });
    };
    return;
};

exports.getChannelByOptions = async (options) => {
    try{
        let channel = await Channel.findOne(options);
        return channel;
    }
    catch(err) {
        console.error(`getChannelByOptions error: ${err.message}` || `Unknown error retrieving Channel with options= ${options}`);
        return null;
    };
};

// Find a single Game with an id and return all channels in Game
exports.getGames = async (req, res) => {
    const id = req.params.id;
    try {
        const channel = await Channel.findOne({
            includeIgnoreAttributes: false,
            include: { 
                model : Game,
                through : {
                    attributes : []
                }
            },
            where: { id: id }
        });
        //console.log(`getGames returned ${JSON.stringify(channel)}`);
        const gameList = await channel.getGames({joinTableAttributes: []})
        console.log(`getGames returned ${JSON.stringify(gameList)}`);
        res.send(gameList);
    }
    catch(err) {
        res.status(500).send({
            message: err.message || `Unknown error retrieving games for Channel with id=${id}`
        });
    };
    return;
};

//exports.findOrCreateChannel = async (channelId = null, guild = null, channelNum = null, names = null) => {
exports.findOrCreateChannel = async (args) => {
    if(!args) {
        console.warn(`findOrCreateChannel: args is null`);
        return null;
    } 
    if(!args.channelId && !args.guild && !args.channelNum) {
        console.warn(`findOrCreateChannel: args must have either channelId, guild or channelNum`);
        return null;
    } 
    try{
        const options = this.getChannelOptions(args.channelId, args.guild, args.channelNum);
        let channel = await this.getChannelByOptions(options);
        if(channel == null) {
            channel = {
                guild : args.guild,
                channelNum : args.channelNum,
                guildName : args.guildName,
                channelName : args.channelName
            };
            let newChannel = await this.createChannel(channel);
            return newChannel;
        }
        return channel;
    }
    catch(err) {
        console.error(`findOrCreateChannel error: ${err.message}` || `Unknown error finding or creating Channel with name= ${args.channelName}`);
        return null;
    };
}

// Update a Channel by the id in the request
exports.update = async (req, res) => {
    if (!req.body.guild && !req.body.channel) {
        res.status(400).send({
            message: "Guild or channel are required!"
        });
        return;
    }

    const id = req.params.id;
    try {
        let resultCode = await Channel.update(req.body, {
            where: { id: id }
        });
        if (resultCode == 1) {
            res.send({
                message: "Channel was updated successfully."
            });
        } else {
            res.send({
                message: `Cannot update Channel with id=${id}. Maybe Channel was not found or req.body is empty!`
            });
        }
    }
    catch(err) {
        res.status(500).send({
            message: err.message || `Error updating Channel with id=${id}`
        });
    };
    return;
};

// Delete a Channel with the specified id in the request
exports.delete = async(req, res) => {
    const id = req.params.id;
    try {
        let resultCode = await Channel.destroy({
            where: { id: id }
        });
        if (resultCode == 1) {
            res.send({
                message: "Channel was deleted successfully!"
            });
        } else {
            res.send({
                message: `Cannot delete Channel with id=${id}. Maybe Channel was not found!`
            });
        }
    }
    catch(err) {
        res.status(500).send({
            message: err.message || `Could not delete Channel with id=${id}`
        });
    };
    return;
};

// Delete all Channels from the database.
exports.deleteAll = async (req, res) => {
    try {
        let numDeleted = await Channel.destroy({
            where: {},
            truncate: false
        });
        res.send({ message: `${numDeleted} Channels were deleted successfully!` });
    }
    catch(err) {
        res.status(500).send({
            message: err.message || "Some error occurred while removing all Channels."
        });
    };
    return;
};


exports.addGamebyID = async (req, res) => {
    const gameId = req.params.gameId;
    const channelId = req.params.channelId;
    try {
        let result = await this.addGame(channelId, gameId);
        if (result == null) {
            res.status(400).send({
                message: "channel.controller.js.addGame failed - returned null"
            });
            return;
        }
        res.send(result)
    }
    catch(err) {
        res.status(500).send({
            message : err.message || "Unknown error occurred adding game to channel."
        });
    };
    return;
};


exports.addGame = async (channelId, gameId) => {
    try {
        let channel = await Channel.findByPk(channelId);
        if (!channel) {
            console.warn("Channel not found!");
            return null;
        }
        let game = await Game.findByPk(gameId);
        if (!game) {
            console.warn("Game not found!");
            return null;
        }
        let result = await channel.addGame(game);
        if(result[0].gameId == game.id && result[0].channelId == channel.id) {
            console.log(`>> added Game id=${game.id} to Channel id=${channel.id}`);
            game = await Game.findByPk(gameId);
            return game;
        } else {
            console.warn(`>> Game id=${game.id} was not added to Channel id=${channel.id}`);
            return null;
        }
    }
    catch(err) {
        console.error(">> Error while adding Game to Channel: ", err);
    };
    return null;
};


exports.removeGame = async (channelId, gameId) => {
    try {
        let channel = await Channel.findByPk(channelId);
        if (!channel) {
            console.warn("Channel not found!");
            return null;
        }
        let game = await Game.findByPk(gameId);
        if (!game) {
            console.warn("Game not found!");
            return null;
        }
        let result = await channel.removeGame(game);
        if(result == 1) {
            console.log(`>> removed Game id=${game.id} from Channel id=${channel.id}`);
        } else {
            console.warn(`channel.controller.removeGame failed to remove game.`)
        }
        return result;
    }
    catch(err) {
        console.error(">> Error while remove Game from Channel: ", err);
    };
    return null;
};