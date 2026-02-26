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

  // Fetch accounts + transactions
  useEffect(() => {
    fetchAccounts();
    fetchTransactions();
  }, [fetchAccounts, fetchTransactions]);

  // Refetch on account filter
  useEffect(() => {
    if (selectedAccount) {
      fetchTransactions(selectedAccount);
    } else {
      fetchTransactions();
    }
  }, [selectedAccount, fetchTransactions]);

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
    <div className="w-full py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-text">
            Transactions
          </h1>
          <p className="text-sm text-text/60 mt-1">
            View and filter your transaction history
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-end gap-4">
          {/* Account */}
          <div className="flex flex-col">
            <label className="text-xs font-medium text-text/60 mb-1">
              Account
            </label>
            <select
              value={selectedAccount}
              onChange={(e) => setSelectedAccount(e.target.value)}
              className="h-10 px-3 rounded-lg bg-background border border-border text-sm text-text outline-none focus:ring-2 focus:ring-primary/40"
            >
              <option value="">All Accounts</option>
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.account_type} •••• {acc.account_number?.slice(-4)}
                </option>
              ))}
            </select>
          </div>

          {/* From */}
          <div className="flex flex-col">
            <label className="text-xs font-medium text-text/60 mb-1">
              From
            </label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="h-10 px-3 rounded-lg bg-background border border-border text-sm text-text outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          {/* To */}
          <div className="flex flex-col">
            <label className="text-xs font-medium text-text/60 mb-1">To</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="h-10 px-3 rounded-lg bg-background border border-border text-sm text-text outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          {/* Search */}
          <div className="flex flex-col">
            <label className="text-xs font-medium text-text/60 mb-1">
              Search
            </label>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Description…"
              className="h-10 px-3 rounded-lg bg-background border border-border text-sm text-text outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          {/* Clear */}
          <button
            onClick={handleClearFilters}
            disabled={!hasActiveFilters}
            className="h-10 px-4 rounded-lg border border-border text-sm text-text
                       hover:bg-border/40 transition disabled:opacity-50"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        {loading && (
          <div className="py-16 text-center text-text/60">
            Loading transactions…
          </div>
        )}

        {!loading && filteredTransactions.length === 0 && (
          <div className="py-16 text-center text-text/60">
            No transactions found.
          </div>
        )}

        {!loading && filteredTransactions.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-background border-b border-border">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text/60">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text/60">
                    Account
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text/60">
                    Description
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text/60">
                    Type
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-text/60">
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
                      className="border-b border-border last:border-0
                                 hover:bg-background/50 transition"
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

                      <td className="px-4 py-3 text-sm text-text/80 max-w-xs truncate">
                        {tx.description || '—'}
                      </td>

                      <td className="px-4 py-3 text-sm capitalize text-text">
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
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionPage;
