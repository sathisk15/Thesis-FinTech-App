import { useState } from 'react';

const DepositMoney = ({
  accounts,
  depositData,
  setDepositData,
  depositMoney,
  setShowDepositModal,
}) => {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDeposit = async () => {
    setError('');

    if (!depositData.accountId) {
      return setError('Please select an account.');
    }

    if (depositData.amount <= 0) {
      return setError('Deposit amount must be greater than 0.');
    }

    setLoading(true);

    try {
      await depositMoney(
        depositData.accountId,
        depositData.amount,
        depositData.description,
      );

      setDepositData({
        accountId: '',
        amount: 0,
        description: '',
      });

      setShowDepositModal(false);
    } catch (err) {
      setError('Deposit failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      data-testid="deposit-modal"
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
            Deposit Money
          </h2>
          <p className="text-sm text-text/60">
            Select an account and enter an amount
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
          {/* Account */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-text/60">
              Select Account
            </label>
            <select
              data-testid="deposit-account-select"
              value={depositData.accountId}
              onChange={(e) =>
                setDepositData({
                  ...depositData,
                  accountId: e.target.value,
                })
              }
              className="w-full h-10 px-3 rounded-lg
                         bg-background border border-border
                         text-text text-sm
                         outline-none
                         focus:ring-2 focus:ring-primary/40"
            >
              <option value="">Choose account</option>
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.account_type} ••••{acc.account_number.slice(-4)}
                </option>
              ))}
            </select>
          </div>

          {/* Amount */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-text/60">
              Deposit Amount
            </label>
            <input
              data-testid="deposit-amount-input"
              type="number"
              min="1"
              value={depositData.amount}
              onChange={(e) =>
                setDepositData({
                  ...depositData,
                  amount: Number(e.target.value),
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
              Description (optional)
            </label>
            <input
              data-testid="deposit-description-input"
              type="text"
              placeholder="Enter deposit note"
              value={depositData.description}
              onChange={(e) =>
                setDepositData({
                  ...depositData,
                  description: e.target.value,
                })
              }
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
            data-testid="deposit-cancel"
            onClick={() => setShowDepositModal(false)}
            disabled={loading}
            className="h-10 px-5 rounded-lg
                       border border-border
                       text-sm text-text
                       hover:bg-border/40
                       transition"
          >
            Cancel
          </button>

          <button
            data-testid="deposit-submit"
            onClick={handleDeposit}
            disabled={loading}
            className="h-10 px-5 rounded-lg
                       bg-primary text-white
                       text-sm font-medium
                       hover:bg-primary/90
                       disabled:opacity-50
                       transition"
          >
            {loading ? 'Processing…' : 'Deposit'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DepositMoney;
