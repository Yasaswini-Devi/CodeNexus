const jwt = require('jsonwebtoken');

module.exports = function authMiddleware(req, res, next) {
    const authHeader = req.headers['authorization'];
    console.log(`[AUTH] ${req.method} ${req.path} | header: ${authHeader ? authHeader.substring(0, 30) + '...' : 'MISSING'}`);

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.log('[AUTH] REJECTED: No/invalid Authorization header');
        return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    if (token === 'null' || token === 'undefined') {
        console.log('[AUTH] REJECTED: Token is literal string null/undefined');
        return res.status(401).json({ error: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('[AUTH] OK | user id:', decoded.id);
        req.user = decoded;
        next();
    } catch (err) {
        console.log('[AUTH] REJECTED: JWT verify failed:', err.message);
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
};
