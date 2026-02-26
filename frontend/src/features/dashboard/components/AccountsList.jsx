import React from 'react';

/**
 * AccountsList
 *
 * Displays list of user accounts with balances
 */

const AccountsList = ({ accounts }) => {
  /* ================= helpers ================= */

  const getAccountColor = (type) => {
    if (type === 'Savings') return 'bg-green-500/20 text-green-600';
    if (type === 'Current') return 'bg-blue-500/20 text-blue-600';
    return 'bg-purple-500/20 text-purple-600';
  };

  const formatCurrency = (value, currency = 'EUR') =>
    new Intl.NumberFormat('en-IE', {
      style: 'currency',
      currency,
    }).format(value);

  /* ================= UI ================= */

  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <p className="text-sm font-medium text-text/60 mb-4">Accounts</p>

      {accounts.map((acc) => (
        <div
          key={acc.id}
          className="flex justify-between items-center py-3 border-b border-border last:border-0"
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold ${getAccountColor(
                acc.account_type,
              )}`}
            >
              {acc.account_type.slice(0, 2).toUpperCase()}
            </div>

            <div>
              <p className="text-sm font-medium text-text">
                {acc.account_type} Account
              </p>
              <p className="text-xs text-text/60 font-mono">
                •••• {acc.account_number?.slice(-4)}
              </p>
            </div>
          </div>

          <p className="text-sm font-semibold text-text">
            {formatCurrency(acc.account_balance, acc.currency)}
          </p>
        </div>
      ))}
    </div>
  );
};

export default AccountsList;
