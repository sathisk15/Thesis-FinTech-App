import db from '../db/db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// S5: JWT secret loaded from environment — no hardcoded secrets
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || JWT_SECRET + '_refresh';

// S7: Cookie options — HttpOnly prevents JS access; SameSite=Strict blocks CSRF (S8)
const ACCESS_COOKIE_OPTS = {
  httpOnly: true,
  sameSite: 'Strict',
  secure: false,              // set true when served over HTTPS
  maxAge: 15 * 60 * 1000,    // S6: 15 minutes
};

const REFRESH_COOKIE_OPTS = {
  httpOnly: true,
  sameSite: 'Strict',
  secure: false,
  maxAge: 7 * 24 * 60 * 60 * 1000, // S6: 7 days
};

function issueTokens(res, payload) {
  // S6: short-lived access token
  const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '15m' });
  // S6: long-lived refresh token
  const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: '7d' });

  // S7: set both as HttpOnly cookies — never exposed to client JS
  res.cookie('token', accessToken, ACCESS_COOKIE_OPTS);
  res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTS);
}

export const register = async (req, res) => {
  try {
    const { email, password, firstname, lastname } = req.body;

    if (!email || !password || !firstname) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const existingUser = db
      .prepare('SELECT * FROM tbluser WHERE email = ?')
      .get(email);

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = db
      .prepare(
        `INSERT INTO tbluser (email, password, firstname, lastname)
         VALUES (?, ?, ?, ?)`,
      )
      .run(email, hashedPassword, firstname, lastname);

    const userId = result.lastInsertRowid;

    // S7: issue tokens as cookies, return no token in body
    issueTokens(res, { id: userId, email });

    res.status(201).json({ success: true, message: 'User registered successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Missing email or password' });
    }

    const user = db.prepare('SELECT * FROM tbluser WHERE email = ?').get(email);

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // S7: issue tokens as cookies, return no token in body
    issueTokens(res, { id: user.id, email: user.email });

    res.json({ success: true, message: 'Login successful' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// S6: refresh endpoint — issues new access token using the long-lived refresh cookie
export const refresh = (req, res) => {
  const refreshToken = req.cookies?.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  try {
    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
    const newAccessToken = jwt.sign(
      { id: decoded.id, email: decoded.email },
      JWT_SECRET,
      { expiresIn: '15m' },
    );
    res.cookie('token', newAccessToken, ACCESS_COOKIE_OPTS);
    res.json({ success: true });
  } catch {
    res.status(401).json({ success: false, message: 'Invalid refresh token' });
  }
};

// S7: logout — clear both cookies server-side
export const logout = (req, res) => {
  res.clearCookie('token', { httpOnly: true, sameSite: 'Strict' });
  res.clearCookie('refreshToken', { httpOnly: true, sameSite: 'Strict' });
  res.json({ success: true, message: 'Logged out' });
};

export const getCurrentUser = (req, res) => {
  try {
    const userId = req.user.id;

    const user = db
      .prepare(
        `SELECT id, email, firstname, lastname, contact, provider,
                country, currency, createdat, updatedat
         FROM tbluser WHERE id = ?`,
      )
      .get(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User fetched successfully', user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateProfile = (req, res) => {
  try {
    const userId = req.user.id;
    const { firstname, lastname, contact, country, currency } = req.body;

    db.prepare(
      `UPDATE tbluser
       SET firstname = COALESCE(?, firstname),
           lastname  = COALESCE(?, lastname),
           contact   = COALESCE(?, contact),
           country   = COALESCE(?, country),
           currency  = COALESCE(?, currency),
           updatedat = CURRENT_TIMESTAMP
       WHERE id = ?`,
    ).run(firstname, lastname, contact, country, currency, userId);

    const updatedUser = db
      .prepare(
        `SELECT id, email, firstname, lastname, contact, provider,
                country, currency, createdat, updatedat
         FROM tbluser WHERE id = ?`,
      )
      .get(userId);

    res.json({ message: 'Profile updated successfully', user: updatedUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Missing password fields' });
    }

    const user = db
      .prepare('SELECT password FROM tbluser WHERE id = ?')
      .get(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    db.prepare(
      `UPDATE tbluser SET password = ?, updatedat = CURRENT_TIMESTAMP WHERE id = ?`,
    ).run(hashedPassword, userId);

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
