const express = require("express");
const sequelize = require("./db"); 
const dotenv = require("dotenv");
const cors = require("cors"); // Add this line
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Add CORS middleware before other middleware
app.use(cors()); // This will allow requests from any origin
app.use(express.json());

// Loading routers
const userRouter = require("./routers/userRouter");
app.use("/api/users", userRouter);

const productRouter = require("./routers/productRouter");
app.use("/products", productRouter);

const categoryRouter = require("./routers/categoryRoutes");
app.use("/categories", categoryRouter);

const orderRouter = require("./routers/orderRouter");
app.use("/orders", orderRouter);

app.get("/", (req, res) => {
  res.send("API is running...");
});

// Database connection and server start
sequelize
  .sync({ force: false })
  .then(() => {
    app.listen(port, () => {
      console.log(`Server running on http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.error("Database connection failed:", err);
  });