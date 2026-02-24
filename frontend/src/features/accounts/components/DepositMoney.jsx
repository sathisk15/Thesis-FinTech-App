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
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-card border border-border rounded-lg w-full max-w-md p-6 space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-text">Deposit Money</h2>
          <p className="text-sm text-text/60">
            Select account and enter amount
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-500 text-sm px-3 py-2 rounded-md">
            {error}
          </div>
        )}

        {/* Account Dropdown */}
        <div className="space-y-1">
          <label className="text-sm text-text/60">Select Account</label>
          <select
            value={depositData.accountId}
            onChange={(e) =>
              setDepositData({
                ...depositData,
                accountId: e.target.value,
              })
            }
            className="w-full h-10 px-3 rounded-md bg-background border border-border text-text"
          >
            <option value="">Choose account</option>
            {accounts.map((acc) => (
              <option key={acc.id} value={acc.id}>
                {acc.account_type} ••••
                {acc.account_number.slice(-4)}
              </option>
            ))}
          </select>
        </div>

        {/* Amount */}
        <div className="space-y-1">
          <label className="text-sm text-text/60">Deposit Amount</label>
          <input
            type="number"
            min="1"
            value={depositData.amount}
            onChange={(e) =>
              setDepositData({
                ...depositData,
                amount: Number(e.target.value),
              })
            }
            className="w-full h-10 px-3 rounded-md bg-background border border-border text-text"
          />
        </div>

        {/* Description */}
        <div className="space-y-1">
          <label className="text-sm text-text/60">Description (Optional)</label>
          <input
            type="text"
            placeholder="Enter deposit note"
            value={depositData.description}
            onChange={(e) =>
              setDepositData({
                ...depositData,
                description: e.target.value,
              })
            }
            className="w-full h-10 px-3 rounded-md bg-background border border-border text-text"
          />
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 pt-4">
          <button
            onClick={() => setShowDepositModal(false)}
            className="h-10 px-6 rounded-md border border-border text-text cursor-pointer"
            disabled={loading}
          >
            Cancel
          </button>

          <button
            onClick={handleDeposit}
            disabled={loading}
            className="h-10 px-6 rounded-md bg-primary text-white font-medium disabled:opacity-50 cursor-pointer"
          >
            {loading ? 'Processing...' : 'Deposit'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DepositMoney;
