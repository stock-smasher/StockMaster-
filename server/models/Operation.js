const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Operation = sequelize.define('Operation', {
    type: {
        type: DataTypes.ENUM('receipt', 'delivery', 'transfer', 'adjustment'),
        allowNull: false
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    reason: {
        type: DataTypes.STRING
    },
    date: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
});

module.exports = Operation;
