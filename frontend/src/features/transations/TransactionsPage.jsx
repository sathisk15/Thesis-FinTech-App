import { useEffect, useMemo, useState } from 'react';
import { FixedSizeList } from 'react-window';
import DOMPurify from 'dompurify';
import { useAccountStore } from '../../store/useAccountStore';
import { useTransactionStore } from '../../store/useTransactionStore';

// P7: 300ms debounce hook — delays search filter until user pauses typing.
// Prevents a full filter+sort pass on every keystroke.
function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

const ROW_HEIGHT = 53; // px — matches table row padding

// P6: Row renderer for react-window FixedSizeList
const TransactionRow = ({ index, style, data }) => {
  const { rows, accounts } = data;
  const tx = rows[index];
  if (!tx) return null;

  const isIncoming = tx.type === 'deposit' || tx.type === 'credit';
  const account = accounts.find((acc) => acc.id === tx.accountId || acc.id === tx.account_id);

  return (
    <div
      style={style}
      className="grid grid-cols-5 border-b border-border last:border-0 hover:bg-background/50 transition"
    >
      <div className="px-4 flex items-center text-sm">
        {new Date(tx.createdAt || tx.createdat).toLocaleDateString()}
      </div>
      <div className="px-4 flex items-center text-sm">
        {account ? `${account.account_type} •••• ${account.account_number?.slice(-4)}` : '—'}
      </div>
      <div className="px-4 flex items-center text-sm text-text/80 truncate">
        {/* S9: sanitize description before rendering to prevent stored XSS */}
        {DOMPurify.sanitize(tx.description || '—')}
      </div>
      <div className="px-4 flex items-center text-sm capitalize">{tx.type}</div>
      <div className={`px-4 flex items-center justify-end text-sm font-medium ${isIncoming ? 'text-green-500' : 'text-red-500'}`}>
        {isIncoming ? '+' : '-'}
        {new Intl.NumberFormat('en-IE', { style: 'currency', currency: tx.currency || 'EUR' }).format(tx.amount)}
      </div>
    </div>
  );
};

