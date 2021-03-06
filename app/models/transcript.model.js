module.exports = (sequelize, Sequelize) => {
    const Transcript = sequelize.define("transcripts", {
        user_id: {
            type: Sequelize.INTEGER
        },
        meeting_uuid: {
            type: Sequelize.STRING
        },
        transcript: {
            type: Sequelize.TEXT('medium')
        }
    })

    return Transcript;
}