import { useState } from 'react';
import api from '../../../api/axios';

const Transfer = ({
  accounts,
  transferFrom,
  transferData,
  setTransferData,
  setShowTransferModal,
}) => {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleTransfer = async () => {
    setError('');

    if (!transferData.toAccountId)
      return setError('Please select destination account.');

    if (transferData.toAccountId === transferFrom.id)
      return setError('Cannot transfer to same account.');

    if (!transferData.amount || Number(transferData.amount) <= 0)
      return setError('Amount must be greater than 0.');

    if (Number(transferData.amount) > transferFrom.balance)
      return setError('Insufficient balance.');

    setLoading(true);

    try {
      await api.post('/accounts/transfer', {
        fromAccountId: transferFrom.id,
        toAccountId: transferData.toAccountId,
        amount: Number(transferData.amount),
        description: transferData.description,
      });

      setShowTransferModal(false);
    } catch (err) {
      console.log(err);
      setError('Transfer failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-card border border-border rounded-lg w-full max-w-md p-6 space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-text">Transfer Money</h2>
          <p className="text-sm text-text/60">
            From {transferFrom.account_type} Account
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-500 text-sm px-3 py-2 rounded-md">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {/* From (Read Only) */}
          <div className="space-y-1">
            <label className="text-sm text-text/60">From Account</label>
            <input
              disabled
              value={`${transferFrom.account_type} •••• ${transferFrom.account_number?.slice(-4)}`}
              className="w-full h-10 px-3 rounded-md bg-background border border-border text-text"
            />
          </div>

          {/* To Account */}
          <div className="space-y-1">
            <label className="text-sm text-text/60">To Account</label>
            <select
              value={transferData.toAccountId}
              onChange={(e) =>
                setTransferData({
                  ...transferData,
                  toAccountId: e.target.value,
                })
              }
              className="w-full h-10 px-3 rounded-md bg-background border border-border text-text outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Select destination</option>
              {accounts
                .filter((acc) => acc.id !== transferFrom.id)
                .map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.account_type} •••• {acc.account_number?.slice(-4)}
                  </option>
                ))}
            </select>
          </div>

          {/* Amount */}
          <div className="space-y-1">
            <label className="text-sm text-text/60">Amount</label>
            <input
              type="number"
              value={transferData.amount}
              onChange={(e) =>
                setTransferData({
                  ...transferData,
                  amount: e.target.value,
                })
              }
              className="w-full h-10 px-3 rounded-md bg-background border border-border text-text outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-sm text-text/60">Description</label>
            <input
              value={transferData.description}
              onChange={(e) =>
                setTransferData({
                  ...transferData,
                  description: e.target.value,
                })
              }
              className="w-full h-10 px-3 rounded-md bg-background border border-border text-text outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button
            onClick={() => setShowTransferModal(false)}
            className="h-10 px-6 rounded-md border border-border text-text"
          >
            Cancel
          </button>

          <button
            onClick={handleTransfer}
            disabled={loading}
            className="h-10 px-6 rounded-md bg-primary text-white disabled:opacity-50"
          >
            {loading ? 'Transferring...' : 'Transfer'}
          </button>
        </div>
      </div>
    </div>
  );
};
export default Transfer;
