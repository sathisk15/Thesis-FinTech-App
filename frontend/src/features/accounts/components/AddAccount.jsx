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

      // Reset form
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
          {/* Account Name */}
          <div className="space-y-1">
            <label className="text-sm text-text/60">Account Name</label>
            <input
              value={accountData.account_name}
              onChange={(e) =>
                setAccountData({
                  ...accountData,
                  account_name: e.target.value,
                })
              }
              placeholder="Business Operations"
              className="w-full h-10 px-3 rounded-md bg-background border border-border text-text outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          {/* Account Type */}
          <div className="space-y-1">
            <label className="text-sm text-text/60">Account Type</label>
            <select
              value={accountData.account_type}
              onChange={(e) =>
                setAccountData({
                  ...accountData,
                  account_type: e.target.value,
                })
              }
              className="w-full h-10 px-3 rounded-md bg-background border border-border text-text outline-none focus:ring-2 focus:ring-primary"
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
            <label className="text-sm text-text/60">Account Number</label>
            <input
              value={accountData.account_number}
              onChange={(e) =>
                setAccountData({
                  ...accountData,
                  account_number: e.target.value,
                })
              }
              placeholder="DE38947874"
              className="w-full h-10 px-3 rounded-md bg-background border border-border text-text outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Currency */}
          <div className="space-y-1">
            <label className="text-sm text-text/60">Currency</label>
            <select
              value={accountData.currency}
              className="w-full h-10 px-3 rounded-md bg-background border border-border text-text outline-none focus:ring-2 focus:ring-primary"
              disabled
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
              min="100"
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
            className="h-10 px-6 rounded-md border border-border text-text cursor-pointer"
            disabled={loading}
          >
            Cancel
          </button>

          <button
            onClick={handleCreate}
            disabled={loading}
            className="h-10 px-6 rounded-md bg-primary text-white font-medium disabled:opacity-50 cursor-pointer"
          >
            {loading ? 'Linking...' : 'Link Account'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddAccount;
