module.exports = app => {
    const players = require("../controllers/player.controller.js");

    var router = require("express").Router();

    // Create a new Player
    router.post("/", players.create);

    // Retrieve all Players
    router.get("/", players.getAll);

    // Retrieve a single Player by their Discord ID
    router.get("/byDiscordId/:DiscordId", players.findbyDiscordId);

    // Retrieve all games for a Player with id
    router.get("/:id/games", players.getGames);

    // Retrieve a single Player with id
    router.get("/:id", players.getOne);

    // Add a game to a Player with id
    router.put("/:playerId/AddGame/:gameId", players.addGamebyId);

    // Update a Player with id
    router.put("/:id", players.update);

    // Delete a Player with id
    router.delete("/:id", players.delete);

    // Create a new Player
    router.delete("/", players.deleteAll);

    app.use('/api/players', router);
}
