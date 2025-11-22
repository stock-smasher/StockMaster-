const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const MoveHistory = sequelize.define('MoveHistory', {
    reference: {
        type: DataTypes.STRING,
        allowNull: false
    },
    date: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: false
    },
    fromLocationId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Locations',
            key: 'id'
        }
    },
    toLocationId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Locations',
            key: 'id'
        }
    },
    contact: {
        type: DataTypes.STRING,
        allowNull: true
    },
    status: {
        type: DataTypes.STRING,
        defaultValue: 'Ready',
        allowNull: false
    },
    deliveryId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'Deliveries',
            key: 'id'
        }
    }
}, {
    timestamps: true
});

module.exports = MoveHistory;
