import { create } from 'zustand';
import api from '../api/axios';

export const useTransactionStore = create((set) => ({
  transactions: [],
  loading: false,
  error: null,

  fetchTransactions: async (accountId) => {
    set({ loading: true, error: null });

    try {
      let response;

      if (accountId) {
        // Specific account
        response = await api.get(`/accounts/${accountId}/transactions`);
      } else {
        // All accounts
        response = await api.get('/transactions');
      }

      set({ transactions: response.data.transactions });
    } catch (error) {
      set({ error: 'Failed to fetch transactions' });
    } finally {
      set({ loading: false });
    }
  },
}));

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
