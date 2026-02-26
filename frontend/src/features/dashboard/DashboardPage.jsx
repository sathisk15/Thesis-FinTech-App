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
} from 'recharts';
import { PieChart, Pie, Cell } from 'recharts';
import { SiCashapp } from 'react-icons/si';
import { BsCashCoin, BsCurrencyDollar } from 'react-icons/bs';
import { IoMdArrowUp, IoMdArrowDown } from 'react-icons/io';
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
    fetchTransactions(); // fetch all transactions
  }, [fetchAccounts, fetchTransactions]);

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
    const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    return (
      d.getMonth() === prevMonth.getMonth() &&
      d.getFullYear() === prevMonth.getFullYear()
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
    console.log(current, previous);
    if (previous === 0 && current > 0) return 100;
    if (previous === 0 && current === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  const incomeChange = calculatePercentage(currentIncome, previousIncome);

  const expenseChange = calculatePercentage(currentExpense, previousExpense);

  const balanceChange = incomeChange - expenseChange;

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
        grouped[key] = {
          label,
          income: 0,
          expense: 0,
        };
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
    {
      name: 'Income',
      value: totalIncome,
    },
    {
      name: 'Expense',
      value: totalExpense,
    },
    {
      name: 'Balance',
      value: totalBalance,
    },
  ];

  const COLORS = ['#16a34a', '#dc2626', '#2563eb'];

  const getAccountColor = (type) => {
    if (type === 'Savings') return 'bg-green-500/20 text-green-600';
    if (type === 'Current') return 'bg-blue-500/20 text-blue-600';
    if (type === 'Business') return 'bg-purple-500/20 text-purple-600';
    return 'bg-gray-500/20 text-gray-600';
  };

  const latestTransactions = [...transactions]
    .sort((a, b) => new Date(b.createdat) - new Date(a.createdat))
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-background">
      <div className="px-0 md:px-5 2xl:px-20">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between py-8">
          <div className="mb-6">
            <h1 className="text-4xl font-semibold text-text mb-2">Dashboard</h1>
            <span className="text-text/60">
              Monitor your financial activities
            </span>
          </div>

          <div className="flex items-center gap-4 md:gap-10 2xl:gap-20">
            {/* Filter goes here */}
          </div>
        </div>

        {/* Stat Cards */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-20">
          {[
            {
              title: 'Your Total Balance',
              value: formatCurrency(totalBalance),
              icon: <BsCurrencyDollar size={26} />,
            },
            {
              title: 'Total Income',
              value: formatCurrency(totalIncome),
              icon: <BsCashCoin size={26} />,
            },
            {
              title: 'Total Expense',
              value: formatCurrency(totalExpense),
              icon: <GiExpense size={26} />,
            },
          ].map((item) => (
            <div
              key={item.title}
              className="w-full flex items-center justify-between gap-5 px-8 py-12 rounded-lg bg-card border border-border"
            >
              <div className="flex items-center gap-2">
                <div className="w-12 h-12 flex items-center justify-center rounded-full bg-primary text-white">
                  {item.icon}
                </div>
              </div>
              <div className="space-y-3">
                <span className="text-text/60 text-lg">{item.title}</span>
                <p className="text-2xl font-medium text-text">{item.value}</p>
              </div>

              <span
                className={`font-semibold ${
                  item.title === 'Total Expense'
                    ? expenseChange > 0
                      ? 'text-red-500'
                      : 'text-green-500'
                    : item.title === 'Total Income'
                      ? incomeChange >= 0
                        ? 'text-green-500'
                        : 'text-red-500'
                      : balanceChange >= 0
                        ? 'text-green-500'
                        : 'text-red-500'
                }`}
              >
                {item.title === 'Total Expense'
                  ? `${expenseChange >= 0 ? '+' : ''}${expenseChange.toFixed(1)}%`
                  : item.title === 'Total Income'
                    ? `${incomeChange >= 0 ? '+' : ''}${incomeChange.toFixed(1)}%`
                    : `${balanceChange >= 0 ? '+' : ''}${balanceChange.toFixed(1)}%`}
              </span>
            </div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="flex flex-col md:flex-row gap-10">
          <div className="w-full md:w-2/3">
            <p className="text-2xl font-semibold text-text/60 mb-4">
              Transaction Activity
            </p>

            <div className="bg-card border border-border rounded-lg p-4 h-[500px]">
              <div className="flex w-full justify-center gap-3 mb-4">
                {['yearly', 'monthly', 'daily', 'hourly'].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setTimeFilter(filter)}
                    className={`px-3 py-1 rounded-md border text-sm ${
                      timeFilter === filter
                        ? 'bg-primary text-white'
                        : 'border-border text-text'
                    } cursor-pointer`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
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
          </div>

          <div className="w-full md:w-1/3">
            <p className="text-2xl font-semibold text-text/60 mb-4">Summary</p>

            <div className="bg-card border border-border rounded-lg p-4 h-[500px]">
              {/* Pie chart  */}
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={120}
                    label
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Tables */}
        <div className="flex flex-col md:flex-row gap-10 mt-20">
          <div className="w-full md:w-2/3">
            <p className="text-2xl font-semibold text-text/60 mb-4">
              Latest Transactions
            </p>

            <div className="overflow-x-auto bg-card border border-border rounded-lg">
              <table className="w-full">
                <thead className="border-b border-border text-text">
                  <tr>
                    <th className="py-3 px-4 text-left">Date</th>
                    <th className="py-3 px-4 text-left">Name</th>
                    <th className="py-3 px-4 text-left">Status</th>
                    <th className="py-3 px-4 text-left">Source</th>
                    <th className="py-3 px-4 text-left">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {latestTransactions.length === 0 && (
                    <tr>
                      <td colSpan="5" className="py-6 text-center text-text/60">
                        No transactions available
                      </td>
                    </tr>
                  )}

                  {latestTransactions.map((tx) => {
                    const isIncoming =
                      tx.type === 'credit' || tx.type === 'deposit';

                    // 🔥 Find account from accounts array
                    const account = accounts.find(
                      (acc) => acc.id === tx.account_id,
                    );

                    return (
                      <tr
                        key={tx.id}
                        className="border-b border-border last:border-none"
                      >
                        <td className="py-3 px-4">
                          {new Date(tx.createdat).toLocaleDateString()}
                        </td>

                        <td className="py-3 px-4">{tx.description || '—'}</td>

                        <td className="py-3 px-4 capitalize">{tx.type}</td>

                        {/* 🔥 Source column now mapped correctly */}
                        <td className="py-3 px-4">
                          {account
                            ? `${account.account_type} •••• ${account.account_number?.slice(-4)}`
                            : '—'}
                        </td>

                        <td
                          className={`py-3 px-4 font-medium ${
                            isIncoming ? 'text-green-500' : 'text-red-500'
                          }`}
                        >
                          {isIncoming ? '+' : '-'}
                          {formatCurrency(tx.amount, account?.currency)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tbody />
              </table>
            </div>
          </div>

          <div className="w-full md:w-1/3">
            <p className="text-2xl font-semibold text-text/60">Accounts</p>
            {/* <span className="text-sm text-text/60">View all your accounts</span> */}

            <div className="mt-4 bg-card border border-border rounded-lg p-4">
              {/* Accounts list */}
              {accounts.length === 0 && (
                <p className="text-text/60 text-sm">No accounts available</p>
              )}

              {accounts.map((acc) => (
                <div
                  key={acc.id}
                  className="flex items-center justify-between py-4 border-b border-border last:border-none"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm ${getAccountColor(
                        acc.account_type,
                      )}`}
                    >
                      {acc.account_type?.slice(0, 2).toUpperCase()}
                    </div>

                    <div>
                      <p className="text-text font-medium">
                        {acc.account_type} Account
                      </p>
                      <p className="text-text/60 text-xs font-mono">
                        •••• {acc.account_number?.slice(-4)}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="font-semibold text-text">
                      {formatCurrency(acc.account_balance, acc.currency)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
