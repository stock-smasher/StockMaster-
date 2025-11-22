# StockMaster

A complete inventory management system.

## Tech Stack
- **Frontend:** React (Vite)
- **Backend:** Node.js, Express
- **Database:** PostgreSQL (Sequelize)

## Features
- 📊 Dashboard with statistics
- 📦 Product management
- 🔄 Inventory operations
- 🏭 Multi-warehouse support
- 📍 Hierarchical locations
- 🚚 Delivery workflow (draft → waiting → ready → done)
- 📋 Move history tracking

## Setup

1. **Install Dependencies**
   ```bash
   cd server && npm install
   cd ../client && npm install
   ```

2. **Environment Variables**
   - Create `server/.env` based on `server/.env.example`.

3. **Run**
   - Server: `cd server && npm run dev`
   - Client: `cd client && npm run dev`
