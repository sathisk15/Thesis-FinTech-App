import { useEffect, useState } from 'react';
import { useAccountStore } from '../../store/useAccountStore';
import api from '../../api/axios';
import { useNavigate } from 'react-router-dom';

const PayPage = () => {
  const navigate = useNavigate();

  const accounts = useAccountStore((state) => state.accounts);
  const fetchAccounts = useAccountStore((state) => state.fetchAccounts);

  const [fromAccountId, setFromAccountId] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [externalAccountNumber, setExternalAccountNumber] = useState('');
  const [externalBankName, setExternalBankName] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const fromAccount = accounts.find((acc) => acc.id === fromAccountId);

  const formatCurrency = (value, currency = 'EUR') =>
    new Intl.NumberFormat('en-IE', {
      style: 'currency',
      currency,
    }).format(value);

  const validateExternalAccount = (value) => {
    return /^[A-Z]{2}\d{8}$/i.test(value);
  };

  const handlePayment = async () => {
    setError('');

    if (!fromAccountId) return setError('Please select source account.');

    if (!recipientName.trim()) return setError('Recipient name is required.');

    if (!externalAccountNumber.trim())
      return setError('Recipient account number is required.');

    if (!validateExternalAccount(externalAccountNumber))
      return setError('Account number must be 2 letters + 8 digits.');

    if (!externalBankName.trim()) return setError('Bank name is required.');

    if (!amount || Number(amount) <= 0)
      return setError('Amount must be greater than 0.');

    if (Number(amount) > fromAccount?.account_balance)
      return setError('Insufficient balance.');

    try {
      setLoading(true);

      await api.post('/payments', {
        fromAccountId,
        amount: Number(amount),
        description,
        recipientName,
        externalAccountNumber,
        externalBankName,
      });

      navigate('/transactions');
    } catch (err) {
      setError(
        err.response?.data?.message || 'Payment failed. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-text mb-2">
          Make a Payment
        </h1>
        <p className="text-text/60">
          Send money securely to another bank account
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
          <label className="text-sm font-medium text-text/60">Pay From</label>
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
                {formatCurrency(acc.account_balance, acc.currency)})
              </option>
            ))}
          </select>
        </div>

        {/* Recipient Name */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-text/60">
            Recipient Name
          </label>
          <input
            value={recipientName}
            onChange={(e) => setRecipientName(e.target.value)}
            placeholder="John Doe"
            className="w-full h-10 px-3 rounded-md bg-background border border-border text-text outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* External Account Number */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-text/60">
            Recipient Account Number
          </label>
          <input
            value={externalAccountNumber}
            onChange={(e) =>
              setExternalAccountNumber(e.target.value.toUpperCase())
            }
            placeholder="DE12345678"
            className="w-full h-10 px-3 rounded-md bg-background border border-border text-text outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Bank Name */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-text/60">Bank Name</label>
          <input
            value={externalBankName}
            onChange={(e) => setExternalBankName(e.target.value)}
            placeholder="Deutsche Bank"
            className="w-full h-10 px-3 rounded-md bg-background border border-border text-text outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Amount */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-text/60">Amount</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="w-full h-10 px-3 rounded-md bg-background border border-border text-text outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-text/60">
            Description (Optional)
          </label>
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Invoice 2026-01"
            className="w-full h-10 px-3 rounded-md bg-background border border-border text-text outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Summary */}
        <div className="bg-background border border-border rounded-md p-4 space-y-3">
          <p className="text-sm text-text/60">Payment Summary</p>

          <div className="flex justify-between text-text">
            <span>From</span>
            <span>
              {fromAccount
                ? `${fromAccount.account_type} •••• ${fromAccount.account_number?.slice(
                    -4,
                  )}`
                : '—'}
            </span>
          </div>

          <div className="flex justify-between font-semibold text-text pt-2 border-t border-border">
            <span>Total</span>
            <span>
              {amount && fromAccount
                ? formatCurrency(Number(amount), fromAccount.currency)
                : formatCurrency(0)}
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
            onClick={handlePayment}
            disabled={loading}
            className="h-10 px-6 rounded-md bg-primary text-white disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Confirm Payment'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PayPage;
