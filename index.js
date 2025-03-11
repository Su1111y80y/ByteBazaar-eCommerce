const express = require('express');
const sequelize = require('./db'); // Importing the DB connection
const dotenv = require('dotenv');
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Loading user router
const userRouter = require('./routers/userRouter');
app.use('/api/users', userRouter);

app.get('/', (req, res) => {
    res.send('API is running...');
});

// Database connection and server start
sequelize.sync({ force: false }).then(() => {
    app.listen(port, () => {
        console.log(`Server running on http://localhost:${port}`);
    });
}).catch((err) => {
    console.error('Database connection failed:', err);
});
