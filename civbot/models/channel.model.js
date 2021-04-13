module.exports = (sequelize, Sequelize) => {
    const Channel = sequelize.define('channel', {
        guild: {
            type: Sequelize.STRING,
            allowNull: false
        },
        channelNum: {
            type: Sequelize.STRING,
            allowNull: false
        },
        guildName: {
            type: Sequelize.STRING,
            allowNull: true
        },
        channelName: {
            type: Sequelize.STRING,
            allowNull: true
        }

    });

    return Channel;

}
