// controllers/orderController.js
const { User, Product, Order, OrderItem } = require("../models");
const { createOrderSchema, updateOrderSchema } = require("../schemas/orderSchemas");
const sequelize = require("../db");

// Get all orders
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
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

// Get order by ID
const getOrderById = async (req, res) => {
  const { id } = req.params;
  
  try {
    const order = await Order.findByPk(id, {
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

// Update an order
const updateOrder = async (req, res) => {
  const { id } = req.params;
  const transaction = await sequelize.transaction();
  
  try {
    // Find the order
    const order = await Order.findByPk(id);
    
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
    
    const { userId, products, status } = value;
    
    // Update userId if provided
    if (userId) {
      const user = await User.findByPk(userId);
      if (!user) {
        await transaction.rollback();
        return res.status(404).json({ error: "User not found" });
      }
      order.userId = userId;
    }
    
    // Update status if provided
    if (status) {
      order.status = status;
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

// Delete an order
const deleteOrder = async (req, res) => {
  const { id } = req.params;
  const transaction = await sequelize.transaction();
  
  try {
    const order = await Order.findByPk(id);
    
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