import { useEffect, useState } from 'react';
import { useAccountStore } from '../../store/useAccountStore';
import { useTransactionStore } from '../../store/useTransactionStore';

const TransactionPage = () => {
  const accounts = useAccountStore((state) => state.accounts);
  const fetchAccounts = useAccountStore((state) => state.fetchAccounts);

  const transactions = useTransactionStore((state) => state.transactions);
  const fetchTransactions = useTransactionStore(
    (state) => state.fetchTransactions,
  );
  const loading = useTransactionStore((state) => state.loading);

  const [selectedAccount, setSelectedAccount] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [search, setSearch] = useState('');

  // Fetch accounts + all transactions on load
  useEffect(() => {
    fetchAccounts();
    fetchTransactions();
  }, [fetchAccounts, fetchTransactions]);

  // Refetch when account changes
  useEffect(() => {
    if (selectedAccount) {
      fetchTransactions(selectedAccount);
    } else {
      fetchTransactions();
    }
  }, [selectedAccount, fetchTransactions]);

  // Clear Filters
  const handleClearFilters = () => {
    setSelectedAccount('');
    setFromDate('');
    setToDate('');
    setSearch('');
    fetchTransactions();
  };

  const hasActiveFilters = selectedAccount || fromDate || toDate || search;

  // Client-side filtering
  const filteredTransactions = transactions.filter((tx) => {
    const txDate = new Date(tx.createdat);

    const matchesFrom = fromDate ? txDate >= new Date(fromDate) : true;

    const matchesTo = toDate ? txDate <= new Date(toDate) : true;

    const matchesSearch = search
      ? tx.description?.toLowerCase().includes(search.toLowerCase())
      : true;

    return matchesFrom && matchesTo && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-background w-full">
      <div className="w-full py-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10">
          <p className="text-2xl 2xl:text-3xl font-semibold text-text/60">
            Transactions Activity
          </p>

          <div className="flex flex-col md:flex-row md:items-end gap-4">
            {/* Account Filter */}
            <div className="flex flex-col">
              <label className="text-sm text-text/60 mb-1">
                Filter by Account
              </label>
              <select
                value={selectedAccount}
                onChange={(e) => setSelectedAccount(e.target.value)}
                className="h-10 px-3 rounded-md bg-background border border-border text-text outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">All Accounts</option>
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.account_type} •••• {acc.account_number?.slice(-4)}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Filters */}
            <div className="flex flex-col">
              <label className="text-sm text-text/60 mb-1">From</label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="h-10 px-3 rounded-md bg-background border border-border text-text outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-sm text-text/60 mb-1">To</label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="h-10 px-3 rounded-md bg-background border border-border text-text outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Search */}
            <div className="flex flex-col">
              <label className="text-sm text-text/60 mb-1">Search</label>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search description..."
                className="h-10 px-3 rounded-md bg-background border border-border text-text outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Clear Filters */}
            <div className="flex flex-col">
              <label className="text-sm text-text/60 mb-1 invisible">
                Clear
              </label>
              <button
                onClick={handleClearFilters}
                disabled={!hasActiveFilters}
                className="h-10 px-4 rounded-md border border-border text-text hover:bg-background/50 disabled:opacity-50"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="overflow-x-auto mt-5">
          {loading && (
            <div className="w-full flex items-center justify-center py-10 text-text/60 text-lg">
              Loading transactions...
            </div>
          )}

          {!loading && filteredTransactions.length === 0 && (
            <div className="w-full flex items-center justify-center py-10 text-text/60 text-lg">
              No Transaction History
            </div>
          )}

          {!loading && filteredTransactions.length > 0 && (
            <table className="w-full border border-border rounded-md overflow-hidden">
              <thead className="bg-background border-b border-border">
                <tr>
                  <th className="text-left px-4 py-3 text-sm text-text/60">
                    Date
                  </th>
                  <th className="text-left px-4 py-3 text-sm text-text/60">
                    Account
                  </th>
                  <th className="text-left px-4 py-3 text-sm text-text/60">
                    Description
                  </th>
                  <th className="text-left px-4 py-3 text-sm text-text/60">
                    Type
                  </th>
                  <th className="text-right px-4 py-3 text-sm text-text/60">
                    Amount
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredTransactions.map((tx) => {
                  const isIncoming =
                    tx.type === 'deposit' || tx.type === 'credit';

                  const account = accounts.find(
                    (acc) =>
                      acc.id === tx.accountId || acc.id === tx.account_id,
                  );

                  return (
                    <tr
                      key={tx.id}
                      className="border-b border-border hover:bg-background/50"
                    >
                      <td className="px-4 py-3 text-sm text-text">
                        {new Date(
                          tx.createdAt || tx.createdat,
                        ).toLocaleDateString()}
                      </td>

                      <td className="px-4 py-3 text-sm text-text">
                        {account
                          ? `${account.account_type} •••• ${account.account_number?.slice(-4)}`
                          : '—'}
                      </td>

                      <td className="px-4 py-3 text-sm text-text">
                        {tx.description || '—'}
                      </td>

                      <td className="px-4 py-3 text-sm text-text capitalize">
                        {tx.type}
                      </td>

                      <td
                        className={`px-4 py-3 text-sm text-right font-medium ${
                          isIncoming ? 'text-green-500' : 'text-red-500'
                        }`}
                      >
                        {isIncoming ? '+' : '-'}
                        {new Intl.NumberFormat('en-IE', {
                          style: 'currency',
                          currency: tx.currency || 'EUR',
                        }).format(tx.amount)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default TransactionPage;
