const express = require('express');
const router = express.Router();
const { Product, Operation, Ledger } = require('../models');
const { Sequelize } = require('sequelize');
const auth = require('../middleware/auth');

// GET /api/dashboard/stats - Get dashboard statistics
router.get('/stats', auth, async (req, res) => {
    try {
        // Total products count
        const totalProducts = await Product.count();

        // Total inventory value
        const inventoryValue = await Product.sum('price', {
            attributes: [[Sequelize.fn('SUM', Sequelize.literal('price * quantity')), 'total']]
        });

        // Calculate total value properly
        const products = await Product.findAll({
            attributes: ['price', 'quantity']
        });
        const totalValue = products.reduce((sum, p) => sum + (p.price * p.quantity), 0);

        // Low stock products (quantity < 10)
        const lowStockCount = await Product.count({
            where: {
                quantity: {
                    [Sequelize.Op.lt]: 10
                }
            }
        });

        // Recent operations count (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const recentOperations = await Operation.count({
            where: {
                date: {
                    [Sequelize.Op.gte]: sevenDaysAgo
                }
            }
        });

        // Get low stock products details
        const lowStockProducts = await Product.findAll({
            where: {
                quantity: {
                    [Sequelize.Op.lt]: 10
                }
            },
            limit: 5,
            order: [['quantity', 'ASC']]
        });

        res.json({
            totalProducts,
            totalValue: totalValue.toFixed(2),
            lowStockCount,
            recentOperations,
            lowStockProducts
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
});

module.exports = router;
