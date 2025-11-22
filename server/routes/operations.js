const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { Product, Operation, Ledger, sequelize } = require('../models');

// Perform Operation (Receipt, Delivery, Transfer, Adjustment)
router.post('/', auth, async (req, res) => {
    const { type, productId, quantity, reason } = req.body;
    const t = await sequelize.transaction();

    try {
        const product = await Product.findByPk(productId, { transaction: t });
        if (!product) {
            await t.rollback();
            return res.status(404).json({ msg: 'Product not found' });
        }

        let change = 0;
        const qty = parseInt(quantity); // Ensure quantity is a number
        if (type === 'receipt') change = qty;
        else if (type === 'delivery') change = -qty;
        else if (type === 'adjustment') change = qty; // Can be positive or negative
        else if (type === 'transfer') change = -qty; // Simplified as out

        // Update Product Quantity
        product.quantity += change;
        await product.save({ transaction: t });

        // Create Operation Record
        const operation = await Operation.create({
            type,
            productId,
            quantity: qty,
            reason,
            performedBy: req.user.id
        }, { transaction: t });

        // Create Ledger Entry
        await Ledger.create({
            operationId: operation.id,
            productId,
            change,
            balanceAfter: product.quantity
        }, { transaction: t });

        await t.commit();
        res.json(operation);
    } catch (err) {
        await t.rollback();
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
