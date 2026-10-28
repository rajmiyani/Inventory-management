/**
 * Role-Based Access Control (RBAC) Middleware
 * @param {string[]} allowedRoles - Array of permitted roles (e.g. ['owner', 'manager'])
 */
const requireRole = (allowedRoles = []) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Unauthorized: Authentication required' });
        }

        const userRole = req.user.role;

        // superadmin has master bypass across all endpoints
        if (userRole === 'superadmin') {
            return next();
        }

        // Map legacy roles if needed: admin -> owner, staff -> cashier
        const normalizedRole = userRole === 'admin' ? 'owner' : (userRole === 'staff' ? 'cashier' : userRole);

        if (!allowedRoles.includes(normalizedRole)) {
            return res.status(403).json({ 
                error: `Access Denied: Your role '${userRole}' does not have permission to perform this action` 
            });
        }

        next();
    };
};

module.exports = { requireRole };
