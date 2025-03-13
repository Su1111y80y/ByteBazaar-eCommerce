const express = require('express');
const router = express.Router();
const { createUser, getUserById, updateUser, deleteUser, getAllUsers, loginUser } = require('../controllers/users');

// Endpoints for user CRUD operations
router.post('/', createUser); // POST /api/users: Create new user
router.get('/', getAllUsers); // GET /api/users: Get all users
router.get('/:id', getUserById); // GET /api/users/:id: Get user by ID
router.put('/:id', updateUser); // PUT /api/users/:id: Update a user
router.delete('/:id', deleteUser); // DELETE /api/users/:id: Delete a user
router.post('/login', loginUser); // POST /api/users/login: Login user

module.exports = router;