import { useState } from 'react';

const AddAccount = ({
  accountData,
  setAccountData,
  addAccount,
  setShowModal,
  accounts,
}) => {
  const allTypes = ['Savings', 'Current', 'Business'];

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    setError('');

    // Validation
    if (!accountData.account_type) {
      return setError('Please select an account type.');
    }

    const accountExists = accounts.some(
      (acc) => acc.account_name === accountData.account_name,
    );

    if (accountExists) {
      return setError('This account name already exists.');
    }

    if (accountData.initialBalance < 100) {
      return setError('Initial deposit cannot be smaller than 100 Euro.');
    }

    setLoading(true);

    try {
      await addAccount(accountData);

      setAccountData({
        account_type: '',
        currency: 'EUR',
        initialBalance: 100,
      });

      setShowModal(false);
    } catch (err) {
      setError('Failed to create account. Please try again.');
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
            Link New Account
          </h2>
          <p className="text-sm text-text/60">
            Add a new account under your profile
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
          {/* Account Name */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-text/60">
              Account Name
            </label>
            <input
              value={accountData.account_name}
              onChange={(e) =>
                setAccountData({
                  ...accountData,
                  account_name: e.target.value,
                })
              }
              placeholder="Business Operations"
              className="w-full h-10 px-3 rounded-lg
                         bg-background border border-border
                         text-text text-sm
                         outline-none
                         focus:ring-2 focus:ring-primary/40"
            />
          </div>

          {/* Account Type */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-text/60">
              Account Type
            </label>
            <select
              value={accountData.account_type}
              onChange={(e) =>
                setAccountData({
                  ...accountData,
                  account_type: e.target.value,
                })
              }
              className="w-full h-10 px-3 rounded-lg
                         bg-background border border-border
                         text-text text-sm
                         outline-none
                         focus:ring-2 focus:ring-primary/40"
            >
              <option value="">Select account type</option>
              {allTypes.map((type) => (
                <option key={type} value={type}>
                  {type} Account
                </option>
              ))}
            </select>
          </div>

          {/* Account Number */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-text/60">
              Account Number
            </label>
            <input
              value={accountData.account_number}
              onChange={(e) =>
                setAccountData({
                  ...accountData,
                  account_number: e.target.value,
                })
              }
              placeholder="DE38947874"
              className="w-full h-10 px-3 rounded-lg
                         bg-background border border-border
                         text-text text-sm
                         outline-none
                         focus:ring-2 focus:ring-primary/40"
            />
          </div>

          {/* Currency */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-text/60">Currency</label>
            <select
              value={accountData.currency}
              disabled
              className="w-full h-10 px-3 rounded-lg
                         bg-background border border-border
                         text-text/60 text-sm"
            >
              <option value="PLN">PLN (Polish Złoty)</option>
              <option value="EUR">EUR (Euro)</option>
              <option value="USD">USD (US Dollar)</option>
            </select>
          </div>

          {/* Initial Deposit */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-text/60">
              Initial Deposit
            </label>
            <input
              type="number"
              min="100"
              value={accountData.initialBalance}
              onChange={(e) =>
                setAccountData({
                  ...accountData,
                  initialBalance: Number(e.target.value),
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
            onClick={() => setShowModal(false)}
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
            onClick={handleCreate}
            disabled={loading}
            className="h-10 px-5 rounded-lg
                       bg-primary text-white text-sm font-medium
                       hover:bg-primary/90
                       disabled:opacity-50
                       transition"
          >
            {loading ? 'Linking…' : 'Link Account'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddAccount;
