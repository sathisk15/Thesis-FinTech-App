import jwt from 'jsonwebtoken';

// S5: JWT secret from environment — no hardcoded value
const JWT_SECRET = process.env.JWT_SECRET;

export const authenticate = (req, res, next) => {
  // S7: read token from HttpOnly cookie instead of Authorization header
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};
