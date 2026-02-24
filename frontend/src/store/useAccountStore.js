import { create } from 'zustand';
import api from '../api/axios';

export const useAccountStore = create((set) => ({
  accounts: [],
  loading: false,
  error: null,

  fetchAccounts: async () => {
    set({ loading: true, error: null });
    try {
      const response = await api.get('/accounts');
      set({ accounts: response.data.accounts });
    } catch (error) {
      set({ error: 'Failed to fetch accounts' });
    } finally {
      set({ loading: false });
    }
  },

  addAccount: async (accountData) => {
    try {
      const response = await api.post('/accounts', accountData);
      set((state) => ({
        accounts: [...state.accounts, response.data.account],
      }));
    } catch (error) {
      console.error(error);
    }
  },

  depositMoney: async (accountId, amount, description) => {
    try {
      const response = await api.post(`/accounts/${accountId}/deposit`, {
        amount,
        description,
      });

      const updatedAccount = response.data.account;

      set((state) => ({
        accounts: state.accounts.map((acc) =>
          String(acc.id) === String(accountId) ? updatedAccount : acc,
        ),
      }));
    } catch (error) {
      throw error;
    }
  },
}));
