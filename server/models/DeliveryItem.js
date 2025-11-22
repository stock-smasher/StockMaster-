const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DeliveryItem = sequelize.define('DeliveryItem', {
    deliveryId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Deliveries',
            key: 'id'
        }
    },
    productId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Products',
            key: 'id'
        }
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    }
}, {
    timestamps: true
});

module.exports = DeliveryItem;
