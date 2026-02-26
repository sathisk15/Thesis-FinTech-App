import { useEffect, useState } from 'react';
import { useAccountStore } from '../../store/useAccountStore';
import { useTransactionStore } from '../../store/useTransactionStore';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { BsCashCoin, BsCurrencyDollar } from 'react-icons/bs';
import { GiExpense } from 'react-icons/gi';

const DashboardPage = () => {
  const accounts = useAccountStore((state) => state.accounts);
  const fetchAccounts = useAccountStore((state) => state.fetchAccounts);

  const transactions = useTransactionStore((state) => state.transactions);
  const fetchTransactions = useTransactionStore(
    (state) => state.fetchTransactions,
  );

  useEffect(() => {
    fetchAccounts();
    fetchTransactions();
  }, [fetchAccounts, fetchTransactions]);

  /* ================= calculations ================= */

  const totalBalance = accounts.reduce(
    (sum, acc) => sum + Number(acc.account_balance || 0),
    0,
  );

  const totalIncome = transactions
    .filter((tx) => tx.type === 'deposit' || tx.type === 'credit')
    .reduce((sum, tx) => sum + Number(tx.amount), 0);

  const totalExpense = transactions
    .filter((tx) => tx.type === 'debit' || tx.type === 'withdrawal')
    .reduce((sum, tx) => sum + Number(tx.amount), 0);

  const formatCurrency = (value, currency = 'EUR') =>
    new Intl.NumberFormat('en-IE', {
      style: 'currency',
      currency,
    }).format(value);

  const now = new Date();

  const isSameMonth = (date) => {
    const d = new Date(date);
    return (
      d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    );
  };

  const isPreviousMonth = (date) => {
    const d = new Date(date);
    const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    return (
      d.getMonth() === prev.getMonth() && d.getFullYear() === prev.getFullYear()
    );
  };

  const getMonthlyTotal = (filterFn) =>
    transactions
      .filter(filterFn)
      .reduce((sum, tx) => sum + Number(tx.amount), 0);

  const currentIncome = getMonthlyTotal(
    (tx) =>
      (tx.type === 'deposit' || tx.type === 'credit') &&
      isSameMonth(tx.createdat),
  );

  const previousIncome = getMonthlyTotal(
    (tx) =>
      (tx.type === 'deposit' || tx.type === 'credit') &&
      isPreviousMonth(tx.createdat),
  );

  const currentExpense = getMonthlyTotal(
    (tx) =>
      (tx.type === 'debit' || tx.type === 'withdrawal') &&
      isSameMonth(tx.createdat),
  );

  const previousExpense = getMonthlyTotal(
    (tx) =>
      (tx.type === 'debit' || tx.type === 'withdrawal') &&
      isPreviousMonth(tx.createdat),
  );

  const calculatePercentage = (current, previous) => {
    if (previous === 0 && current > 0) return 100;
    if (previous === 0 && current === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  const incomeChange = calculatePercentage(currentIncome, previousIncome);
  const expenseChange = calculatePercentage(currentExpense, previousExpense);
  const balanceChange = incomeChange - expenseChange;

  /* ================= charts ================= */

  const [timeFilter, setTimeFilter] = useState('monthly');

  const getChartData = () => {
    const grouped = {};

    transactions.forEach((tx) => {
      const date = new Date(tx.createdat);
      let key = '';
      let label = '';

      if (timeFilter === 'yearly') {
        key = date.getFullYear();
        label = `${key}`;
      }

      if (timeFilter === 'monthly') {
        key = `${date.getFullYear()}-${date.getMonth()}`;
        label = date.toLocaleString('default', { month: 'short' });
      }

      if (timeFilter === 'daily') {
        key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
        label = date.getDate();
      }

      if (timeFilter === 'hourly') {
        key = `${date.getHours()}`;
        label = `${date.getHours()}:00`;
      }

      if (!grouped[key]) {
        grouped[key] = { label, income: 0, expense: 0 };
      }

      if (tx.type === 'credit' || tx.type === 'deposit') {
        grouped[key].income += Number(tx.amount);
      } else {
        grouped[key].expense += Number(tx.amount);
      }
    });

    return Object.values(grouped);
  };

  const chartData = getChartData();

  const pieData = [
    { name: 'Income', value: totalIncome },
    { name: 'Expense', value: totalExpense },
    { name: 'Balance', value: totalBalance },
  ];

  const COLORS = ['#16a34a', '#dc2626', '#2563eb'];

  const latestTransactions = [...transactions]
    .sort((a, b) => new Date(b.createdat) - new Date(a.createdat))
    .slice(0, 5);

  const getAccountColor = (type) => {
    if (type === 'Savings') return 'bg-green-500/20 text-green-600';
    if (type === 'Current') return 'bg-blue-500/20 text-blue-600';
    return 'bg-purple-500/20 text-purple-600';
  };

  /* ================= UI ================= */

  return (
    <div className="w-full py-10 space-y-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-text">
          Dashboard
        </h1>
        <p className="text-sm text-text/60 mt-1">
          Overview of your financial activity
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            label: 'Total Balance',
            value: formatCurrency(totalBalance),
            change: balanceChange,
            icon: <BsCurrencyDollar />,
          },
          {
            label: 'Total Income',
            value: formatCurrency(totalIncome),
            change: incomeChange,
            icon: <BsCashCoin />,
          },
          {
            label: 'Total Expense',
            value: formatCurrency(totalExpense),
            change: expenseChange,
            icon: <GiExpense />,
          },
        ].map((item) => (
          <div
            key={item.label}
            className="bg-card border border-border rounded-xl p-6 flex justify-between items-center"
          >
            <div>
              <p className="text-sm text-text/60">{item.label}</p>
              <p className="text-2xl font-semibold text-text mt-1">
                {item.value}
              </p>
            </div>

            <div className="text-right space-y-1">
              <div className="w-10 h-10 rounded-full bg-primary/15 text-primary flex items-center justify-center">
                {item.icon}
              </div>
              <span
                className={`text-sm font-semibold ${
                  item.change >= 0 ? 'text-green-500' : 'text-red-500'
                }`}
              >
                {item.change >= 0 ? '+' : ''}
                {item.change.toFixed(1)}%
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-4 h-[420px]">
          <div className="flex justify-between mb-4">
            <p className="text-sm font-medium text-text/60">
              Transaction Activity
            </p>
            <div className="flex gap-2">
              {['yearly', 'monthly', 'daily', 'hourly'].map((f) => (
                <button
                  key={f}
                  onClick={() => setTimeFilter(f)}
                  className={`px-3 py-1 text-xs rounded-md border ${
                    timeFilter === f
                      ? 'bg-primary text-white'
                      : 'border-border text-text/70'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="income"
                stroke="#16a34a"
                strokeWidth={3}
              />
              <Line
                type="monotone"
                dataKey="expense"
                stroke="#dc2626"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card border border-border rounded-xl p-4 h-[420px]">
          <p className="text-sm font-medium text-text/60 mb-4">Summary</p>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={pieData} dataKey="value" outerRadius={110} label>
                {pieData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i]} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => formatCurrency(v)} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Latest Transactions */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <p className="text-sm font-medium text-text/60">
              Latest Transactions
            </p>
          </div>

          <table className="w-full">
            <tbody>
              {latestTransactions.map((tx) => {
                const incoming = tx.type === 'credit' || tx.type === 'deposit';
                return (
                  <tr
                    key={tx.id}
                    className="border-b border-border last:border-0"
                  >
                    <td className="px-4 py-3 text-sm">
                      {new Date(tx.createdat).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {tx.description || '—'}
                    </td>
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

        {/* Accounts */}
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
      </div>
    </div>
  );
};

export default DashboardPage;
