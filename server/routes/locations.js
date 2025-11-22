const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { Location, Warehouse } = require('../models');

// GET /api/locations - List all locations
router.get('/', auth, async (req, res) => {
    try {
        const locations = await Location.findAll({
            include: [
                { model: Warehouse, as: 'Warehouse' },
                { model: Location, as: 'parentLocation' },
                { model: Location, as: 'childLocations' }
            ],
            order: [['createdAt', 'DESC']]
        });
        res.json(locations);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server error' });
    }
});

// GET /api/locations/warehouse/:warehouseId - Get locations by warehouse
router.get('/warehouse/:warehouseId', auth, async (req, res) => {
    try {
        const locations = await Location.findAll({
            where: { warehouseId: req.params.warehouseId },
            include: [
                { model: Location, as: 'parentLocation' },
                { model: Location, as: 'childLocations' }
            ],
            order: [['name', 'ASC']]
        });
        res.json(locations);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server error' });
    }
});

// GET /api/locations/:id - Get single location
router.get('/:id', auth, async (req, res) => {
    try {
        const location = await Location.findByPk(req.params.id, {
            include: [
                { model: Warehouse, as: 'Warehouse' },
                { model: Location, as: 'parentLocation' },
                { model: Location, as: 'childLocations' }
            ]
        });
        if (!location) {
            return res.status(404).json({ msg: 'Location not found' });
        }
        res.json(location);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server error' });
    }
});

// POST /api/locations - Create location
router.post('/', auth, async (req, res) => {
    const { name, shortCode, warehouseId, parentLocationId } = req.body;
    try {
        const location = await Location.create({
            name,
            shortCode,
            warehouseId,
            parentLocationId: parentLocationId || null
        });
        res.json(location);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server error' });
    }
});

// PUT /api/locations/:id - Update location
router.put('/:id', auth, async (req, res) => {
    const { name, shortCode, warehouseId, parentLocationId } = req.body;
    try {
        const location = await Location.findByPk(req.params.id);
        if (!location) {
            return res.status(404).json({ msg: 'Location not found' });
        }

        await location.update({
            name,
            shortCode,
            warehouseId,
            parentLocationId: parentLocationId || null
        });
        res.json(location);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server error' });
    }
});

// DELETE /api/locations/:id - Delete location
router.delete('/:id', auth, async (req, res) => {
    try {
        const location = await Location.findByPk(req.params.id);
        if (!location) {
            return res.status(404).json({ msg: 'Location not found' });
        }

        // Check if location has child locations
        const childCount = await Location.count({ where: { parentLocationId: req.params.id } });
        if (childCount > 0) {
            return res.status(400).json({ msg: 'Cannot delete location with child locations' });
        }

        await location.destroy();
        res.json({ msg: 'Location deleted' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server error' });
    }
});

module.exports = router;
