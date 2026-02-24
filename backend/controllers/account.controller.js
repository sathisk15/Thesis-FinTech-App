import db from '../db/db.js';

export const getAccounts = (req, res) => {
  try {
    const userId = req.user.id;

    const accounts = db
      .prepare(
        `
      SELECT 
        id,
        account_type,
        account_number,
        currency,
        account_balance,
        is_active,
        createdat,
        updatedat
      FROM tblaccount
      WHERE user_id = ?
    `,
      )
      .all(userId);

    res.json({
      message: 'Accounts fetched successfully',
      accounts,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const createAccount = (req, res) => {
  try {
    const userId = req.user.id;
    const { account_type, currency, initialBalance } = req.body;

    if (!account_type) {
      return res.status(400).json({ message: 'Account type is required' });
    }

    if (initialBalance < 100) {
      return res
        .status(400)
        .json({ message: `Minimum Depost 100 ${currency} required` });
    }

    // Simple random account number (basic version)
    const accountNumber =
      'AC' + Math.floor(10000000 + Math.random() * 90000000);

    const result = db
      .prepare(
        `
      INSERT INTO tblaccount
      (user_id, account_type, account_number, currency, account_balance)
      VALUES (?, ?, ?, ?, ?)
    `,
      )
      .run(
        userId,
        account_type,
        accountNumber,
        currency || 'EUR',
        initialBalance,
      );

    const newAccount = db
      .prepare(
        `
      SELECT 
        id,
        account_type,
        account_number,
        currency,
        account_balance,
        is_active,
        createdat,
        updatedat
      FROM tblaccount
      WHERE id = ?
    `,
      )
      .get(result.lastInsertRowid);

    res.status(201).json({
      message: 'Account created successfully',
      account: newAccount,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deposit = (req, res) => {
  try {
    const userId = req.user.id;
    const { accountId } = req.params;
    const { amount, description } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid deposit amount' });
    }

    // Check account belongs to user
    const account = db
      .prepare(
        `
      SELECT * FROM tblaccount
      WHERE id = ? AND user_id = ?
    `,
      )
      .get(accountId, userId);

    if (!account) {
      return res.status(404).json({ message: 'Account not found' });
    }

    // Atomic transaction
    const depositTx = db.transaction(() => {
      // Insert transaction record
      db.prepare(
        `
        INSERT INTO tbltransaction
        (user_id, account_id, description, amount, type)
        VALUES (?, ?, ?, ?, 'credit')
      `,
      ).run(userId, accountId, description || 'Deposit', amount);

      // Update account balance
      db.prepare(
        `
        UPDATE tblaccount
        SET account_balance = account_balance + ?,
            updatedat = CURRENT_TIMESTAMP
        WHERE id = ?
      `,
      ).run(amount, accountId);
    });

    depositTx();

    const updatedAccount = db
      .prepare(
        `
      SELECT 
        id,
        account_type,
        account_number,
        currency,
        account_balance,
        is_active,
        createdat,
        updatedat
      FROM tblaccount
      WHERE id = ?
    `,
      )
      .get(accountId);

    res.json({
      message: 'Deposit successful',
      account: updatedAccount,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
