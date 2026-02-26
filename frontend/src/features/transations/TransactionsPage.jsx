import { useEffect, useMemo, useState } from 'react';
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

  // 🔹 Advanced filters
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [flow, setFlow] = useState('all');
  const [sortBy, setSortBy] = useState('date-desc');

  useEffect(() => {
    fetchAccounts();
    fetchTransactions();
  }, [fetchAccounts, fetchTransactions]);

  useEffect(() => {
    selectedAccount ? fetchTransactions(selectedAccount) : fetchTransactions();
  }, [selectedAccount, fetchTransactions]);

  const handleClearFilters = () => {
    setSelectedAccount('');
    setFromDate('');
    setToDate('');
    setSearch('');
    setMinAmount('');
    setMaxAmount('');
    setFlow('all');
    setSortBy('date-desc');
    fetchTransactions();
  };

  const hasActiveFilters =
    selectedAccount ||
    fromDate ||
    toDate ||
    search ||
    minAmount ||
    maxAmount ||
    flow !== 'all';

  const filteredTransactions = useMemo(() => {
    let data = [...transactions];

    data = data.filter((tx) => {
      const txDate = new Date(tx.createdAt || tx.createdat);
      const amount = Number(tx.amount);
      const isIncoming = tx.type === 'deposit' || tx.type === 'credit';

      return (
        (!fromDate || txDate >= new Date(fromDate)) &&
        (!toDate || txDate <= new Date(toDate)) &&
        (!search ||
          tx.description?.toLowerCase().includes(search.toLowerCase())) &&
        (!minAmount || amount >= Number(minAmount)) &&
        (!maxAmount || amount <= Number(maxAmount)) &&
        (flow === 'all' || (flow === 'incoming' ? isIncoming : !isIncoming))
      );
    });

    data.sort((a, b) => {
      const da = new Date(a.createdAt || a.createdat).getTime();
      const db = new Date(b.createdAt || b.createdat).getTime();

      if (sortBy === 'date-desc') return db - da;
      if (sortBy === 'date-asc') return da - db;
      if (sortBy === 'amount-desc') return b.amount - a.amount;
      if (sortBy === 'amount-asc') return a.amount - b.amount;
      return 0;
    });

    return data;
  }, [
    transactions,
    fromDate,
    toDate,
    search,
    minAmount,
    maxAmount,
    flow,
    sortBy,
  ]);

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
        <div className="flex flex-wrap items-end gap-3">
          {/* Account */}
          <select
            value={selectedAccount}
            onChange={(e) => setSelectedAccount(e.target.value)}
            className="h-9 px-3 rounded-md bg-background border border-border text-sm
                       text-text outline-none focus:ring-2 focus:ring-primary/40"
          >
            <option value="">All Accounts</option>
            {accounts.map((acc) => (
              <option key={acc.id} value={acc.id}>
                {acc.account_type} •••• {acc.account_number?.slice(-4)}
              </option>
            ))}
          </select>

          {/* From / To */}
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="h-9 px-2 rounded-md bg-background border border-border
                       text-xs text-text outline-none focus:ring-2 focus:ring-primary/40"
          />
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="h-9 px-2 rounded-md bg-background border border-border
                       text-xs text-text outline-none focus:ring-2 focus:ring-primary/40"
          />

          {/* Search */}
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Description…"
            className="h-9 px-3 rounded-md bg-background border border-border
                       text-sm text-text outline-none focus:ring-2 focus:ring-primary/40"
          />

          {/* Amount range (compact) */}
          <input
            type="number"
            placeholder="Min"
            value={minAmount}
            onChange={(e) => setMinAmount(e.target.value)}
            className="h-9 w-20 px-2 rounded-md bg-background border border-border
                       text-xs outline-none focus:ring-2 focus:ring-primary/40"
          />
          <input
            type="number"
            placeholder="Max"
            value={maxAmount}
            onChange={(e) => setMaxAmount(e.target.value)}
            className="h-9 w-20 px-2 rounded-md bg-background border border-border
                       text-xs outline-none focus:ring-2 focus:ring-primary/40"
          />

          {/* Flow */}
          <select
            value={flow}
            onChange={(e) => setFlow(e.target.value)}
            className="h-9 px-2 rounded-md bg-background border border-border
                       text-xs outline-none focus:ring-2 focus:ring-primary/40"
          >
            <option value="all">All</option>
            <option value="incoming">Incoming</option>
            <option value="outgoing">Outgoing</option>
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="h-9 px-2 rounded-md bg-background border border-border
                       text-xs outline-none focus:ring-2 focus:ring-primary/40"
          >
            <option value="date-desc">Newest</option>
            <option value="date-asc">Oldest</option>
            <option value="amount-desc">Amount ↓</option>
            <option value="amount-asc">Amount ↑</option>
          </select>

          {/* Clear */}
          <button
            onClick={handleClearFilters}
            disabled={!hasActiveFilters}
            className="h-9 px-3 rounded-md border border-border text-xs text-text
                       hover:bg-border/40 transition disabled:opacity-50"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Table (unchanged) */}
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
                      <td className="px-4 py-3 text-sm">
                        {new Date(
                          tx.createdAt || tx.createdat,
                        ).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {account
                          ? `${account.account_type} •••• ${account.account_number?.slice(-4)}`
                          : '—'}
                      </td>
                      <td className="px-4 py-3 text-sm text-text/80 truncate max-w-xs">
                        {tx.description || '—'}
                      </td>
                      <td className="px-4 py-3 text-sm capitalize">
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
