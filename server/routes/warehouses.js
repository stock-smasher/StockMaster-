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

// Seed Sample Warehouses and Locations
router.post('/seed', auth, async (req, res) => {
    try {
        // Create sample warehouses
        const warehouse1 = await Warehouse.create({
            name: 'Main Warehouse',
            shortCode: 'WH-MAIN',
            address: '123 Industrial Park, City'
        });

        const warehouse2 = await Warehouse.create({
            name: 'Secondary Warehouse',
            shortCode: 'WH-SEC',
            address: '456 Storage Ave, City'
        });

        // Create sample locations
        await Location.bulkCreate([
            { name: 'Stock Room A', shortCode: 'SR-A', warehouseId: warehouse1.id },
            { name: 'Stock Room B', shortCode: 'SR-B', warehouseId: warehouse1.id },
            { name: 'Receiving Dock', shortCode: 'RD-1', warehouseId: warehouse1.id },
            { name: 'Shipping Dock', shortCode: 'SD-1', warehouseId: warehouse1.id },
            { name: 'Storage Area 1', shortCode: 'SA-1', warehouseId: warehouse2.id },
            { name: 'Storage Area 2', shortCode: 'SA-2', warehouseId: warehouse2.id }
        ]);

        res.json({
            msg: 'Sample warehouses and locations loaded successfully',
            warehouses: 2,
            locations: 6
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Error loading sample data', error: err.message });
    }
});

module.exports = router;
