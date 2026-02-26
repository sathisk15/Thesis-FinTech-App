import db from '../db/db.js';

export const getAccounts = (req, res) => {
  try {
    const userId = req.user.id;

    const accounts = db
      .prepare(
        `
      SELECT 
        id,
        account_name,
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
    const { account_name, account_type, currency, initialBalance } = req.body;

    if (!account_type) {
      return res.status(400).json({ message: 'Account type is required' });
    }

    if (!initialBalance || initialBalance < 100) {
      return res.status(400).json({
        message: `Minimum deposit 100 ${currency || 'EUR'} required`,
      });
    }

    const accountNumber =
      'AC' + Math.floor(10000000 + Math.random() * 90000000);

    const createAccountTx = db.transaction(() => {
      // 1️⃣ Create account with zero balance first
      const result = db
        .prepare(
          `
        INSERT INTO tblaccount
        (user_id,account_name, account_type, account_number, currency, account_balance)
        VALUES (?, ?, ?, ?, ?, 0)
      `,
        )
        .run(
          userId,
          account_name,
          account_type,
          accountNumber,
          currency || 'EUR',
        );

      const accountId = result.lastInsertRowid;

      // 2️⃣ Insert initial deposit transaction
      db.prepare(
        `
        INSERT INTO tbltransaction
        (
          user_id,
          account_id,
          description,
          amount,
          type,
          balance_before,
          balance_after
        )
        VALUES (?, ?, ?, ?, 'credit', ?, ?)
      `,
      ).run(
        userId,
        accountId,
        'Initial Deposit',
        initialBalance,
        0,
        initialBalance,
      );

      // 3️⃣ Update account balance
      db.prepare(
        `
        UPDATE tblaccount
        SET account_balance = ?,
            updatedat = CURRENT_TIMESTAMP
        WHERE id = ?
      `,
      ).run(initialBalance, accountId);

      return accountId;
    });

    const accountId = createAccountTx();

    const newAccount = db
      .prepare(
        `
      SELECT 
        id,
        account_type,
        account_name,
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

    res.status(201).json({
      message: 'Account created successfully',
      account: newAccount,
    });
  } catch (error) {
    console.error(error);

    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(400).json({
        message: 'Account type already exists for this user',
      });
    }

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

    const depositTx = db.transaction(() => {
      const balanceBefore = account.account_balance;
      const balanceAfter = balanceBefore + amount;

      // 1️⃣ Insert transaction
      db.prepare(
        `
        INSERT INTO tbltransaction
        (
          user_id,
          account_id,
          description,
          amount,
          type,
          balance_before,
          balance_after
        )
        VALUES (?, ?, ?, ?, 'credit', ?, ?)
      `,
      ).run(
        userId,
        accountId,
        description || 'Deposit',
        amount,
        balanceBefore,
        balanceAfter,
      );

      // 2️⃣ Update balance
      db.prepare(
        `
        UPDATE tblaccount
        SET account_balance = ?,
            updatedat = CURRENT_TIMESTAMP
        WHERE id = ?
      `,
      ).run(balanceAfter, accountId);
    });

    depositTx();

    const updatedAccount = db
      .prepare(
        `
      SELECT 
        id,
        account_name,
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

export const getTransactionsByAccount = (req, res) => {
  try {
    const userId = req.user.id;
    const { accountId } = req.params;

    // 1️⃣ Verify account belongs to user
    const account = db
      .prepare(
        `
      SELECT id FROM tblaccount
      WHERE id = ? AND user_id = ?
    `,
      )
      .get(accountId, userId);

    if (!account) {
      return res.status(404).json({ message: 'Account not found' });
    }

    // 2️⃣ Fetch transactions
    const transactions = db
      .prepare(
        `
      SELECT
        id,
        account_id,
        description,
        reference,
        amount,
        type,
        balance_before,
        balance_after,
        status,
        category,
        createdat
      FROM tbltransaction
      WHERE account_id = ?
      ORDER BY createdat DESC
    `,
      )
      .all(accountId);

    res.json({
      message: 'Transactions fetched successfully',
      transactions,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getAllTransactions = (req, res) => {
  try {
    const userId = req.user.id;

    const transactions = db
      .prepare(
        `
      SELECT
        id,
        account_id,
        description,
        reference,
        amount,
        type,
        balance_before,
        balance_after,
        status,
        category,
        createdat
      FROM tbltransaction
      WHERE user_id = ?
      ORDER BY createdat DESC
    `,
      )
      .all(userId);

    res.json({
      message: 'All transactions fetched successfully',
      transactions,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const transfer = (req, res) => {
  try {
    const userId = req.user.id;
    const { fromAccountId, toAccountId, amount, description } = req.body;

    const transferAmount = Number(amount);

    if (!fromAccountId || !toAccountId) {
      return res.status(400).json({ message: 'Both accounts are required' });
    }

    if (fromAccountId === toAccountId) {
      return res
        .status(400)
        .json({ message: 'Cannot transfer to same account' });
    }

    if (!transferAmount || transferAmount <= 0) {
      return res.status(400).json({ message: 'Invalid transfer amount' });
    }

    // Fetch both accounts
    const fromAccount = db
      .prepare(
        `
      SELECT * FROM tblaccount
      WHERE id = ? AND user_id = ?
    `,
      )
      .get(fromAccountId, userId);

    const toAccount = db
      .prepare(
        `
      SELECT * FROM tblaccount
      WHERE id = ? AND user_id = ?
    `,
      )
      .get(toAccountId, userId);

    if (!fromAccount || !toAccount) {
      return res.status(404).json({ message: 'Account not found' });
    }

    if (fromAccount.account_balance < transferAmount) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    const transferTx = db.transaction(() => {
      const fromBefore = fromAccount.account_balance;
      const fromAfter = fromBefore - transferAmount;

      const toBefore = toAccount.account_balance;
      const toAfter = toBefore + transferAmount;

      // 1️⃣ Insert debit transaction (from account)
      db.prepare(
        `
        INSERT INTO tbltransaction
        (
          user_id,
          account_id,
          description,
          amount,
          type,
          balance_before,
          balance_after
        )
        VALUES (?, ?, ?, ?, 'debit', ?, ?)
      `,
      ).run(
        userId,
        fromAccountId,
        description || 'Transfer Out',
        transferAmount,
        fromBefore,
        fromAfter,
      );

      // 2️⃣ Insert credit transaction (to account)
      db.prepare(
        `
        INSERT INTO tbltransaction
        (
          user_id,
          account_id,
          description,
          amount,
          type,
          balance_before,
          balance_after
        )
        VALUES (?, ?, ?, ?, 'credit', ?, ?)
      `,
      ).run(
        userId,
        toAccountId,
        description || 'Transfer In',
        transferAmount,
        toBefore,
        toAfter,
      );

      // 3️⃣ Update balances
      db.prepare(
        `
        UPDATE tblaccount
        SET account_balance = ?, updatedat = CURRENT_TIMESTAMP
        WHERE id = ?
      `,
      ).run(fromAfter, fromAccountId);

      db.prepare(
        `
        UPDATE tblaccount
        SET account_balance = ?, updatedat = CURRENT_TIMESTAMP
        WHERE id = ?
      `,
      ).run(toAfter, toAccountId);
    });

    transferTx();

    res.json({ message: 'Transfer successful' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
