const sequelize = require('../config/database');
const User = require('./User');
const Product = require('./Product');
const Operation = require('./Operation');
const Ledger = require('./Ledger');
const Warehouse = require('./Warehouse');
const Location = require('./Location');
const Delivery = require('./Delivery');
const DeliveryItem = require('./DeliveryItem');
const MoveHistory = require('./MoveHistory');

// User Associations
User.hasMany(Operation, { foreignKey: 'performedBy' });
Operation.belongsTo(User, { foreignKey: 'performedBy' });

User.hasMany(Delivery, { foreignKey: 'responsibleUserId', as: 'deliveries' });
Delivery.belongsTo(User, { foreignKey: 'responsibleUserId', as: 'responsibleUser' });

// Product Associations
Product.hasMany(Operation, { foreignKey: 'productId' });
Operation.belongsTo(Product, { foreignKey: 'productId' });

Product.hasMany(Ledger, { foreignKey: 'productId' });
Ledger.belongsTo(Product, { foreignKey: 'productId' });

Product.hasMany(DeliveryItem, { foreignKey: 'productId' });
DeliveryItem.belongsTo(Product, { foreignKey: 'productId' });

Product.belongsTo(Warehouse, { foreignKey: 'warehouseId' });
Warehouse.hasMany(Product, { foreignKey: 'warehouseId' });

Product.belongsTo(Location, { foreignKey: 'locationId' });
Location.hasMany(Product, { foreignKey: 'locationId' });

// Operation and Ledger Associations
Operation.hasOne(Ledger, { foreignKey: 'operationId' });
Ledger.belongsTo(Operation, { foreignKey: 'operationId' });

// Warehouse and Location Associations
Warehouse.hasMany(Location, { foreignKey: 'warehouseId' });
Location.belongsTo(Warehouse, { foreignKey: 'warehouseId' });

// Location hierarchy (self-referencing)
Location.hasMany(Location, { as: 'childLocations', foreignKey: 'parentLocationId' });
Location.belongsTo(Location, { as: 'parentLocation', foreignKey: 'parentLocationId' });

// Delivery Associations
Delivery.belongsTo(Location, { as: 'fromLocation', foreignKey: 'fromLocationId' });
Delivery.belongsTo(Location, { as: 'toLocation', foreignKey: 'toLocationId' });

Delivery.hasMany(DeliveryItem, { foreignKey: 'deliveryId', as: 'items' });
DeliveryItem.belongsTo(Delivery, { foreignKey: 'deliveryId' });

Delivery.hasMany(MoveHistory, { foreignKey: 'deliveryId' });
MoveHistory.belongsTo(Delivery, { foreignKey: 'deliveryId' });

// MoveHistory Associations
MoveHistory.belongsTo(Location, { as: 'fromLocation', foreignKey: 'fromLocationId' });
MoveHistory.belongsTo(Location, { as: 'toLocation', foreignKey: 'toLocationId' });

module.exports = {
    User,
    Product,
    Operation,
    Ledger,
    Warehouse,
    Location,
    Delivery,
    DeliveryItem,
    MoveHistory,
    sequelize
};
