const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { Product } = require('../models');

// Get All Products
router.get('/', auth, async (req, res) => {
    try {
        const products = await Product.findAll();
        res.json(products);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Add Product
router.post('/', auth, async (req, res) => {
    const { name, sku, quantity, price, description } = req.body;
    try {
        const product = await Product.create({ name, sku, quantity, price, description });
        res.json(product);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Update Product
router.put('/:id', auth, async (req, res) => {
    const { name, sku, quantity, price, description } = req.body;
    try {
        let product = await Product.findByPk(req.params.id);
        if (!product) return res.status(404).json({ msg: 'Product not found' });

        await product.update({ name, sku, quantity, price, description });
        res.json(product);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Delete Product
router.delete('/:id', auth, async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);
        if (!product) return res.status(404).json({ msg: 'Product not found' });

        await product.destroy();
        res.json({ msg: 'Product removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
