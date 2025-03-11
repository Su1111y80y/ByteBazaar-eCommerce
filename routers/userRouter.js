const express = require('express');
const { createUser, getUserById, updateUser, deleteUser, getAllUsers } = require('../controllers/users');

const router = express.Router();

// Endpoints for user CRUD operations
router.post('/', createUser); // POST /api/users: Create new user
router.get('/', getAllUsers); // GET /api/users: Get all users
router.get('/:id', getUserById); // GET /api/users/:id: Get user by ID
router.put('/:id', updateUser); // PUT /api/users/:id: Update a user
router.delete('/:id', deleteUser); // DELETE /api/users/:id: Delete a user

module.exports = router;