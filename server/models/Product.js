const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Product = sequelize.define('Product', {
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    sku: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    quantity: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    price: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
    description: {
        type: DataTypes.TEXT
    }
});

module.exports = Product;
