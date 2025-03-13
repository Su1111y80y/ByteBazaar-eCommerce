const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrder,
  deleteOrder
} = require('../controllers/orderController');

// Protect all order routes with auth middleware
router.use(auth);

// Get all orders
router.get('/', getAllOrders);

// Get a specific order by ID
router.get('/:id', getOrderById);

// Create a new order
router.post('/', createOrder);

// Update an order
router.put('/:id', updateOrder);

// Delete an order
router.delete('/:id', deleteOrder);

module.exports = router;