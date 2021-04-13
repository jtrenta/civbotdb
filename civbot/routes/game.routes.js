module.exports = app => {
    const games = require("../controllers/game.controller.js");

    var router = require("express").Router();

    // Create a new Game
    router.post("/", games.create);

    // Retrieve all Games
    router.get("/", games.getAll);

    // Retrieve all players from Game with id
    router.get("/:id/players", games.getPlayersById);

    // Retrieve all channels from Game with id
    router.get("/:id/channels", games.getChannelsById);

    // Retrieve a single Game with id
    router.get("/:id", games.getOne);

    // Add a new player to a Game with id
    router.put("/:gameId/AddPlayer/:playerId", games.addPlayerbyId);

    // Update a Game with id
    router.put("/:id", games.update);

    // Delete a Game with id
    router.delete("/:id", games.delete);

    // Create a new Game
    router.delete("/", games.deleteAll);

    app.use('/api/games', router);
}
