import db from '../db/db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const JWT_SECRET = 'supersecret';

export const register = async (req, res) => {
  try {
    const { email, password, firstname, lastname } = req.body;

    if (!email || !password || !firstname) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Check if user already exists
    const existingUser = db
      .prepare('SELECT * FROM tbluser WHERE email = ?')
      .get(email);

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    const result = db
      .prepare(
        `
        INSERT INTO tbluser (email, password, firstname, lastname)
        VALUES (?, ?, ?, ?)
      `,
      )
      .run(email, hashedPassword, firstname, lastname);

    const userId = result.lastInsertRowid;

    // Create JWT
    const token = jwt.sign({ id: userId, email }, JWT_SECRET, {
      expiresIn: '1d',
    });

    res.status(201).json({
      message: 'User registered successfully',
      token,
    });
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

    // Find user
    const user = db.prepare('SELECT * FROM tbluser WHERE email = ?').get(email);

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: '1d',
    });

    res.json({
      message: 'Login successful',
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getCurrentUser = (req, res) => {
  try {
    const userId = req.user.id;

    const user = db
      .prepare(
        `
    SELECT 
      id,
      email,
      firstname,
      lastname,
      contact,
      provider,
      country,
      currency,
      createdat,
      updatedat
    FROM tbluser
    WHERE id = ?
  `,
      )
      .get(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'User fetched successfully',
      user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateProfile = (req, res) => {
  try {
    const userId = req.user.id;
    const { firstname, lastname, contact, country, currency } = req.body;

    // Update only allowed fields
    db.prepare(
      `
      UPDATE tbluser
      SET 
        firstname = COALESCE(?, firstname),
        lastname = COALESCE(?, lastname),
        contact = COALESCE(?, contact),
        country = COALESCE(?, country),
        currency = COALESCE(?, currency),
        updatedat = CURRENT_TIMESTAMP
      WHERE id = ?
    `,
    ).run(firstname, lastname, contact, country, currency, userId);

    const updatedUser = db
      .prepare(
        `
      SELECT 
        id,
        email,
        firstname,
        lastname,
        contact,
        provider,
        country,
        currency,
        createdat,
        updatedat
      FROM tbluser
      WHERE id = ?
    `,
      )
      .get(userId);

    res.json({
      message: 'Profile updated successfully',
      user: updatedUser,
    });
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

    // Get user with password
    const user = db
      .prepare('SELECT password FROM tbluser WHERE id = ?')
      .get(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Compare current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    db.prepare(
      `
      UPDATE tbluser
      SET password = ?, updatedat = CURRENT_TIMESTAMP
      WHERE id = ?
    `,
    ).run(hashedPassword, userId);

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
