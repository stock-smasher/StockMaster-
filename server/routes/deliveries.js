const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { Delivery, DeliveryItem, Location, Product, User, MoveHistory, sequelize } = require('../models');

// GET /api/deliveries - List all deliveries
router.get('/', auth, async (req, res) => {
    try {
        const { status } = req.query;
        const where = status ? { status } : {};

        const deliveries = await Delivery.findAll({
            where,
            include: [
                { model: Location, as: 'fromLocation' },
                { model: Location, as: 'toLocation' },
                { model: User, as: 'responsibleUser', attributes: ['username'] },
                { model: DeliveryItem, as: 'items', include: [{ model: Product }] }
            ],
            order: [['createdAt', 'DESC']]
        });
        res.json(deliveries);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server error' });
    }
});

// GET /api/deliveries/:id - Get single delivery
router.get('/:id', auth, async (req, res) => {
    try {
        const delivery = await Delivery.findByPk(req.params.id, {
            include: [
                { model: Location, as: 'fromLocation' },
                { model: Location, as: 'toLocation' },
                { model: User, as: 'responsibleUser', attributes: ['username'] },
                { model: DeliveryItem, as: 'items', include: [{ model: Product }] }
            ]
        });
        if (!delivery) {
            return res.status(404).json({ msg: 'Delivery not found' });
        }
        res.json(delivery);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server error' });
    }
});

// POST /api/deliveries - Create delivery
router.post('/', auth, async (req, res) => {
    const { reference, fromLocationId, toLocationId, contact, scheduleDate, items } = req.body;
    const t = await sequelize.transaction();

    try {
        const delivery = await Delivery.create({
            reference,
            fromLocationId,
            toLocationId,
            contact,
            scheduleDate,
            status: 'draft',
            responsibleUserId: req.user.id
        }, { transaction: t });

        // Create delivery items
        if (items && items.length > 0) {
            const deliveryItems = items.map(item => ({
                deliveryId: delivery.id,
                productId: item.productId,
                quantity: item.quantity
            }));
            await DeliveryItem.bulkCreate(deliveryItems, { transaction: t });
        }

        await t.commit();

        // Fetch complete delivery
        const completeDelivery = await Delivery.findByPk(delivery.id, {
            include: [
                { model: Location, as: 'fromLocation' },
                { model: Location, as: 'toLocation' },
                { model: DeliveryItem, as: 'items', include: [{ model: Product }] }
            ]
        });

        res.json(completeDelivery);
    } catch (err) {
        await t.rollback();
        console.error(err.message);
        res.status(500).json({ msg: 'Server error' });
    }
});

// PUT /api/deliveries/:id - Update delivery
router.put('/:id', auth, async (req, res) => {
    const { fromLocationId, toLocationId, contact, scheduleDate, items } = req.body;
    const t = await sequelize.transaction();

    try {
        const delivery = await Delivery.findByPk(req.params.id);
        if (!delivery) {
            await t.rollback();
            return res.status(404).json({ msg: 'Delivery not found' });
        }

        if (delivery.status !== 'draft') {
            await t.rollback();
            return res.status(400).json({ msg: 'Can only edit draft deliveries' });
        }

        await delivery.update({
            fromLocationId,
            toLocationId,
            contact,
            scheduleDate
        }, { transaction: t });

        // Update items
        if (items) {
            await DeliveryItem.destroy({ where: { deliveryId: delivery.id }, transaction: t });
            const deliveryItems = items.map(item => ({
                deliveryId: delivery.id,
                productId: item.productId,
                quantity: item.quantity
            }));
            await DeliveryItem.bulkCreate(deliveryItems, { transaction: t });
        }

        await t.commit();

        const updatedDelivery = await Delivery.findByPk(delivery.id, {
            include: [
                { model: Location, as: 'fromLocation' },
                { model: Location, as: 'toLocation' },
                { model: DeliveryItem, as: 'items', include: [{ model: Product }] }
            ]
        });

        res.json(updatedDelivery);
    } catch (err) {
        await t.rollback();
        console.error(err.message);
        res.status(500).json({ msg: 'Server error' });
    }
});

// PUT /api/deliveries/:id/status - Change delivery status
router.put('/:id/status', auth, async (req, res) => {
    const { status } = req.body;
    const t = await sequelize.transaction();

    try {
        const delivery = await Delivery.findByPk(req.params.id, {
            include: [{ model: DeliveryItem, as: 'items', include: [{ model: Product }] }]
        });

        if (!delivery) {
            await t.rollback();
            return res.status(404).json({ msg: 'Delivery not found' });
        }

        // Validate status transition
        const validTransitions = {
            'draft': ['waiting'],
            'waiting': ['ready', 'draft'],
            'ready': ['done', 'waiting'],
            'done': []
        };

        if (!validTransitions[delivery.status].includes(status)) {
            await t.rollback();
            return res.status(400).json({ msg: `Cannot transition from ${delivery.status} to ${status}` });
        }

        await delivery.update({ status }, { transaction: t });

        // If status is 'done', create move history and update product locations
        if (status === 'done') {
            // Create move history
            await MoveHistory.create({
                reference: delivery.reference,
                date: new Date(),
                fromLocationId: delivery.fromLocationId,
                toLocationId: delivery.toLocationId,
                contact: delivery.contact,
                status: 'Ready',
                deliveryId: delivery.id
            }, { transaction: t });

            // Update product locations
            for (const item of delivery.items) {
                const product = await Product.findByPk(item.productId, { transaction: t });
                if (product) {
                    await product.update({
                        locationId: delivery.toLocationId
                    }, { transaction: t });
                }
            }
        }

        await t.commit();

        const updatedDelivery = await Delivery.findByPk(delivery.id, {
            include: [
                { model: Location, as: 'fromLocation' },
                { model: Location, as: 'toLocation' },
                { model: DeliveryItem, as: 'items', include: [{ model: Product }] }
            ]
        });

        res.json(updatedDelivery);
    } catch (err) {
        await t.rollback();
        console.error(err.message);
        res.status(500).json({ msg: 'Server error' });
    }
});

// DELETE /api/deliveries/:id - Delete delivery
router.delete('/:id', auth, async (req, res) => {
    try {
        const delivery = await Delivery.findByPk(req.params.id);
        if (!delivery) {
            return res.status(404).json({ msg: 'Delivery not found' });
        }

        if (delivery.status !== 'draft') {
            return res.status(400).json({ msg: 'Can only delete draft deliveries' });
        }

        await delivery.destroy();
        res.json({ msg: 'Delivery deleted' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server error' });
    }
});

module.exports = router;
