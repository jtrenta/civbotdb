module.exports = (sequelize, Sequelize) => {
const Player = sequelize.define('player', {
    steamName: {
        type: Sequelize.STRING,
        allowNull: false
    },
    discordId: {
        type: Sequelize.STRING,
        allowNull: true
    },
    notifyByDM: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
    }
});

return Player;

}