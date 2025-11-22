const sequelize = require('../config/database');
const User = require('./User');
const Product = require('./Product');
const Operation = require('./Operation');
const Ledger = require('./Ledger');

// Associations
User.hasMany(Operation, { foreignKey: 'performedBy' });
Operation.belongsTo(User, { foreignKey: 'performedBy' });

Product.hasMany(Operation, { foreignKey: 'productId' });
Operation.belongsTo(Product, { foreignKey: 'productId' });

Operation.hasOne(Ledger, { foreignKey: 'operationId' });
Ledger.belongsTo(Operation, { foreignKey: 'operationId' });

Product.hasMany(Ledger, { foreignKey: 'productId' });
Ledger.belongsTo(Product, { foreignKey: 'productId' });

module.exports = {
    User,
    Product,
    Operation,
    Ledger,
    sequelize
};
