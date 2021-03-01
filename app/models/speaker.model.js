const { Sequelize } = require("sequelize");
const sequelize = require("sequelize");

module.exports = (sequelize, Sequelize) => {
    const Speaker = sequelize.define("speakers", {
        user_id: {
            type: Sequelize.INTEGER
        },
        meeting_uuid: {
            type: Sequelize.STRING
        },
        speakers: {
            type: Sequelize.STRING
        }
    })

    return Speaker;
}