const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Ledger = sequelize.define('Ledger', {
    change: {
        type: DataTypes.INTEGER
    },
    balanceAfter: {
        type: DataTypes.INTEGER
    },
    timestamp: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
});

module.exports = Ledger;
