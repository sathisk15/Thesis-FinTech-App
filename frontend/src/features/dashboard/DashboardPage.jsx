import { useEffect, useState } from 'react';
import { useAccountStore } from '../../store/useAccountStore';
import { useTransactionStore } from '../../store/useTransactionStore';
import { FiX } from 'react-icons/fi';

// Component Imports
import FinancialHealthScore from './components/FinancialHealthScore';
import MonthlyComparison from './components/MonthlyComparison';
import BudgetHealth from './components/BudgetHealth';
import SavingsRate from './components/SavingsRate';
import AccountsList from './components/AccountsList';
import LatestTransactions from './components/LatestTransactions';
import KpiGrid from './components/KpiGrid';
import IncomeExpenseBreakdown from './components/IncomeExpenseBreakdown';
import DashboardHeader from './components/DashboardHeader';
import CustomPieChart from './components/CustomPieChart';
import CustomLineChart from './components/CustomLineChart';
import { AccountFilterDropdown } from './components/AccountFilterDropdown';
import TimeRangeFilterChips from './components/TimeRangeFilterChips';

const DashboardPage = () => {
  const accounts = useAccountStore((state) => state.accounts);
  const transactions = useTransactionStore((state) => state.transactions);
  const fetchAccounts = useAccountStore((state) => state.fetchAccounts);
  const fetchTransactions = useTransactionStore(
    (state) => state.fetchTransactions,
  );

  useEffect(() => {
    fetchAccounts();
    fetchTransactions();
  }, [fetchAccounts, fetchTransactions]);

  // Seprate Logic
  function parseDate(dateString) {
    // "2025-12-31 12:00:00" → "2025-12-31T12:00:00"
    return new Date(dateString.replace(' ', 'T'));
  }
  function isInTimeRange(dateString, range) {
    if (range === 'all_time') return true;

    const txDate = parseDate(dateString);
    const now = new Date();

    if (range === 'this_month') {
      return (
        txDate.getMonth() === now.getMonth() &&
        txDate.getFullYear() === now.getFullYear()
      );
    }

    if (range === 'last_month') {
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      return (
        txDate.getMonth() === lastMonth.getMonth() &&
        txDate.getFullYear() === lastMonth.getFullYear()
      );
    }

    if (range === 'last_3_months') {
      const from = new Date(now.getFullYear(), now.getMonth() - 3, 1);
      return txDate >= from;
    }

    if (range === 'last_6_months') {
      const from = new Date(now.getFullYear(), now.getMonth() - 6, 1);
      return txDate >= from;
    }

    if (range === 'ytd') {
      const from = new Date(now.getFullYear(), 0, 1);
      return txDate >= from;
    }

    return true;
  }

  // KPI logic

  const [selectedkpiAccountId, setSelectedKpiAccountId] = useState('all');
  const [kpiTimeRange, setKpiTimeRange] = useState('all_time');

  const clearKpiFilters = () => {
    setSelectedKpiAccountId('all');
    setKpiTimeRange('all_time');
  };

  const finalKpiTransactions = transactions.filter((tx) => {
    const matchesAccount =
      selectedkpiAccountId === 'all'
        ? true
        : tx.account_id === Number(selectedkpiAccountId);
    const matchesTime = isInTimeRange(tx.createdat, kpiTimeRange);
    return matchesAccount && matchesTime;
  });

  // Line Chart
  const [selectedLineChartAccountId, setSelectedLineChartAccountId] =
    useState('all');
  const filteredLineChartTransactions =
    selectedLineChartAccountId === 'all'
      ? transactions
      : transactions.filter(
          (tx) => tx.account_id === Number(selectedLineChartAccountId),
        );

  const getChartData = (txn) => {
    const grouped = {};

    txn.forEach((tx) => {
      const date = new Date(tx.createdat);

      // stable time key → YYYY-MM
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
        2,
        '0',
      )}`;

      if (!grouped[key]) {
        grouped[key] = {
          label: key, // e.g. 2026-02
          income: 0,
          expense: 0,
        };
      }

      const amount = Number(tx.amount);

      if (tx.type === 'credit' || tx.type === 'deposit') {
        grouped[key].income += amount;
      } else {
        grouped[key].expense += amount;
      }
    });

    // ensure correct order for trend charts
    return Object.keys(grouped)
      .sort()
      .map((key) => grouped[key]);
  };
  const chartData = getChartData(filteredLineChartTransactions);

  // Income & Expense Breakdown
  const [selectedPieChartAccountId, setSelectedPieChartAccountId] =
    useState('all');
  const [pieChartRange, setPieChartRange] = useState('all_time');

  const clearPieChartFilters = () => {
    setSelectedPieChartAccountId('all');
    setPieChartRange('all_time');
  };

  const finalPieChartTransactions = transactions.filter((tx) => {
    const matchesAccount =
      selectedPieChartAccountId === 'all'
        ? true
        : tx.account_id === Number(selectedPieChartAccountId);
    const matchesTime = isInTimeRange(tx.createdat, pieChartRange);

    return matchesAccount && matchesTime;
  });

  const expenseByCategory = finalPieChartTransactions.reduce((acc, tx) => {
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

  const incomeByCategory = finalPieChartTransactions.reduce((acc, tx) => {
    if (!(tx.type === 'credit' || tx.type === 'deposit')) return acc;

    const category = tx.category || 'Others';
    acc[category] = (acc[category] || 0) + Number(tx.amount);

    return acc;
  }, {});

  const totalIncomeAmount = Object.values(incomeByCategory).reduce(
    (sum, val) => sum + val,
    0,
  );

  let incomeCategoryPercentages = Object.entries(incomeByCategory)
    .map(([category, amount]) => ({
      category,
      percentage:
        totalIncomeAmount === 0 ? 0 : (amount / totalIncomeAmount) * 100,
    }))
    .sort((a, b) => b.percentage - a.percentage)
    .slice(0, 10);

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

  const totalPieChartBalance = accounts.reduce(
    (sum, acc) => sum + Number(acc.account_balance || 0),
    0,
  );

  const totalPieChartIncome = finalPieChartTransactions
    .filter((tx) => tx.type === 'deposit' || tx.type === 'credit')
    .reduce((sum, tx) => sum + Number(tx.amount), 0);

  const totalPieCharExpense = finalPieChartTransactions
    .filter((tx) => tx.type === 'debit' || tx.type === 'withdrawal')
    .reduce((sum, tx) => sum + Number(tx.amount), 0);
  const pieData = [
    { name: 'Income', value: totalPieChartIncome },
    { name: 'Expense', value: totalPieCharExpense },
    { name: 'Balance', value: totalPieChartBalance },
  ];

  // Health Cards
  const [selectedHealthCardsAccountId, setSelectedHealthCardsAccountId] =
    useState('all');

  const [healthCardsRange, setHealthCardsRange] = useState('all_time');

  const clearHealthCardFilters = () => {
    setSelectedHealthCardsAccountId('all');
    setHealthCardsRange('all_time');
  };

  const finalHealthCardTransactions = transactions.filter((tx) => {
    const matchesAccount =
      selectedHealthCardsAccountId === 'all'
        ? true
        : tx.account_id === Number(selectedHealthCardsAccountId);
    const matchesTime = isInTimeRange(tx.createdat, healthCardsRange);

    return matchesAccount && matchesTime;
  });

  // const filteredHealthCardsTransactions =
  //   selectedHealthCardsAccountId === 'all'
  //     ? transactions
  //     : transactions.filter(
  //         (tx) => tx.account_id === Number(selectedHealthCardsAccountId),
  //       );

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
  const totalHealthCardsIncome = finalHealthCardTransactions
    .filter((tx) => tx.type === 'deposit' || tx.type === 'credit')
    .reduce((sum, tx) => sum + Number(tx.amount), 0);

  const totalHealthCardsExpense = finalHealthCardTransactions
    .filter((tx) => tx.type === 'debit' || tx.type === 'withdrawal')
    .reduce((sum, tx) => sum + Number(tx.amount), 0);

  const getMonthlyHealthCardsTotal = (filterFn) =>
    finalHealthCardTransactions
      .filter(filterFn)
      .reduce((sum, tx) => sum + Number(tx.amount), 0);

  const currentHealthCardsIncome = getMonthlyHealthCardsTotal(
    (tx) =>
      (tx.type === 'deposit' || tx.type === 'credit') &&
      isSameMonth(tx.createdat),
  );
  const previousHealthCardsIncome = getMonthlyHealthCardsTotal(
    (tx) =>
      (tx.type === 'deposit' || tx.type === 'credit') &&
      isPreviousMonth(tx.createdat),
  );

  const currentHealthCardsExpense = getMonthlyHealthCardsTotal(
    (tx) =>
      (tx.type === 'debit' || tx.type === 'withdrawal') &&
      isSameMonth(tx.createdat),
  );
  const previousHealthCardsExpense = getMonthlyHealthCardsTotal(
    (tx) =>
      (tx.type === 'debit' || tx.type === 'withdrawal') &&
      isPreviousMonth(tx.createdat),
  );

  // Transactins Activity
  const [selectedTransActiviyAccountId, setSelectedTransActiviyAccountId] =
    useState('all');
  const filteredTransActiviyTransactions =
    selectedTransActiviyAccountId === 'all'
      ? transactions
      : transactions.filter(
          (tx) => tx.account_id === Number(selectedTransActiviyAccountId),
        );

  const latestTransactions = [...filteredTransActiviyTransactions]
    .sort((a, b) => new Date(b.createdat) - new Date(a.createdat))
    .slice(0, 5);
  /* ================= UI RENDERING ================= */
  return (
    <div className="w-full px-4 md:px-6 py-8 space-y-10">
      {/* Header */}
      <DashboardHeader
      // accounts={accounts}
      // selectedAccountId={selectedAccountId}
      // setSelectedAccountId={setSelectedAccountId}
      />

      {/* KPI Grid */}
      <section className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Key Financial Metrics</h2>
          <div className="filter flex">
            <TimeRangeFilterChips
              value={kpiTimeRange}
              onChange={setKpiTimeRange}
            />
            <span className="mr-2"></span>
            <AccountFilterDropdown
              accounts={accounts}
              selectedAccountId={selectedkpiAccountId}
              onChange={setSelectedKpiAccountId}
            />
            <span className="mr-2"></span>
            <button
              onClick={clearKpiFilters}
              title="Clear filters"
              className="p-2 rounded-lg border-border bg-card
                      text-text/60
                      hover:text-text
                      hover:bg-border/40
                      transition cursor-pointer"
            >
              <FiX size={16} />
            </button>
          </div>
        </div>

        <KpiGrid transactions={finalKpiTransactions} />
      </section>

      {/* Charts  */}
      <section className="grid grid-cols-1 gap-6">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Income & Expense Trends</h2>
          <div className="flex">
            <TimeRangeFilterChips
              value={kpiTimeRange}
              onChange={setKpiTimeRange}
            />
            <span className="mr-2"></span>
            <AccountFilterDropdown
              accounts={accounts}
              selectedAccountId={selectedLineChartAccountId}
              onChange={setSelectedLineChartAccountId}
            />
            <span className="mr-2"></span>
            <button
              onClick={clearKpiFilters}
              title="Clear filters"
              className="p-2 rounded-lg border-border bg-card
                      text-text/60
                      hover:text-text
                      hover:bg-border/40
                      transition cursor-pointer"
            >
              <FiX size={16} />
            </button>
          </div>
        </div>

        <CustomLineChart chartData={chartData} />
      </section>

      {/* Expense Breakdown & Pie Chart*/}
      <section className="grid grid-cols-3 gap-6">
        <div className="col-span-3 flex justify-between items-center">
          <h2 className="text-lg font-semibold">Income & Expense Breakdown</h2>
          <div className="flex">
            <TimeRangeFilterChips
              value={pieChartRange}
              onChange={setPieChartRange}
            />
            <span className="mr-2"></span>

            <AccountFilterDropdown
              accounts={accounts}
              selectedAccountId={selectedPieChartAccountId}
              onChange={setSelectedPieChartAccountId}
            />
            <span className="mr-2"></span>
            <button
              onClick={clearPieChartFilters}
              title="Clear filters"
              className="p-2 rounded-lg border-border bg-card
                      text-text/60
                      hover:text-text
                      hover:bg-border/40
                      transition cursor-pointer"
            >
              <FiX size={16} />
            </button>
          </div>
        </div>
        <IncomeExpenseBreakdown
          expenseCategoryPercentages={expenseCategoryPercentages}
          incomeCategoryPercentages={incomeCategoryPercentages}
        />
        <CustomPieChart
          data={expenseCategoryPieData}
          title={'Expense Categories'}
        />
        <CustomPieChart
          data={pieData}
          title={'Income, Expenses & Balance Summary'}
        />
      </section>

      {/* Health Cards */}
      <section>
        <div className="grid grid-cols-4 gap-6">
          <div className="col-span-4 flex justify-between items-center">
            <h2 className="text-lg font-semibold">
              Financial Health & Performance
            </h2>
            <div className="flex">
              <TimeRangeFilterChips
                value={healthCardsRange}
                onChange={setHealthCardsRange}
              />
              <span className="mr-2"></span>
              <AccountFilterDropdown
                accounts={accounts}
                selectedAccountId={selectedHealthCardsAccountId}
                onChange={setSelectedHealthCardsAccountId}
              />
              <span className="mr-2"></span>
              <button
                onClick={clearHealthCardFilters}
                title="Clear filters"
                className="p-2 rounded-lg border-border bg-card
                      text-text/60
                      hover:text-text
                      hover:bg-border/40
                      transition cursor-pointer"
              >
                <FiX size={16} />
              </button>
            </div>
          </div>
          <FinancialHealthScore
            totalIncome={totalHealthCardsIncome}
            totalExpense={totalHealthCardsExpense}
            currentIncome={currentHealthCardsIncome}
            currentExpense={currentHealthCardsExpense}
            previousIncome={previousHealthCardsIncome}
            previousExpense={previousHealthCardsExpense}
          />
          <MonthlyComparison
            currentIncome={currentHealthCardsIncome}
            previousIncome={previousHealthCardsIncome}
            currentExpense={currentHealthCardsExpense}
            previousExpense={previousHealthCardsExpense}
          />
          <BudgetHealth
            totalIncome={totalHealthCardsIncome}
            totalExpense={totalHealthCardsExpense}
          />
          <SavingsRate
            totalIncome={totalHealthCardsIncome}
            totalExpense={totalHealthCardsExpense}
          />
        </div>
      </section>

      {/* Transactions and Account */}
      <section className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <div className="flex justify-between">
            <h2 className="text-lg font-semibold mb-5">Recent Activity's</h2>
            <AccountFilterDropdown
              accounts={accounts}
              selectedAccountId={selectedTransActiviyAccountId}
              onChange={setSelectedTransActiviyAccountId}
            />
          </div>
          <LatestTransactions transactions={latestTransactions} />
        </div>
        <div className="col-span-1">
          <h2 className="text-lg font-semibold mb-5">Account Info's</h2>
          <AccountsList accounts={accounts} />
        </div>
      </section>
    </div>
  );
};

export default DashboardPage;
