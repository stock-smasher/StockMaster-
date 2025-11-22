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

// Seed Sample Products
router.post('/seed', auth, async (req, res) => {
    try {
        const sampleProducts = [
            { name: 'Laptop Dell XPS 15', sku: 'DELL-XPS-001', quantity: 25, price: 1299.99, description: 'High-performance laptop with 16GB RAM' },
            { name: 'iPhone 14 Pro', sku: 'APPL-IP14-001', quantity: 50, price: 999.99, description: '128GB, Space Black' },
            { name: 'Samsung 4K Monitor', sku: 'SAMS-MON-001', quantity: 15, price: 399.99, description: '27-inch 4K UHD display' },
            { name: 'Logitech MX Master 3', sku: 'LOGI-MX3-001', quantity: 100, price: 99.99, description: 'Wireless mouse for productivity' },
            { name: 'Sony WH-1000XM5', sku: 'SONY-WH5-001', quantity: 30, price: 349.99, description: 'Noise-cancelling headphones' },
            { name: 'MacBook Pro 14"', sku: 'APPL-MBP-001', quantity: 20, price: 1999.99, description: 'M2 Pro chip, 512GB SSD' },
            { name: 'HP LaserJet Printer', sku: 'HP-LJ-001', quantity: 12, price: 299.99, description: 'Wireless laser printer' },
            { name: 'Mechanical Keyboard RGB', sku: 'MECH-KB-001', quantity: 45, price: 129.99, description: 'Cherry MX switches, RGB backlit' },
            { name: 'Webcam Logitech C920', sku: 'LOGI-C920-001', quantity: 60, price: 79.99, description: '1080p HD webcam' },
            { name: 'USB-C Hub 7-in-1', sku: 'HUB-7IN1-001', quantity: 80, price: 49.99, description: 'Multi-port USB-C adapter' }
        ];

        const createdProducts = await Product.bulkCreate(sampleProducts, {
            ignoreDuplicates: true // Skip if SKU already exists
        });

        res.json({
            msg: 'Sample products loaded successfully',
            count: createdProducts.length,
            products: createdProducts
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Error loading sample products', error: err.message });
    }
});

module.exports = router;
