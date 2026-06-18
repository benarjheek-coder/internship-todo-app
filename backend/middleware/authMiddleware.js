const jwt = require('jsonwebtoken');
const User = require('../models/User');

// This is a "guard" that stands in front of our secure routes.
const protect = async (req, res, next) => {
  let token;

  // We expect the frontend to send a token in the headers like: "Bearer 123xyz"
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Extract the actual token from the string
      token = req.headers.authorization.split(' ')[1];

      // Decode the token using our secret key to see who it belongs to
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Find the user in the database and attach them to the request (hide the password)
      req.user = await User.findById(decoded.id).select('-password');
      
      if (!req.user) {
        return res.status(401).json({ message: 'Not authorized, user no longer exists' });
      }

      next(); // The user is allowed! Move to the next step.
    } catch (error) {
      res.status(401).json({ message: 'Not authorized, invalid token' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};

module.exports = { protect };
