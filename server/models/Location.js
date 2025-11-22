const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Location = sequelize.define('Location', {
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    shortCode: {
        type: DataTypes.STRING,
        allowNull: false
    },
    warehouseId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Warehouses',
            key: 'id'
        }
    },
    parentLocationId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'Locations',
            key: 'id'
        }
    }
}, {
    timestamps: true
});

module.exports = Location;
