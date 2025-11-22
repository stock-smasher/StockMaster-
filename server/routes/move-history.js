const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { MoveHistory, Location, Delivery } = require('../models');

// GET /api/move-history - List all moves
router.get('/', auth, async (req, res) => {
    try {
        const moves = await MoveHistory.findAll({
            include: [
                { model: Location, as: 'fromLocation' },
                { model: Location, as: 'toLocation' },
                { model: Delivery }
            ],
            order: [['date', 'DESC']]
        });
        res.json(moves);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server error' });
    }
});

// GET /api/move-history/location/:locationId - Get moves for location
router.get('/location/:locationId', auth, async (req, res) => {
    try {
        const { Sequelize } = require('sequelize');
        const Op = Sequelize.Op;

        const moves = await MoveHistory.findAll({
            where: {
                [Op.or]: [
                    { fromLocationId: req.params.locationId },
                    { toLocationId: req.params.locationId }
                ]
            },
            include: [
                { model: Location, as: 'fromLocation' },
                { model: Location, as: 'toLocation' },
                { model: Delivery }
            ],
            order: [['date', 'DESC']]
        });
        res.json(moves);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server error' });
    }
});

// POST /api/move-history - Create move record (manual)
router.post('/', auth, async (req, res) => {
    const { reference, fromLocationId, toLocationId, contact, status } = req.body;
    try {
        const move = await MoveHistory.create({
            reference,
            date: new Date(),
            fromLocationId,
            toLocationId,
            contact,
            status: status || 'Ready'
        });

        const completeMoveHistory = await MoveHistory.findByPk(move.id, {
            include: [
                { model: Location, as: 'fromLocation' },
                { model: Location, as: 'toLocation' }
            ]
        });

        res.json(completeMoveHistory);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server error' });
    }
});

module.exports = router;
