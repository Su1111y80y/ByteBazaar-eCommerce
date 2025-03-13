/**
 * Order Router - Defines and secures all API endpoints for order operations
 * 
 * This router implements a RESTful API pattern for the Order resource, handling
 * Create, Read, Update, and Delete (CRUD) operations. All routes are protected
 * by authentication middleware to ensure users can only access their own orders.
 */
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

/**
 * Apply authentication middleware to all order routes
 * 
 * This ensures every endpoint in this router requires a valid JWT token.
 * The auth middleware will extract the user ID from the token and add it
 * to the request object, making it available to the controller functions.
 */
router.use(auth);

/**
 * GET /orders
 * 
 * Retrieves all orders for the authenticated user.
 * The controller filters results to show only the user's own orders.
 */
router.get('/', getAllOrders);

/**
 * GET /orders/:id
 * 
 * Retrieves a specific order by its ID.
 * The :id parameter in the URL is passed to the controller as req.params.id.
 * Security checks ensure users can only access their own orders.
 */
router.get('/:id', getOrderById);

/**
 * POST /orders
 * 
 * Creates a new order with the provided products and quantities.
 * Request body should contain userId and products array.
 * The controller validates input data and calculates the total price.
 */
router.post('/', createOrder);

/**
 * PUT /orders/:id
 * 
 * Updates an existing order by ID.
 * Can modify products, quantities, or status.
 * The controller recalculates the total price if products change.
 */
router.put('/:id', updateOrder);

/**
 * DELETE /orders/:id
 * 
 * Permanently removes an order and its items from the database.
 * Security checks ensure users can only delete their own orders.
 */
router.delete('/:id', deleteOrder);

module.exports = router;