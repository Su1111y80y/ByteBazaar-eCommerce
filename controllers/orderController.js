const { Order, User, Product, OrderItem } = require("../models");
const { createOrderSchema, updateOrderSchema } = require("../schemas/orderSchemas");
const sequelize = require("../db");

/**
 * Calculates the total price for an order based on products and quantities
 * Fetches current prices from the database to ensure accuracy
 */
const calculateOrderTotal = async (products) => {
  let total = 0;
  
  for (const item of products) {
    // Get current product price from database
    const product = await Product.findByPk(item.productId);
    
    if (!product) {
      throw new Error(`Product with ID ${item.productId} not found`);
    }
    
    total += product.price * item.quantity;
  }
  
  // Format to 2 decimal places for currency
  return parseFloat(total.toFixed(2));
};

/**
 * Retrieves all orders belonging to the authenticated user
 * Security: Filters orders by user ID to prevent data leakage
 */
const getAllOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const orders = await Order.findAll({
      where: { userId },
      include: [
        {
          model: OrderItem,
          include: [Product]
        },
        {
          model: User,
          attributes: ["id", "username", "email"] // Exclude password
        }
      ]
    });
    
    res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
};

/**
 * Retrieves a specific order by ID
 * Security: Verifies the order belongs to the authenticated user
 */
const getOrderById = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  
  try {
    // Find order with both matching ID and authenticated user's ID
    const order = await Order.findOne({
      where: {
        id,
        userId 
      },
      include: [
        {
          model: OrderItem,
          include: [Product]
        },
        {
          model: User,
          attributes: ["id", "username", "email"]
        }
      ]
    });
    
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    
    res.status(200).json(order);
  } catch (error) {
    console.error(`Error fetching order ${id}:`, error);
    res.status(500).json({ error: "Failed to fetch order" });
  }
};

/**
 * Creates a new order with associated order items
 * Uses transactions to ensure data consistency across multiple tables
 */
const createOrder = async (req, res) => {
  // Start transaction to ensure atomic operations
  const transaction = await sequelize.transaction();
  
  try {
    // Validate request body against schema
    const { error, value } = createOrderSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    
    const { userId, products } = value;
    
    // Security: Prevent creating orders for other users
    if (userId !== req.user.id) {
      await transaction.rollback();
      return res.status(403).json({ error: "You can only create orders for yourself" });
    }
    
    // Verify user exists
    const user = await User.findByPk(userId);
    if (!user) {
      await transaction.rollback();
      return res.status(404).json({ error: "User not found" });
    }
    
    // Verify products and collect details
    let total = 0;
    const productDetails = [];
    
    for (const item of products) {
      const product = await Product.findByPk(item.productId);
      
      if (!product) {
        await transaction.rollback();
        return res.status(404).json({ 
          error: `Product with ID ${item.productId} not found` 
        });
      }
      
      productDetails.push({
        product,
        quantity: item.quantity
      });
      
      total += product.price * item.quantity;
    }
    
    total = parseFloat(total.toFixed(2));
    
    // Create main order record
    const newOrder = await Order.create(
      {
        userId,
        total,
      },
      { transaction }
    );
    
    // Create individual order items with current prices
    const orderItems = [];
    for (const { product, quantity } of productDetails) {
      const orderItem = await OrderItem.create(
        {
          orderId: newOrder.id,
          productId: product.id,
          quantity,
          priceAtPurchase: product.price, // Store price at purchase time
        },
        { transaction }
      );
      
      orderItems.push(orderItem);
    }
    
    // Commit the transaction after all operations succeed
    await transaction.commit();
    
    // Return complete order with relationships
    const createdOrder = await Order.findByPk(newOrder.id, {
      include: [
        {
          model: OrderItem,
          include: [Product]
        },
        {
          model: User,
          attributes: ["id", "username", "email"]
        }
      ]
    });
    
    res.status(201).json(createdOrder);
  } catch (error) {
    // Rollback on any error to maintain database integrity
    await transaction.rollback();
    console.error("Error creating order:", error);
    res.status(500).json({ error: "Failed to create order" });
  }
};

/**
 * Updates an existing order and its items
 * Security: Users can only update their own orders
 */
const updateOrder = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const transaction = await sequelize.transaction();
  
  try {
    // Find order and verify ownership
    const order = await Order.findOne({
      where: { 
        id,
        userId
      }
    });
    
    if (!order) {
      await transaction.rollback();
      return res.status(404).json({ error: "Order not found" });
    }
    
    // Validate update data
    const { error, value } = updateOrderSchema.validate(req.body);
    
    if (error) {
      await transaction.rollback();
      return res.status(400).json({ error: error.details[0].message });
    }
    
    const { products, status } = value;
    
    // Prevent order transfer between users
    if (value.userId && value.userId !== userId) {
      await transaction.rollback();
      return res.status(403).json({ error: "You cannot transfer an order to another user" });
    }
    
    // Update products if provided
    if (products) {
      // Remove existing items first
      await OrderItem.destroy({ 
        where: { orderId: id },
        transaction
      });
      
      // Verify and process new products
      let total = 0;
      const productDetails = [];
      
      for (const item of products) {
        const product = await Product.findByPk(item.productId);
        
        if (!product) {
          await transaction.rollback();
          return res.status(404).json({ 
            error: `Product with ID ${item.productId} not found` 
          });
        }
        
        productDetails.push({
          product,
          quantity: item.quantity
        });
        
        total += product.price * item.quantity;
      }
      
      // Update order total
      total = parseFloat(total.toFixed(2));
      order.total = total;
      
      // Create new order items
      for (const { product, quantity } of productDetails) {
        await OrderItem.create(
          {
            orderId: order.id,
            productId: product.id,
            quantity,
            priceAtPurchase: product.price,
          },
          { transaction }
        );
      }
    }
    
    // Update order status if provided
    if (status) {
      order.status = status;
    }
    
    // Save changes to order
    await order.save({ transaction });
    
    // Commit all changes
    await transaction.commit();
    
    // Return updated order with relationships
    const updatedOrder = await Order.findByPk(id, {
      include: [
        {
          model: OrderItem,
          include: [Product]
        },
        {
          model: User,
          attributes: ["id", "username", "email"]
        }
      ]
    });
    
    res.status(200).json(updatedOrder);
  } catch (error) {
    await transaction.rollback();
    console.error(`Error updating order ${id}:`, error);
    res.status(500).json({ error: "Failed to update order" });
  }
};

/**
 * Deletes an order and its items
 * Security: Users can only delete their own orders
 */
const deleteOrder = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const transaction = await sequelize.transaction();
  
  try {
    // Find order and verify ownership
    const order = await Order.findOne({
      where: { 
        id,
        userId
      }
    });
    
    if (!order) {
      await transaction.rollback();
      return res.status(404).json({ error: "Order not found" });
    }
    
    // Delete order (associated items deleted via cascade)
    await order.destroy({ transaction });
    
    // Commit the deletion
    await transaction.commit();
    
    res.status(200).json({ message: "Order deleted successfully" });
  } catch (error) {
    await transaction.rollback();
    console.error(`Error deleting order ${id}:`, error);
    res.status(500).json({ error: "Failed to delete order" });
  }
};

module.exports = {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrder,
  deleteOrder
};