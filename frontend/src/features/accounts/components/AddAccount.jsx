import { useState } from 'react';

const AddAccount = ({
  accountData,
  setAccountData,
  addAccount,
  setShowModal,
  accounts,
}) => {
  const allTypes = ['Savings', 'Current', 'Business'];

  const existingTypes = accounts.map((acc) => acc.account_name);

  const availableTypes = allTypes.filter(
    (type) => !existingTypes.includes(type),
  );
  console.log(availableTypes, existingTypes);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    setError('');

    // Validation
    if (!accountData.account_name) {
      return setError('Please select an account type.');
    }

    if (accountData.initialBalance < 100) {
      return setError('Initial deposit cannot be smaller than 100 Euro.');
    }

    setLoading(true);

    try {
      await addAccount(accountData);

      // Reset form
      setAccountData({
        account_name: '',
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
        {availableTypes.length === 0 ? (
          <div className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-500 text-sm px-3 py-2 rounded-md">
            You have already created all available account types.
          </div>
        ) : (
          <>
            {/* Form Fields */}
            <div className="space-y-4">
              {/* Account Type */}
              <div className="space-y-1">
                <label className="text-sm text-text/60">Account Type</label>
                <select
                  value={accountData.account_name}
                  onChange={(e) =>
                    setAccountData({
                      ...accountData,
                      account_name: e.target.value,
                    })
                  }
                  className="w-full h-10 px-3 rounded-md bg-background border border-border text-text outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Select account type</option>

                  {availableTypes.map((type) => (
                    <option key={type} value={type}>
                      {type} Account
                    </option>
                  ))}
                </select>
              </div>

              {/* Currency */}
              <div className="space-y-1">
                <label className="text-sm text-text/60">Currency</label>
                <select
                  value={accountData.currency}
                  // onChange={(e) =>
                  //   setAccountData({ ...accountData, currency: e.target.value })
                  // }
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
          </>
        )}
        {/* Buttons */}

        <div className="flex justify-end gap-3 pt-4">
          <button
            onClick={() => setShowModal(false)}
            className="h-10 px-6 rounded-md border border-border text-text cursor-pointer"
            disabled={loading}
          >
            Cancel
          </button>
          {availableTypes.length !== 0 && (
            <button
              onClick={handleCreate}
              disabled={loading || availableTypes.length === 0}
              className="h-10 px-6 rounded-md bg-primary text-white font-medium disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Creating...' : 'Create Account'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddAccount;
