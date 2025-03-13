const User = require('../models/User');
const bcrypt = require('bcryptjs');
const userSchema = require('../schemas/userSchemas');
const jwt = require('jsonwebtoken');


// GET: Get user by ID
const getUserById = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({
            id: user.id,
            username: user.username,
            email: user.email,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching user' });
    }
};

// GET: Get all users
const getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll(); // Ruft alle Benutzer ab
        res.status(200).json(users); // Gibt die Liste der Benutzer zurück
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching users' });
    }
};



// CREATE: Add new user
const createUser = async (req, res) => {
    const { error } = userSchema.validate(req.body);  // Validation with Joi
    if (error) {
        return res.status(400).json({
            error: 'Validation failed',
            details: error.details.map((detail) => detail.message),
        });
    }

    try {
        const { username, email, password } = req.body;
        const newUser = await User.create({ username, email, password });
        res.status(201).json({
            message: 'User created successfully',
            user: {
                id: newUser.id,
                username: newUser.username,
                email: newUser.email,
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error creating user' });
    }
};

// UPDATE: Update user information
const updateUser = async (req, res) => {
    const { error } = userSchema.validate(req.body);  // Validation with Joi
    if (error) {
        return res.status(400).json({
            error: 'Validation failed',
            details: error.details.map((detail) => detail.message),
        });
    }

    try {
        const { username, email, password } = req.body;
        const user = await User.findByPk(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.username = username || user.username;
        user.email = email || user.email;

        if (password) {
            // Hash password if it's being updated
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
        }

        await user.save();

        res.status(200).json({
            message: 'User updated successfully',
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating user' });
    }
};

// DELETE: Delete a user
const deleteUser = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        await user.destroy();
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error deleting user' });
    }
};

// Login user
const loginUser = async (req, res) => {
    try {
      const { email, password } = req.body;
  
      // Find user by email
      const user = await User.findOne({ where: { email } });
      
      if (!user) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }
  
      // Check password
      const isMatch = await user.comparePassword(password);
      
      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }
  
      // Create JWT token
      const token = jwt.sign(
        { id: user.id },
        process.env.JWT_SECRET || 'your-default-secret-key',
        { expiresIn: '1d' }
      );
  
      // Return user info without password
      const userWithoutPassword = {
        id: user.id,
        username: user.username,
        email: user.email
      };
  
      res.json({
        token,
        user: userWithoutPassword
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  };

module.exports = {
    createUser,
    getUserById,
    getAllUsers,
    updateUser,
    deleteUser,
    loginUser,
};
