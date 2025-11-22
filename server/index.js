require('dotenv').config();
const express = require('express');

const cors = require('cors');

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const operationRoutes = require('./routes/operations');
const ledgerRoutes = require('./routes/ledger');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/operations', operationRoutes);
app.use('/api/ledger', ledgerRoutes);

// Database Connection
const sequelize = require('./config/database');
const models = require('./models'); // Import models to ensure associations are loaded

sequelize.sync({ alter: true }) // Use alter: true to update tables if they exist
  .then(() => {
    console.log('PostgreSQL Connected & Models Synced');
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => console.error('Database Connection Error:', err));
