const { players } = require(".");

module.exports = (sequelize, Sequelize) => {
    const Game = sequelize.define('game', {
        gameName: {
            type: Sequelize.STRING,
            allowNull: false
        },
        currentPlayerId: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {         // currentPlayer belongsTo Game 1:1
                model: 'players',
                key: 'id'
            }
        },
        turnNumber: {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        lastTurn: {
            type: Sequelize.DATE,
            allowNull: true
        },
        lastNag: {
            type: Sequelize.DATE,
            allowNull: true
        },
        sleepTill: {
            type: Sequelize.DATE,
            allowNull: true
        }
    }
    // ,{
    //     include: [ players ]
    //   }
      );

    return Game;
}
