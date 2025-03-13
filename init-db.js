// init-db.js
const sequelize = require('./db');
const { Product, Category, User, Order, OrderItem } = require('./models');
const bcrypt = require('bcryptjs');

async function initDB() {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    
    console.log('Creating tables...');
    // This will create all tables. Use { force: true } to drop and recreate tables
    await sequelize.sync({ force: true });
    
    console.log('Tables created successfully. Adding seed data...');
    
    // Create seed categories
    const categories = await Category.bulkCreate([
      { name: "Electronics" },
      { name: "Clothing" },
      { name: "Books" },
      { name: "Home & Kitchen" }
    ]);
    
    // Create seed products
    const products = await Product.bulkCreate([
      {
        name: "Smartphone",
        description: "Latest model smartphone with advanced features",
        price: 699.99,
        categoryId: 1
      },
      {
        name: "Laptop",
        description: "High-performance laptop for work and gaming",
        price: 1299.99,
        categoryId: 1
      },
      {
        name: "T-shirt",
        description: "Comfortable cotton t-shirt",
        price: 19.99,
        categoryId: 2
      },
      {
        name: "Jeans",
        description: "Classic blue jeans",
        price: 49.99,
        categoryId: 2
      },
      {
        name: "Novel",
        description: "Bestselling fiction novel",
        price: 14.99,
        categoryId: 3
      }
    ]);
    
    // Create a seed user (with hashed password)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("password123", salt);
    
    const users = await User.bulkCreate([
      {
        username: "testuser",
        email: "test@example.com",
        password: hashedPassword
      }
    ]);
    
    console.log('Seed data added successfully!');
    console.log('Database initialization complete.');
    
  } catch (error) {
    console.error('Database initialization failed:', error);
  } finally {
    await sequelize.close();
  }
}

// Run the initialization
initDB();