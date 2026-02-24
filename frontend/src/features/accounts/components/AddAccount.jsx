import { useState } from 'react';

const AddAccount = ({
  accountData,
  setAccountData,
  addAccount,
  setShowModal,
}) => {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    setError('');

    // Validation
    if (!accountData.type) {
      return setError('Please select an account type.');
    }

    if (accountData.initialBalance < 0) {
      return setError('Initial deposit cannot be negative.');
    }

    setLoading(true);

    try {
      await addAccount(accountData);

      // Reset form
      setAccountData({
        type: '',
        currency: 'PLN',
        initialBalance: 0,
      });

      setShowModal(false);
    } catch (err) {
      setError('Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-card border border-border rounded-lg w-full max-w-md p-6 space-y-6">
        {/* Header */}
        <div className="space-y-1">
          <h2 className="text-xl font-semibold text-text">
            Create New Account
          </h2>
          <p className="text-sm text-text/60">
            Open a new account under your profile
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-500 text-sm px-3 py-2 rounded-md">
            {error}
          </div>
        )}

        {/* Form Fields */}
        <div className="space-y-4">
          {/* Account Type */}
          <div className="space-y-1">
            <label className="text-sm text-text/60">Account Type</label>
            <select
              value={accountData.type}
              onChange={(e) =>
                setAccountData({ ...accountData, type: e.target.value })
              }
              className="w-full h-10 px-3 rounded-md bg-background border border-border text-text outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Select account type</option>
              <option value="Savings">Savings Account</option>
              <option value="Current">Current Account</option>
              <option value="Business">Business Account</option>
            </select>
          </div>

          {/* Currency */}
          <div className="space-y-1">
            <label className="text-sm text-text/60">Currency</label>
            <select
              value={accountData.currency}
              onChange={(e) =>
                setAccountData({ ...accountData, currency: e.target.value })
              }
              className="w-full h-10 px-3 rounded-md bg-background border border-border text-text outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="PLN">PLN (Polish Złoty)</option>
              <option value="EUR">EUR (Euro)</option>
              <option value="USD">USD (US Dollar)</option>
            </select>
          </div>

          {/* Initial Deposit */}
          <div className="space-y-1">
            <label className="text-sm text-text/60">
              Initial Deposit Amount
            </label>
            <input
              type="number"
              min="0"
              placeholder="Enter amount"
              value={accountData.initialBalance}
              onChange={(e) =>
                setAccountData({
                  ...accountData,
                  initialBalance: Number(e.target.value),
                })
              }
              className="w-full h-10 px-3 rounded-md bg-background border border-border text-text outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 pt-4">
          <button
            onClick={() => setShowModal(false)}
            className="h-10 px-6 rounded-md border border-border text-text"
            disabled={loading}
          >
            Cancel
          </button>

          <button
            onClick={handleCreate}
            disabled={loading}
            className="h-10 px-6 rounded-md bg-primary text-white font-medium disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Account'}
          </button>
        </div>
      </div>
    </div>
  );
};
