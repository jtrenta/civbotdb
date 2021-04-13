// index.js

const Sequelize = require('sequelize');
const dbConfig = require('../config/db.config');
var logger = require('../log.js');

const sequelize = new Sequelize(dbConfig.DB_SCHEMA || 'postgres',
                                dbConfig.DB_USER || 'postgres',
                                process.env.DB_PASSWORD || '',
                                {
                                    host: global.DEVFLAG ? 'localhost' : dbConfig.DB_HOST || 'localhost',
                                    port: process.env.DB_PORT || 5432,
                                    dialect: dbConfig.dialect || 'postgres',
                                    dialectOptions: {
                                        ssl: dbConfig.DB_SSL == "true"
                                    },
                                    pool: {
                                        max: dbConfig.pool.max,
                                        min: dbConfig.pool.min,
                                        acquire: dbConfig.pool.acquire,
                                        idle: dbConfig.pool.idle
                                    },
                                    keepDefaultTimezone: true,
                                    timezone: 'America/Los_Angeles',
                                    logging: logger.info()
                                });

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.players = require("./player.model.js")(sequelize, Sequelize);
db.channels = require("./channel.model.js")(sequelize, Sequelize);
db.games = require("./game.model.js")(sequelize, Sequelize);

// const PlayerGames = sequelize.define('PlayerGames', {
//     currentPlayer: Sequelize.DataTypes.BOOLEAN
// });
db.games.belongsTo(db.players, { foreignkey:'currentPlayerId', as:'currentPlayer'} );
db.games.belongsToMany(db.players, {    through : 'PlayerGames',
                                        foreignkey : 'game_id'});
db.players.belongsToMany(db.games, {    through : 'PlayerGames',
                                        foreignkey : 'player_id'});
db.games.belongsToMany(db.channels, {   through : 'ChannelGames',
                                        foreignkey : 'game_id'});
db.channels.belongsToMany(db.games, {   through : 'ChannelGames',
                                        foreignkey : 'channel_id'});

module.exports = db;
