const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Delivery = sequelize.define('Delivery', {
    reference: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
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
    scheduleDate: {
        type: DataTypes.DATE,
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('draft', 'waiting', 'ready', 'done'),
        defaultValue: 'draft',
        allowNull: false
    },
    responsibleUserId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        }
    }
}, {
    timestamps: true
});

module.exports = Delivery;