const TransactionPage = () => {
  const accounts = useAccountStore((state) => state.accounts);
  const fetchAccounts = useAccountStore((state) => state.fetchAccounts);
  const transactions = useTransactionStore((state) => state.transactions);
  const fetchTransactions = useTransactionStore((state) => state.fetchTransactions);
  const loading = useTransactionStore((state) => state.loading);

  const [selectedAccount, setSelectedAccount] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [search, setSearch] = useState('');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [flow, setFlow] = useState('all');
  const [sortBy, setSortBy] = useState('date-desc');

  // P7: debounced search — filter only fires 300ms after user stops typing
  const debouncedSearch = useDebounce(search, 300);

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
    selectedAccount || fromDate || toDate || search ||
    minAmount || maxAmount || flow !== 'all' || sortBy !== 'date-desc';

  // P2: useMemo — filter+sort only reruns when dependencies actually change.
  // debouncedSearch (not raw search) gates the expensive filter pass.
  const filteredTransactions = useMemo(() => {
    let data = [...transactions];
    data = data.filter((tx) => {
      const txDate = new Date(tx.createdAt || tx.createdat);
      const amount = Number(tx.amount);
      const isIncoming = tx.type === 'deposit' || tx.type === 'credit';
      return (
        (!fromDate || txDate >= new Date(fromDate)) &&
        (!toDate || txDate <= new Date(toDate)) &&
        (!debouncedSearch || tx.description?.toLowerCase().includes(debouncedSearch.toLowerCase())) &&
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
  }, [transactions, fromDate, toDate, debouncedSearch, minAmount, maxAmount, flow, sortBy]);

  // P6: itemData is stable reference passed to FixedSizeList row renderer
  const itemData = useMemo(() => ({ rows: filteredTransactions, accounts }), [filteredTransactions, accounts]);

  const listHeight = Math.min(filteredTransactions.length * ROW_HEIGHT, 530);

  return (
    <div data-testid="transactions-page" className="w-full py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-text">Transactions</h1>
          <p className="text-sm text-text/60 mt-1">View and filter your transaction history</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-end gap-3">
          <select
            data-testid="transactions-account-filter"
            value={selectedAccount}
            onChange={(e) => setSelectedAccount(e.target.value)}
            className="h-9 px-3 rounded-md bg-background border border-border text-sm text-text outline-none focus:ring-2 focus:ring-primary/40"
          >
            <option value="">All Accounts</option>
            {accounts.map((acc) => (
              <option key={acc.id} value={acc.id}>
                {acc.account_type} •••• {acc.account_number?.slice(-4)}
              </option>
            ))}
          </select>

          <input
            data-testid="transactions-from-date"
            type="date" value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="h-9 px-2 rounded-md bg-background border border-border text-xs text-text outline-none focus:ring-2 focus:ring-primary/40"
          />
          <input
            data-testid="transactions-to-date"
            type="date" value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="h-9 px-2 rounded-md bg-background border border-border text-xs text-text outline-none focus:ring-2 focus:ring-primary/40"
          />

          {/* P7: input updates raw search; debouncedSearch drives the filter */}
          <input
            data-testid="transactions-search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Description…"
            className="h-9 px-3 rounded-md bg-background border border-border text-sm text-text outline-none focus:ring-2 focus:ring-primary/40"
          />

          <input
            data-testid="transactions-min-amount"
            type="number" placeholder="Min" value={minAmount}
            onChange={(e) => setMinAmount(e.target.value)}
            className="h-9 w-20 px-2 rounded-md bg-background border border-border text-xs outline-none focus:ring-2 focus:ring-primary/40"
          />
          <input
            data-testid="transactions-max-amount"
            type="number" placeholder="Max" value={maxAmount}
            onChange={(e) => setMaxAmount(e.target.value)}
            className="h-9 w-20 px-2 rounded-md bg-background border border-border text-xs outline-none focus:ring-2 focus:ring-primary/40"
          />

          <select
            data-testid="transactions-flow-filter"
            value={flow} onChange={(e) => setFlow(e.target.value)}
            className="h-9 px-2 rounded-md bg-background border border-border text-xs outline-none focus:ring-2 focus:ring-primary/40"
          >
            <option value="all">All</option>
            <option value="incoming">Incoming</option>
            <option value="outgoing">Outgoing</option>
          </select>

          <select
            data-testid="transactions-sort"
            value={sortBy} onChange={(e) => setSortBy(e.target.value)}
            className="h-9 px-2 rounded-md bg-background border border-border text-xs outline-none focus:ring-2 focus:ring-primary/40"
          >
            <option value="date-desc">Newest</option>
            <option value="date-asc">Oldest</option>
            <option value="amount-desc">Amount ↓</option>
            <option value="amount-asc">Amount ↑</option>
          </select>

          <button
            data-testid="transactions-clear"
            onClick={handleClearFilters}
            disabled={!hasActiveFilters}
            className="h-9 px-3 rounded-md border border-border text-xs text-text hover:bg-border/40 transition disabled:opacity-50"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        {loading && <div className="py-16 text-center text-text/60">Loading transactions…</div>}
        {!loading && filteredTransactions.length === 0 && <div className="py-16 text-center text-text/60">No transactions found.</div>}

        {!loading && filteredTransactions.length > 0 && (
          <div className="overflow-x-auto">
            {/* Header row */}
            <div className="grid grid-cols-5 bg-background border-b border-border">
              {['Date', 'Account', 'Description', 'Type', 'Amount'].map((h, i) => (
                <div key={h} className={`px-4 py-3 text-xs font-medium text-text/60 ${i === 4 ? 'text-right' : 'text-left'}`}>{h}</div>
              ))}
            </div>
            {/* P6: FixedSizeList — only renders visible rows instead of the full list */}
            <div data-testid="transactions-table-body">
              <FixedSizeList
                height={listHeight || ROW_HEIGHT}
                itemCount={filteredTransactions.length}
                itemSize={ROW_HEIGHT}
                itemData={itemData}
                width="100%"
              >
                {TransactionRow}
              </FixedSizeList>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionPage;
