module.exports = (sequelize, Sequelize) => {
    const Payment = sequelize.define("payments", {
        user_id: {
            type: Sequelize.STRING
        },
        year: {
            type: Sequelize.INTEGER,
        },
        month: {
            type: Sequelize.INTEGER
        },
        usage_amount: {
            type: Sequelize.FLOAT
        },
        paid_status: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false
        }
    });

    return Payment;
};
