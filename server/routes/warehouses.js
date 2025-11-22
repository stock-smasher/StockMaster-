const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { Warehouse, Location } = require('../models');

// GET /api/warehouses - List all warehouses
router.get('/', auth, async (req, res) => {
    try {
        const warehouses = await Warehouse.findAll({
            include: [{
                model: Location,
                as: 'Locations'
            }],
            order: [['createdAt', 'DESC']]
        });
        res.json(warehouses);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server error' });
    }
});

// GET /api/warehouses/:id - Get single warehouse
router.get('/:id', auth, async (req, res) => {
    try {
        const warehouse = await Warehouse.findByPk(req.params.id, {
            include: [{
                model: Location,
                as: 'Locations'
            }]
        });
        if (!warehouse) {
            return res.status(404).json({ msg: 'Warehouse not found' });
        }
        res.json(warehouse);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server error' });
    }
});

// POST /api/warehouses - Create warehouse
router.post('/', auth, async (req, res) => {
    const { name, shortCode, address } = req.body;
    try {
        const warehouse = await Warehouse.create({
            name,
            shortCode,
            address
        });
        res.json(warehouse);
    } catch (err) {
        console.error(err.message);
        if (err.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ msg: 'Short code already exists' });
        }
        res.status(500).json({ msg: 'Server error' });
    }
});

// PUT /api/warehouses/:id - Update warehouse
router.put('/:id', auth, async (req, res) => {
    const { name, shortCode, address } = req.body;
    try {
        const warehouse = await Warehouse.findByPk(req.params.id);
        if (!warehouse) {
            return res.status(404).json({ msg: 'Warehouse not found' });
        }

        await warehouse.update({ name, shortCode, address });
        res.json(warehouse);
    } catch (err) {
        console.error(err.message);
        if (err.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ msg: 'Short code already exists' });
        }
        res.status(500).json({ msg: 'Server error' });
    }
});

// DELETE /api/warehouses/:id - Delete warehouse
router.delete('/:id', auth, async (req, res) => {
    try {
        const warehouse = await Warehouse.findByPk(req.params.id);
        if (!warehouse) {
            return res.status(404).json({ msg: 'Warehouse not found' });
        }

        // Check if warehouse has locations
        const locationCount = await Location.count({ where: { warehouseId: req.params.id } });
        if (locationCount > 0) {
            return res.status(400).json({ msg: 'Cannot delete warehouse with existing locations' });
        }

        await warehouse.destroy();
        res.json({ msg: 'Warehouse deleted' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server error' });
    }
});

module.exports = router;
