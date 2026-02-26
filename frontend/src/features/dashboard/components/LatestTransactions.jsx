import React from 'react';

/**
 * LatestTransactions
 *
 * Displays the most recent transactions
 */

const LatestTransactions = ({ transactions }) => {
  /* ================= helpers ================= */

  const formatCurrency = (value, currency = 'EUR') =>
    new Intl.NumberFormat('en-IE', {
      style: 'currency',
      currency,
    }).format(value);

  /* ================= UI ================= */

  return (
    <div className="lg:col-span-2 bg-card border border-border rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-border">
        <p className="text-sm font-medium text-text/60">Latest Transactions</p>
      </div>

      <table className="w-full">
        <tbody>
          {transactions.map((tx) => {
            const incoming = tx.type === 'credit' || tx.type === 'deposit';

            return (
              <tr key={tx.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3 text-sm">
                  {new Date(tx.createdat).toLocaleDateString()}
                </td>

                <td className="px-4 py-3 text-sm">{tx.description || '—'}</td>

                <td
                  className={`px-4 py-3 text-sm text-right font-medium ${
                    incoming ? 'text-green-500' : 'text-red-500'
                  }`}
                >
                  {incoming ? '+' : '-'}
                  {formatCurrency(tx.amount)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default LatestTransactions;
