// scripts/seedFakerusersWithOrders.js

// To use the script, set the desired number of fake users in the `NUMBER_OF_FAKE_USERS` variable in line 11. 
// Then, run the script with:  ```bash node scripts/seedFakerusersWithOrders.js


const { faker } = require('@faker-js/faker');
const { User, Product, Category, Order, OrderItem } = require('../models'); // importing models

// Set the number of fake users to create
const NUMBER_OF_FAKE_USERS = 30;

// Function to create fake users with orders
async function createFakeUsersWithOrders() {
  try {
    console.log(`Seeding ${NUMBER_OF_FAKE_USERS} fake users with orders...`);

    // Create fake users
    const users = [];
    for (let i = 0; i < NUMBER_OF_FAKE_USERS; i++) {
      const firstName = faker.name.firstName();
      const lastName = faker.name.lastName();
      const email = faker.internet.email(firstName, lastName);
      const username = faker.internet.userName(firstName, lastName);
      const password = 'password123'; // All users have the same password

      const user = await User.create({
        username,
        email,
        password,
      });
      users.push(user);
    }

    console.log(`${NUMBER_OF_FAKE_USERS} users created successfully!`);

    // Create an order for each user
    for (let user of users) {
      const order = await Order.create({
        userId: user.id,
        total: 0, // Total price will be calculated later
        status: 'pending',
      });

      // Add order items for this order
      const products = await Product.findAll();
      let total = 0;

      // Random number of products for the order (between 1 and 5 products)
      const randomNumberOfProducts = faker.number.int({ min: 1, max: 5 });
      for (let i = 0; i < randomNumberOfProducts; i++) {
        // Select a random product
        const randomProduct = products[Math.floor(Math.random() * products.length)];
        const quantity = faker.number.int({ min: 1, max: 3 }); // Quantity between 1 and 3

        // Add order item
        await OrderItem.create({
          orderId: order.id,
          productId: randomProduct.id,
          quantity,
          priceAtPurchase: randomProduct.price,
        });

        // Calculate total order price
        total += randomProduct.price * quantity;
      }

      // Update order total price
      await order.update({ total });
    }

    console.log("Fake users with orders created successfully!");

  } catch (error) {
    console.error('Error seeding users with orders:', error);
  }
}

createFakeUsersWithOrders();
