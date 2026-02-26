import { useState } from 'react';
import api from '../../../api/axios';

const Pay = ({ accounts, payForm, setPayForm, setShowPayModal }) => {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const fromAccount = accounts.find((acc) => acc.id === payForm.fromAccountId);

  const handlePay = async () => {
    setError('');

    if (!payForm.amount || Number(payForm.amount) <= 0)
      return setError('Amount must be greater than 0.');

    if (!payForm.recipientName) return setError('Recipient name is required.');

    if (!payForm.recipientAccount)
      return setError('Recipient account number is required.');

    if (!payForm.bankName) return setError('Bank name is required.');

    if (Number(payForm.amount) > fromAccount.account_balance)
      return setError('Insufficient balance.');

    setLoading(true);

    try {
      await api.post('/payments', {
        fromAccountId: payForm.fromAccountId,
        amount: Number(payForm.amount),
        description: payForm.description,
        recipientName: payForm.recipientName,
        externalAccountNumber: payForm.recipientAccount,
        externalBankName: payForm.bankName,
      });

      setShowPayModal(false);
    } catch (err) {
      setError('Payment failed. Please try again.');
    } finally {
      setLoading(false);
      setPayForm({});
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-xl p-6 space-y-6">
        {/* Header */}
        <div className="space-y-1">
          <h2 className="text-xl font-semibold tracking-tight text-text">
            Pay Money
          </h2>
          <p className="text-sm text-text/60">
            From {fromAccount?.account_name} Account
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-500">
            {error}
          </div>
        )}

        {/* Form */}
        <div className="space-y-4">
          {/* From Account */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-text/60">
              From Account
            </label>
            <input
              disabled
              value={`${fromAccount?.account_type} •••• ${fromAccount?.account_number?.slice(
                -4,
              )}`}
              className="w-full h-10 px-3 rounded-lg bg-background border border-border text-text/70 text-sm"
            />
          </div>

          {/* Recipient Name */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-text/60">
              Recipient Name
            </label>
            <input
              value={payForm.recipientName}
              onChange={(e) =>
                setPayForm({ ...payForm, recipientName: e.target.value })
              }
              placeholder="John Doe"
              className="w-full h-10 px-3 rounded-lg bg-background border border-border text-sm text-text outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          {/* Recipient Account */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-text/60">
              Recipient Account Number
            </label>
            <input
              value={payForm.recipientAccount}
              onChange={(e) =>
                setPayForm({ ...payForm, recipientAccount: e.target.value })
              }
              placeholder="DE12345678"
              className="w-full h-10 px-3 rounded-lg bg-background border border-border text-sm text-text outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          {/* Bank Name */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-text/60">
              Bank Name
            </label>
            <input
              value={payForm.bankName}
              onChange={(e) =>
                setPayForm({ ...payForm, bankName: e.target.value })
              }
              placeholder="Deutsche Bank"
              className="w-full h-10 px-3 rounded-lg bg-background border border-border text-sm text-text outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          {/* Amount */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-text/60">Amount</label>
            <input
              type="number"
              value={payForm.amount}
              onChange={(e) =>
                setPayForm({
                  ...payForm,
                  amount: Number(e.target.value),
                })
              }
              className="w-full h-10 px-3 rounded-lg bg-background border border-border text-sm text-text outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-text/60">
              Description (optional)
            </label>
            <input
              value={payForm.description}
              onChange={(e) =>
                setPayForm({ ...payForm, description: e.target.value })
              }
              placeholder="Invoice payment"
              className="w-full h-10 px-3 rounded-lg bg-background border border-border text-sm text-text outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-border/40">
          <button
            onClick={() => setShowPayModal(false)}
            className="h-10 px-5 rounded-lg border border-border text-sm text-text hover:bg-border/40 transition"
          >
            Cancel
          </button>

          <button
            onClick={handlePay}
            disabled={loading}
            className="h-10 px-5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition"
          >
            {loading ? 'Processing…' : 'Pay'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Pay;
