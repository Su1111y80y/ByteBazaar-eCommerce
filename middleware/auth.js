/**
 * Authentication Middleware for JWT Verification
 * 
 * This middleware protects routes by validating JWT tokens in the Authorization header.
 * It extracts user information from valid tokens and makes it available to route handlers.
 */
const jwt = require('jsonwebtoken');

/**
 * Authenticate requests using JWT tokens
 * 
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next middleware function
 * @returns {void}
 */
const auth = (req, res, next) => {
  try {
    // Extract the Authorization header from the request
    const authHeader = req.headers.authorization;
    
    // Check if the header exists and has the correct format
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token, authorization denied' });
    }
    
    // Extract the token portion from the "Bearer <token>" format
    const token = authHeader.split(' ')[1];
    
    // Verify the token and decode its payload
    // Use environment variable for secret or fallback to default (for development only)
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-default-secret-key');
    
    // Attach the user ID from the token payload to the request object
    // This makes user info available to downstream route handlers
    req.user = {
      id: decoded.id
    };
    
    // Proceed to the next middleware or route handler
    next();
  } catch (error) {
    // Return authentication failure if token is invalid or expired
    res.status(401).json({ error: 'Token is not valid' });
  }
};

module.exports = auth;