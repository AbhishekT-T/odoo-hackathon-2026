// Stub authentication and Role-Based Access Control (RBAC) middleware

/**
 * Middleware to authenticate user and extract role.
 * TODO: Implement JWT/Session verification.
 * For now, this stub automatically grants access and assigns a default 'Fleet Manager' role.
 */
const authenticateUser = (req, res, next) => {
  // Simulating an authenticated user
  req.user = {
    id: 1,
    email: 'admin@transitops.com',
    role: 'Fleet Manager' // Roles: 'Fleet Manager', 'Driver', 'Safety Officer', 'Financial Analyst'
  };
  next();
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
