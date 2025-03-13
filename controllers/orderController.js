// controllers/orderController.js
const { Order, User, Product, OrderItem } = require("../models");
const { createOrderSchema, updateOrderSchema } = require("../schemas/orderSchemas");
const sequelize = require("../db");

// Helper function to calculate total price
const calculateOrderTotal = async (products) => {
  let total = 0;
  
  for (const item of products) {
    const product = await Product.findByPk(item.productId);
    
    if (!product) {
      throw new Error(`Product with ID ${item.productId} not found`);
    }
    
    total += product.price * item.quantity;
  }
  
  return parseFloat(total.toFixed(2));
};

// Get all orders - MODIFIED to only show user's own orders
const getAllOrders = async (req, res) => {
  try {
    // Get the authenticated user's ID from the request
    const userId = req.user.id;
    
    // Only fetch orders belonging to this user
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

// Get order by ID - MODIFIED to ensure users can only see their own orders
const getOrderById = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  
  try {
    // Find the order and ensure it belongs to the authenticated user
    const order = await Order.findOne({
      where: {
        id,
        userId // This ensures the order belongs to the authenticated user
      },
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
    
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    
    res.status(200).json(order);
  } catch (error) {
    console.error(`Error fetching order ${id}:`, error);
    res.status(500).json({ error: "Failed to fetch order" });
  }
};

// Create a new order
const createOrder = async (req, res) => {
  // Start a transaction
  const transaction = await sequelize.transaction();
  
  try {
    // Validate request body
    const { error, value } = createOrderSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    
    const { userId, products } = value;
    
    // Security check: Ensure the authenticated user can only create orders for themselves
    if (userId !== req.user.id) {
      await transaction.rollback();
      return res.status(403).json({ error: "You can only create orders for yourself" });
    }
    
    // Check if user exists
    const user = await User.findByPk(userId);
    if (!user) {
      await transaction.rollback();
      return res.status(404).json({ error: "User not found" });
    }
    
    // Check if all products exist and calculate total
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
    
    // Round total to 2 decimal places
    total = parseFloat(total.toFixed(2));
    
    // Create order
    const newOrder = await Order.create(
      {
        userId,
        total,
      },
      { transaction }
    );
    
    // Create order items
    const orderItems = [];
    for (const { product, quantity } of productDetails) {
      const orderItem = await OrderItem.create(
        {
          orderId: newOrder.id,
          productId: product.id,
          quantity,
          priceAtPurchase: product.price,
        },
        { transaction }
      );
      
      orderItems.push(orderItem);
    }
    
    // Commit transaction
    await transaction.commit();
    
    // Return order with items
    const createdOrder = await Order.findByPk(newOrder.id, {
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
    
    res.status(201).json(createdOrder);
  } catch (error) {
    // Rollback transaction on error
    await transaction.rollback();
    console.error("Error creating order:", error);
    res.status(500).json({ error: "Failed to create order" });
  }
};

// Update an order - MODIFIED to ensure users can only update their own orders
const updateOrder = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const transaction = await sequelize.transaction();
  
  try {
    // Find the order and ensure it belongs to the authenticated user
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
    
    // Validate request body
    const { error, value } = updateOrderSchema.validate(req.body);
    
    if (error) {
      await transaction.rollback();
      return res.status(400).json({ error: error.details[0].message });
    }
    
    const { products, status } = value;
    
    // Security check: If userId is in the request body, ensure it matches the authenticated user
    if (value.userId && value.userId !== userId) {
      await transaction.rollback();
      return res.status(403).json({ error: "You cannot transfer an order to another user" });
    }
    
    // Update products if provided
    if (products) {
      // Delete existing order items
      await OrderItem.destroy({ 
        where: { orderId: id },
        transaction
      });
      
      // Check if all products exist and calculate new total
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
      
      // Round total to 2 decimal places
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
    
    // Update status if provided
    if (status) {
      order.status = status;
    }
    
    // Save the order
    await order.save({ transaction });
    
    // Commit transaction
    await transaction.commit();
    
    // Return updated order with items
    const updatedOrder = await Order.findByPk(id, {
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
    
    res.status(200).json(updatedOrder);
  } catch (error) {
    // Rollback transaction on error
    await transaction.rollback();
    console.error(`Error updating order ${id}:`, error);
    res.status(500).json({ error: "Failed to update order" });
  }
};

// Delete an order - MODIFIED to ensure users can only delete their own orders
const deleteOrder = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const transaction = await sequelize.transaction();
  
  try {
    // Find the order and ensure it belongs to the authenticated user
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
    
    // Delete order (cascade will delete order items)
    await order.destroy({ transaction });
    
    // Commit transaction
    await transaction.commit();
    
    res.status(200).json({ message: "Order deleted successfully" });
  } catch (error) {
    // Rollback transaction on error
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