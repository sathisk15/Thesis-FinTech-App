import { useEffect, useState } from 'react';
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
  const [isDescriptionEdited, setIsDescriptionEdited] = useState(false);

  // Find selected TO account
  const toAccount = accounts.find(
    (acc) => acc.id === Number(transferData.toAccountId),
  );

  // Dynamic Description
  useEffect(() => {
    if (
      transferFrom &&
      toAccount &&
      transferData.amount &&
      !isDescriptionEdited
    ) {
      const refinedDescription = `Internal transfer of ${
        transferFrom.currency
      } ${Number(transferData.amount).toFixed(2)} from ${
        transferFrom.account_type
      } Account •••• ${transferFrom.account_number?.slice(
        -4,
      )} to ${toAccount.account_type} Account •••• ${toAccount.account_number?.slice(
        -4,
      )}.`;

      setTransferData((prev) => ({
        ...prev,
        description: refinedDescription,
      }));
    }
  }, [
    transferFrom,
    transferData.amount,
    transferData.toAccountId,
    isDescriptionEdited,
  ]);

  const handleTransfer = async () => {
    setError('');

    if (!transferData.toAccountId)
      return setError('Please select destination account.');

    if (Number(transferData.toAccountId) === transferFrom.id)
      return setError('Cannot transfer to same account.');

    if (!transferData.amount || Number(transferData.amount) <= 0)
      return setError('Amount must be greater than 0.');

    if (Number(transferData.amount) > transferFrom.balance)
      return setError('Insufficient balance.');

    setLoading(true);

    try {
      await api.post('/accounts/transfer', {
        fromAccountId: transferFrom.id,
        toAccountId: Number(transferData.toAccountId),
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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center
                 bg-black/40 backdrop-blur-sm"
    >
      <div
        className="w-full max-w-md
                   bg-card border border-border
                   rounded-xl shadow-lg
                   p-6 space-y-6"
      >
        {/* Header */}
        <div className="space-y-1">
          <h2 className="text-xl font-semibold tracking-tight text-text">
            Transfer Money
          </h2>
          <p className="text-sm text-text/60">
            From {transferFrom.account_type} Account
          </p>
        </div>

        {/* Error */}
        {error && (
          <div
            className="rounded-lg border border-red-500/30
                       bg-red-500/10 px-3 py-2
                       text-sm text-red-500"
          >
            {error}
          </div>
        )}

        {/* Form */}
        <div className="space-y-4">
          {/* From */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-text/60">
              From Account
            </label>
            <input
              disabled
              value={`${transferFrom.account_type} •••• ${transferFrom.account_number?.slice(
                -4,
              )}`}
              className="w-full h-10 px-3 rounded-lg
                         bg-background border border-border
                         text-text/70 text-sm"
            />
          </div>

          {/* To */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-text/60">
              To Account
            </label>
            <select
              value={transferData.toAccountId}
              onChange={(e) =>
                setTransferData({
                  ...transferData,
                  toAccountId: Number(e.target.value),
                })
              }
              className="w-full h-10 px-3 rounded-lg
                         bg-background border border-border
                         text-text text-sm
                         outline-none
                         focus:ring-2 focus:ring-primary/40"
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
            <label className="text-xs font-medium text-text/60">Amount</label>
            <input
              type="number"
              value={transferData.amount}
              onChange={(e) =>
                setTransferData({
                  ...transferData,
                  amount: e.target.value,
                })
              }
              className="w-full h-10 px-3 rounded-lg
                         bg-background border border-border
                         text-text text-sm
                         outline-none
                         focus:ring-2 focus:ring-primary/40"
            />
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-text/60">
              Description
            </label>
            <input
              value={transferData.description}
              onChange={(e) => {
                setTransferData({
                  ...transferData,
                  description: e.target.value,
                });
                setIsDescriptionEdited(true);
              }}
              className="w-full h-10 px-3 rounded-lg
                         bg-background border border-border
                         text-text text-sm
                         outline-none
                         focus:ring-2 focus:ring-primary/40"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4">
          <button
            onClick={() => setShowTransferModal(false)}
            className="h-10 px-5 rounded-lg
                       border border-border
                       text-sm text-text
                       hover:bg-border/40
                       transition"
          >
            Cancel
          </button>

          <button
            onClick={handleTransfer}
            disabled={loading}
            className="h-10 px-5 rounded-lg
                       bg-primary text-white
                       text-sm font-medium
                       hover:bg-primary/90
                       disabled:opacity-50
                       transition"
          >
            {loading ? 'Transferring…' : 'Transfer'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Transfer;
