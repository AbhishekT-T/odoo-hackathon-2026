const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'transitops-super-secret-key-1234';

/**
 * Middleware to authenticate user and extract role.
 */
const authenticateUser = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).json({ error: 'Access denied: Authentication token required.' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Access denied: Authentication token required.' });
  }

  try {
    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Access denied: Invalid authentication token.' });
  }
};

/**
 * Middleware to restrict access based on roles.
 * TODO: Enforce RBAC rules.
 * @param {string[]} allowedRoles 
 */
const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized: User authentication required.' });
    }
    
    // Check if the user's role is permitted
    if (allowedRoles.includes(req.user.role)) {
      next();
    } else {
      res.status(403).json({ 
        error: `Forbidden: Access restricted. Required roles: [${allowedRoles.join(', ')}]. Current role: ${req.user.role}` 
      });
    }
  };
};

module.exports = {
  authenticateUser,
  requireRole
};
