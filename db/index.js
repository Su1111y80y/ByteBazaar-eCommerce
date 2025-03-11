const express = require('express');
const sequelize = require('./db');
const dotenv = require('dotenv');
dotenv.config(); 

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Add routes here (e.g for Users)
// const userRouter = require('./routers/userRouter');
// app.use('/api/users', userRouter);

app.get('/', (req, res) => {
    res.send('API is running...');
});

// Data base connection and server start
sequelize.sync({ force: false }).then(() => { // force: existing tables will not be overridden
    app.listen(port, () => {
        console.log(`Server running on http://localhost:${port}`);
    });
}).catch((err) => {
    console.error('Database connection failed:', err);
});
