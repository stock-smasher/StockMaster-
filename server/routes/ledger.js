const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { Ledger, Product, Operation } = require('../models');

// Get Ledger History
router.get('/', auth, async (req, res) => {
    try {
        const ledger = await Ledger.findAll({
            include: [
                { model: Product, attributes: ['name', 'sku'] },
                { model: Operation, attributes: ['type', 'reason', 'date', 'performedBy'] }
            ],
            order: [['timestamp', 'DESC']]
        });
        res.json(ledger);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
