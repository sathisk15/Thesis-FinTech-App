import { useEffect, useState, useMemo } from 'react';
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

const DashboardPage = () => {
  /* ================= STATE & DATA FETCHING ================= */
  const accounts = useAccountStore((state) => state.accounts);
  const fetchAccounts = useAccountStore((state) => state.fetchAccounts);
  const transactions = useTransactionStore((state) => state.transactions);
  const fetchTransactions = useTransactionStore(
    (state) => state.fetchTransactions,
  );

  const [timeFilter, setTimeFilter] = useState('monthly');

  useEffect(() => {
    fetchAccounts();
    fetchTransactions();
  }, [fetchAccounts, fetchTransactions]);

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

  const calculatePercentage = (current, previous) => {
    if (previous === 0 && current > 0) return 100;
    if (previous === 0 && current === 0) return 0;
    return ((current - previous) / previous) * 100;
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

  // 3. Performance Changes
  const incomeChange = calculatePercentage(currentIncome, previousIncome);
  const expenseChange = calculatePercentage(currentExpense, previousExpense);
  const balanceChange = incomeChange - expenseChange;

  // 4. Net Savings & Cash Flow
  const netSavings = totalIncome - totalExpense;
  const netSavingsChange = calculatePercentage(
    currentIncome - currentExpense,
    previousIncome - previousExpense,
  );

  const cashFlow = totalIncome - totalExpense;
  const currentCashFlow = currentIncome - currentExpense;
  const previousCashFlow = previousIncome - previousExpense;
  const cashFlowChange = calculatePercentage(currentCashFlow, previousCashFlow);

  // 5. Ratios & Averages
  const expenseIncomeRatio =
    totalIncome === 0 ? 0 : (totalExpense / totalIncome) * 100;
  const currentRatio =
    currentIncome === 0 ? 0 : (currentExpense / currentIncome) * 100;
  const previousRatio =
    previousIncome === 0 ? 0 : (previousExpense / previousIncome) * 100;
  const expenseIncomeRatioChange = calculatePercentage(
    currentRatio,
    previousRatio,
  );

  const expenseDaysSet = new Set(
    transactions
      .filter(
        (tx) =>
          (tx.type === 'debit' || tx.type === 'withdrawal') &&
          isSameMonth(tx.createdat),
      )
      .map((tx) => new Date(tx.createdat).toDateString()),
  );
  const activeExpenseDays = expenseDaysSet.size || 1;
  const averageDailySpend = currentExpense / activeExpenseDays;
  const monthlyBurnRate = currentExpense;
  const burnRateChange = calculatePercentage(currentExpense, previousExpense);

  // 6. Moving Averages (3-Month)
  const getLastNMonthsTotals = (n, type) => {
    const totals = {};
    transactions.forEach((tx) => {
      const date = new Date(tx.createdat);
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      if (!totals[key]) totals[key] = { income: 0, expense: 0 };
      if (tx.type === 'credit' || tx.type === 'deposit') {
        totals[key].income += Number(tx.amount);
      } else {
        totals[key].expense += Number(tx.amount);
      }
    });
    const values = Object.values(totals).slice(-n);
    return values.length === 0
      ? 0
      : values.reduce((sum, m) => sum + m[type], 0) / n;
  };

  const avgIncome3M = getLastNMonthsTotals(3, 'income');
  const avgExpense3M = getLastNMonthsTotals(3, 'expense');

  // 7. Category Analysis
  const expenseByCategory = transactions.reduce((acc, tx) => {
    if (!(tx.type === 'debit' || tx.type === 'withdrawal')) return acc;
    const category = tx.description || 'Others';
    acc[category] = (acc[category] || 0) + Number(tx.amount);
    return acc;
  }, {});

  const topSpendingEntry = Object.entries(expenseByCategory).sort(
    (a, b) => b[1] - a[1],
  )[0];
  const topSpendingCategory = topSpendingEntry
    ? { name: topSpendingEntry[0], amount: topSpendingEntry[1] }
    : null;

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

  const largestExpenseTx = transactions
    .filter((tx) => tx.type === 'debit' || tx.type === 'withdrawal')
    .sort((a, b) => Number(b.amount) - Number(a.amount))[0];

  const largestExpense = largestExpenseTx
    ? {
        amount: Number(largestExpenseTx.amount),
        category: largestExpenseTx.description || 'Others',
        date: largestExpenseTx.createdat,
      }
    : null;

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

      {/* KPI Grid Section */}
      <KpiGrid
        totalBalance={totalBalance}
        totalIncome={totalIncome}
        totalExpense={totalExpense}
        netSavings={netSavings}
        expenseIncomeRatio={expenseIncomeRatio}
        cashFlow={cashFlow}
        averageDailySpend={averageDailySpend}
        monthlyBurnRate={monthlyBurnRate}
        avgIncome3M={avgIncome3M}
        avgExpense3M={avgExpense3M}
        topSpendingCategory={topSpendingCategory}
        largestExpense={largestExpense}
        balanceChange={balanceChange}
        incomeChange={incomeChange}
        expenseChange={expenseChange}
        netSavingsChange={netSavingsChange}
        expenseIncomeRatioChange={expenseIncomeRatioChange}
        cashFlowChange={cashFlowChange}
        burnRateChange={burnRateChange}
        formatCurrency={formatCurrency}
      />

      {/* Expense Breakdown Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ExpenseBreakdown
          expenseCategoryPercentages={expenseCategoryPercentages}
        />
        <ExpenseCategoryPie data={expenseCategoryPieData} colors={COLORS} />
      </div>

      {/* Charts & Health Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Line Chart */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-4 h-[420px]">
          <TransactionActivityHeader
            timeFilter={timeFilter}
            onChange={setTimeFilter}
          />
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

        {/* Health Scores */}
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

        {/* Summary Pie Chart */}
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

      {/* Bottom Section: Transactions and Accounts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <LatestTransactions transactions={latestTransactions} />
        <AccountsList accounts={accounts} />
      </div>
    </div>
  );
};

export default DashboardPage;
