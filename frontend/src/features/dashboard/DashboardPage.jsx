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

// Component Imports
import FinancialHealthScore from './components/FinancialHealthScore';
import MonthlyComparison from './components/MonthlyComparison';
import BudgetHealth from './components/BudgetHealth';
import SavingsRate from './components/SavingsRate';
import AccountsList from './components/AccountsList';
import LatestTransactions from './components/LatestTransactions';
import KpiGrid from './components/KpiGrid';
import ExpenseBreakdown from './components/ExpenseBreakdown';
import ExpenseCategoryPie from './components/ExpenseCategoryPie';
import TransactionActivityHeader from './components/TransactionActivityHeader';
import DashboardHeader from './components/DashboardHeader';

const DashboardPage = () => {
  const accounts = useAccountStore((state) => state.accounts);
  const transactions = useTransactionStore((state) => state.transactions);
  const fetchAccounts = useAccountStore((state) => state.fetchAccounts);
  const fetchTransactions = useTransactionStore(
    (state) => state.fetchTransactions,
  );

  const [selectedAccountId, setSelectedAccountId] = useState(null);
  const [selectedAccountTxs, setSelectedAccountTxs] = useState([]);

  useEffect(() => {
    setSelectedAccountTxs(
      selectedAccountId
        ? transactions.filter((tx) => tx.account_id === selectedAccountId)
        : transactions,
    );
  }, [selectedAccountId, transactions]);

  useEffect(() => {
    fetchAccounts();
    fetchTransactions();
  }, [fetchAccounts, fetchTransactions]);

  const [timeFilter, setTimeFilter] = useState('monthly');

  /* ================= UTILITY FUNCTIONS ================= */
  const now = new Date();

  const formatCurrency = (value, currency = 'EUR') =>
    new Intl.NumberFormat('en-IE', {
      style: 'currency',
      currency,
    }).format(value);

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

  /* ================= FINANCIAL CALCULATIONS ================= */

  // 1. Totals (Global)
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

  // 2. Monthly Comparisons
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

  // 7. Category Analysis
  const expenseByCategory = transactions.reduce((acc, tx) => {
    if (!(tx.type === 'debit' || tx.type === 'withdrawal')) return acc;
    const category = tx.description || 'Others';
    acc[category] = (acc[category] || 0) + Number(tx.amount);
    return acc;
  }, {});

  const totalExpenseAmount = Object.values(expenseByCategory).reduce(
    (sum, val) => sum + val,
    0,
  );
  const expenseCategoryPercentages = Object.entries(expenseByCategory).map(
    ([category, amount]) => ({
      category,
      percentage:
        totalExpenseAmount === 0 ? 0 : (amount / totalExpenseAmount) * 100,
    }),
  );

  /* ================= CHART DATA PREPARATION ================= */

  const getChartData = () => {
    const grouped = {};
    transactions.forEach((tx) => {
      const date = new Date(tx.createdat);
      let key = '',
        label = '';

      if (timeFilter === 'yearly') {
        key = date.getFullYear();
        label = `${key}`;
      } else if (timeFilter === 'monthly') {
        key = `${date.getFullYear()}-${date.getMonth()}`;
        label = date.toLocaleString('default', { month: 'short' });
      } else if (timeFilter === 'daily') {
        key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
        label = date.getDate();
      } else if (timeFilter === 'hourly') {
        key = `${date.getHours()}`;
        label = `${date.getHours()}:00`;
      }

      if (!grouped[key]) grouped[key] = { label, income: 0, expense: 0 };
      if (tx.type === 'credit' || tx.type === 'deposit')
        grouped[key].income += Number(tx.amount);
      else grouped[key].expense += Number(tx.amount);
    });
    return Object.values(grouped);
  };

  const chartData = getChartData();
  const COLORS = ['#16a34a', '#dc2626', '#2563eb'];
  const pieData = [
    { name: 'Income', value: totalIncome },
    { name: 'Expense', value: totalExpense },
    { name: 'Balance', value: totalBalance },
  ];

  const sortedExpenseCategories = Object.entries(expenseByCategory).sort(
    (a, b) => b[1] - a[1],
  );
  const topCategories = sortedExpenseCategories.slice(0, 5);
  const othersTotal = sortedExpenseCategories
    .slice(5)
    .reduce((sum, [, amount]) => sum + amount, 0);

  const expenseCategoryPieData = [
    ...topCategories.map(([name, value]) => ({ name, value })),
    ...(othersTotal > 0 ? [{ name: 'Others', value: othersTotal }] : []),
  ];

  const latestTransactions = [...transactions]
    .sort((a, b) => new Date(b.createdat) - new Date(a.createdat))
    .slice(0, 5);

  /* ================= UI RENDERING ================= */
  return (
    <div className="w-full px-4 md:px-6 py-8 space-y-10">
      {/* Header */}
      <DashboardHeader
        accounts={accounts}
        selectedAccountId={selectedAccountId}
        setSelectedAccountId={setSelectedAccountId}
      />

      {/* KPI Grid */}
      <section className="space-y-4">
        <KpiGrid transactions={selectedAccountTxs} />
      </section>

      {/* Charts  */}
      <section className="grid grid-cols-1 gap-6">
        {/* Line Chart */}
        <div className=" bg-card border border-border rounded-xl p-4 h-[420px] flex flex-col">
          <TransactionActivityHeader
            timeFilter={timeFilter}
            onChange={setTimeFilter}
          />
          <div className="flex-1">
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
        </div>
      </section>

      {/* Expense Breakdown */}
      <section className="grid grid-cols-3 gap-6">
        <ExpenseBreakdown
          expenseCategoryPercentages={expenseCategoryPercentages}
        />
        <ExpenseCategoryPie data={expenseCategoryPieData} colors={COLORS} />

        {/* Summary Pie Chart */}
        <div className="col-span-1 bg-card border border-border rounded-xl p-4 h-[420px]">
          <p className="text-sm font-medium text-text/60 mb-4">Summary</p>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={pieData} dataKey="value" outerRadius={110} label>
                {pieData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i]} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => formatCurrency(v)} />
              {/* <Legend /> */}
            </PieChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Health Cards */}
      <section>
        <div className="grid grid-cols-4 gap-6">
          <FinancialHealthScore
            totalIncome={totalIncome}
            totalExpense={totalExpense}
            currentIncome={currentIncome}
            currentExpense={currentExpense}
            previousIncome={previousIncome}
            previousExpense={previousExpense}
          />
          <MonthlyComparison
            currentIncome={currentIncome}
            previousIncome={previousIncome}
            currentExpense={currentExpense}
            previousExpense={previousExpense}
          />
          <BudgetHealth totalIncome={totalIncome} totalExpense={totalExpense} />
          <SavingsRate totalIncome={totalIncome} totalExpense={totalExpense} />
        </div>
      </section>

      {/* Transactions and Account */}
      <section className="grid grid-cols-3 gap-6">
        <LatestTransactions transactions={latestTransactions} />
        <AccountsList accounts={accounts} />
      </section>
    </div>
  );
};

export default DashboardPage;
