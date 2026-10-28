const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Business = require('../models/Business');

const verifyToken = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }

    const token = authHeader.split('Bearer ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // { id, role, businessId }

        // If businessId is already in token
        if (decoded.businessId) {
            req.businessId = decoded.businessId;
            return next();
        }

        // If legacy token or missing businessId, query user
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(401).json({ error: 'User not found' });
        }

        if (user.businessId) {
            req.businessId = user.businessId;
            req.user.businessId = user.businessId;
            req.user.role = user.role;
            return next();
        }

        // Auto-heal / fallback: find or create default business for legacy account
        let defaultBusiness = await Business.findOne({ ownerId: user._id });
        if (!defaultBusiness) {
            const slug = `store-${user._id.toString().slice(-6)}`;
            defaultBusiness = new Business({
                name: `${user.name}'s Store`,
                slug,
                ownerId: user._id,
                email: user.email,
                currency: 'INR'
            });
            await defaultBusiness.save();
        }

        user.businessId = defaultBusiness._id;
        user.role = 'owner';
        await user.save();

        req.businessId = defaultBusiness._id;
        req.user.businessId = defaultBusiness._id;
        req.user.role = 'owner';
        next();
    } catch (error) {
        console.error('Error verifying token:', error);
        res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
};

module.exports = verifyToken;
