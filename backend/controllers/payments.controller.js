import db from '../db/db.js';

export const createExternalPayment = (req, res) => {
  try {
    const userId = req.user.id;

    const {
      fromAccountId,
      amount,
      description,
      recipientName,
      externalAccountNumber,
      externalBankName,
    } = req.body;

    const paymentAmount = Number(amount);

    // Basic validations
    if (!fromAccountId) {
      return res.status(400).json({ message: 'Source account required' });
    }

    if (!recipientName || !externalAccountNumber || !externalBankName) {
      return res.status(400).json({
        message: 'Recipient bank details are required',
      });
    }

    if (!paymentAmount || paymentAmount <= 0) {
      return res.status(400).json({ message: 'Invalid payment amount' });
    }

    // Fetch account
    const account = db
      .prepare(
        `
      SELECT * FROM tblaccount
      WHERE id = ? AND user_id = ?
    `,
      )
      .get(fromAccountId, userId);

    if (!account) {
      return res.status(404).json({ message: 'Account not found' });
    }

    if (account.account_balance < paymentAmount) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    const paymentTx = db.transaction(() => {
      const balanceBefore = account.account_balance;
      const balanceAfter = balanceBefore - paymentAmount;

      // Generate reference ID
      const reference = `PAY-${Date.now()}`;

      // Merge external details into description
      const userDescription = description?.trim() || 'External Payment';

      const finalDescription =
        `${userDescription} | To: ${recipientName} | ` +
        `Bank: ${externalBankName} | ` +
        `Acc: ****${externalAccountNumber.slice(-4)}`;

      // Insert transaction
      db.prepare(
        `
        INSERT INTO tbltransaction
        (
          user_id,
          account_id,
          description,
          reference,
          amount,
          type,
          balance_before,
          balance_after,
          status,
          category
        )
        VALUES (?, ?, ?, ?, ?, 'debit', ?, ?, 'Completed', 'external_payment')
      `,
      ).run(
        userId,
        fromAccountId,
        finalDescription,
        reference,
        paymentAmount,
        balanceBefore,
        balanceAfter,
      );

      // Update account balance
      db.prepare(
        `
        UPDATE tblaccount
        SET account_balance = ?, updatedat = CURRENT_TIMESTAMP
        WHERE id = ?
      `,
      ).run(balanceAfter, fromAccountId);
    });

    paymentTx();

    res.json({
      message: 'External payment successful',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
