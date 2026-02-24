import { useEffect, useState } from 'react';
import { useAccountStore } from '../../store/useAccountStore';
import api from '../../api/axios';
import { useNavigate } from 'react-router-dom';

const TransferPage = () => {
  const navigate = useNavigate();

  const accounts = useAccountStore((state) => state.accounts);
  const fetchAccounts = useAccountStore((state) => state.fetchAccounts);

  const [fromAccountId, setFromAccountId] = useState('');
  const [toAccountId, setToAccountId] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [isDescriptionEdited, setIsDescriptionEdited] = useState(false);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  // Reset TO account if FROM changes
  useEffect(() => {
    if (fromAccountId === toAccountId) {
      setToAccountId('');
    }
  }, [fromAccountId, toAccountId]);

  const fromAccount = accounts.find((acc) => acc.id === fromAccountId);

  const toAccount = accounts.find((acc) => acc.id === toAccountId);

  // Dynamic Description
  useEffect(() => {
    if (fromAccount && toAccount && amount && !isDescriptionEdited) {
      const newDescription = `Internal transfer of ${
        fromAccount.currency
      } ${Number(amount).toFixed(2)} from ${
        fromAccount.account_type
      } Account ${fromAccount.account_number?.slice(-4)} to ${
        toAccount.account_type
      } Account ${toAccount.account_number?.slice(-4)}.`;

      setDescription(newDescription);
    }
  }, [fromAccount, toAccount, amount, isDescriptionEdited]);

  const handleTransfer = async () => {
    setError('');

    if (!fromAccountId) return setError('Please select From Account.');

    if (!toAccountId) return setError('Please select To Account.');

    if (fromAccountId === toAccountId)
      return setError('Cannot transfer to same account.');

    if (!amount || Number(amount) <= 0)
      return setError('Amount must be greater than 0.');

    if (Number(amount) > fromAccount?.balance)
      return setError('Insufficient balance.');

    try {
      setLoading(true);

      await api.post('/accounts/transfer', {
        fromAccountId,
        toAccountId,
        amount: Number(amount),
        description,
      });

      navigate('/transactions');
    } catch (err) {
      setError('Transfer failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-text mb-2">
          Transfer Money
        </h1>
        <p className="text-text/60">
          Send money securely between your accounts
        </p>
      </div>

      <div className="bg-card border border-border rounded-lg p-8 space-y-8">
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-500 text-sm px-3 py-2 rounded-md">
            {error}
          </div>
        )}

        {/* From Account */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-text/60">
            From Account
          </label>
          <select
            value={fromAccountId}
            onChange={(e) =>
              setFromAccountId(e.target.value ? Number(e.target.value) : '')
            }
            className="w-full h-10 px-3 rounded-md bg-background border border-border text-text outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Select account</option>
            {accounts.map((acc) => (
              <option key={acc.id} value={acc.id}>
                {acc.account_type} •••• {acc.account_number?.slice(-4)} (
                {acc.currency} {acc.balance})
              </option>
            ))}
          </select>
        </div>

        {/* To Account */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-text/60">To Account</label>
          <select
            disabled={!fromAccountId}
            value={toAccountId}
            onChange={(e) =>
              setToAccountId(e.target.value ? Number(e.target.value) : '')
            }
            className="w-full h-10 px-3 rounded-md bg-background border border-border text-text outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
          >
            <option value="">Select account</option>
            {accounts
              .filter((acc) => acc.id !== fromAccountId)
              .map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.account_type} •••• {acc.account_number?.slice(-4)}
                </option>
              ))}
          </select>
        </div>

        {/* Amount */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-text/60">Amount</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
            className="w-full h-10 px-3 rounded-md bg-background border border-border text-text outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-text/60">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              setIsDescriptionEdited(true);
            }}
            className="w-full min-h-[80px] px-3 py-2 rounded-md bg-background border border-border text-text outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Summary */}
        <div className="bg-background border border-border rounded-md p-4 space-y-2">
          <p className="text-sm text-text/60">Transfer Summary</p>

          <div className="flex justify-between text-text">
            <span>From</span>
            <span>
              {fromAccount
                ? `${fromAccount.account_type} Account ${fromAccount.account_number?.slice(
                    -4,
                  )}`
                : '—'}
            </span>
          </div>

          <div className="flex justify-between text-text">
            <span>To</span>
            <span>
              {toAccount
                ? `${toAccount.account_type} Account ${toAccount.account_number?.slice(
                    -4,
                  )}`
                : '—'}
            </span>
          </div>

          <div className="flex justify-between font-semibold text-text">
            <span>Total</span>
            <span>
              {amount && fromAccount
                ? `€ ${fromAccount.currency} ${Number(amount).toFixed(2)}`
                : '€ 0.00'}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4 pt-4">
          <button
            onClick={() => navigate('/accounts')}
            className="h-10 px-6 rounded-md border border-border text-text"
          >
            Cancel
          </button>

          <button
            onClick={handleTransfer}
            disabled={loading}
            className="h-10 px-6 rounded-md bg-primary text-white disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Transfer'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransferPage;
