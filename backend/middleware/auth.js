const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    console.log('Auth middleware: Processing request');
    console.log('Auth middleware: Headers:', req.headers);
    
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
        console.log('Auth middleware: No token provided');
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Auth middleware: Full decoded token:', decoded);
        console.log('Auth middleware: Token verified successfully', { 
            userId: decoded.userId,
            role: decoded.role 
        });
        
        // Add user from payload
        req.user = {
            _id: decoded.userId,
            role: decoded.role,
            department: decoded.department
        };
        next();
    } catch (error) {
        console.error('Auth middleware: Token verification failed:', error);
        res.status(401).json({ message: 'Token is not valid' });
    }
};

// Middleware to authorize roles
const authorizeRoles = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Access denied' });
        }
        next();
    };
};

module.exports = { authenticateToken: module.exports, authorizeRoles }; 