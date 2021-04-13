module.exports = app => {
    const channels = require("../controllers/channel.controller.js");

    var router = require("express").Router();

    // Create a new Channel
    router.post("/", channels.create);

    // Retrieve all Channels
    router.get("/", channels.getAll);

    // Retrieve all Games registered to Channel with id
    router.get("/:id/games", channels.getGames);

    // Retrieve a single Channel with id
    router.get("/:id", channels.getOne);

    // Add a Game to a Channel with id
    router.put("/:channelId/AddGame/:gameId", channels.addGamebyID);

    // Update a Channel with id
    router.put("/:id", channels.update);

    // Delete a Channel with id
    router.delete("/:id", channels.delete);

    // Create a new Channel
    router.delete("/", channels.deleteAll);

    app.use('/api/channels', router);
}