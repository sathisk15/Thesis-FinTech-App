import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import DOMPurify from 'dompurify';
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
import { AccountFilterDropdown } from './components/AccountFilterDropdown';
import TimeRangeFilterChips from './components/TimeRangeFilterChips';
// CustomLineChart loaded statically — named exports (LabelFilterChips, RangeFilterChips)
// are rendered inline in the filter toolbar, so they must be available immediately.
import CustomLineChart, { LabelFilterChips, RangeFilterChips } from './components/CustomLineChart';

// P8: CustomPieChart loaded dynamically — it only renders inside sections that
// are below the fold. Recharts (~200 kB) is deferred until the component mounts.
const CustomPieChart = lazy(() => import('./components/CustomPieChart'));
const chartFallback = <div className="h-96 flex items-center justify-center text-text/30 text-sm">Loading chart…</div>;

// P2: Pure helpers defined outside component — stable references, never recreated
function parseDate(dateString) {
  return new Date(dateString.replace(' ', 'T'));
}

function isInTimeRange(dateString, range) {
  if (range === 'all_time') return true;
  const txDate = parseDate(dateString);
  const now = new Date();
  if (range === 'this_month') {
    return txDate.getMonth() === now.getMonth() && txDate.getFullYear() === now.getFullYear();
  }
  if (range === 'last_month') {
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    return txDate.getMonth() === lastMonth.getMonth() && txDate.getFullYear() === lastMonth.getFullYear();
  }
  if (range === 'last_3_months') {
    return txDate >= new Date(now.getFullYear(), now.getMonth() - 3, 1);
  }
  if (range === 'last_6_months') {
    return txDate >= new Date(now.getFullYear(), now.getMonth() - 6, 1);
  }
  if (range === 'ytd') {
    return txDate >= new Date(now.getFullYear(), 0, 1);
  }
  return true;
}

function getChartData({ transactions, range, label }) {
  const now = new Date();
  const DAY_MS = 24 * 60 * 60 * 1000;
  const RANGE_DAYS = { '1m': 30, '3m': 90, '6m': 180, '1y': 365, '3y': 365 * 3, '6y': 365 * 6, all: 365 * 20 };
  const LABEL_DAYS = { '1d': 1, '3d': 3, '6d': 6, '1m': 30, '3m': 90, '6m': 180 };
  const orderedLabels = ['1d', '3d', '6d', '1m', '3m', '6m'];
  let effectiveLabel = label;
  if (range !== 'all') {
    while (RANGE_DAYS[range] / LABEL_DAYS[effectiveLabel] > 24) {
      effectiveLabel = orderedLabels[orderedLabels.indexOf(effectiveLabel) + 1] || '6m';
    }
  }
  const from = range === 'all' ? null : new Date(now.getTime() - RANGE_DAYS[range] * DAY_MS);
  const bucketMs = LABEL_DAYS[effectiveLabel] * DAY_MS;
  const grouped = {};
  transactions.forEach((tx) => {
    const date = new Date(tx.createdat);
    if (from && (date < from || date > now)) return;
    const bucketTime = Math.floor(date.getTime() / bucketMs) * bucketMs;
    const bucket = new Date(bucketTime);
    const key = bucket.toISOString();
    if (!grouped[key]) grouped[key] = { label: bucket.toLocaleDateString(), income: 0, expense: 0, balance: 0, savings: 0 };
    const amount = Number(tx.amount);
    if (tx.type === 'credit' || tx.type === 'deposit') grouped[key].income += amount;
    else grouped[key].expense += amount;
    grouped[key].balance = grouped[key].income - grouped[key].expense;
  });
  let runningSavings = 0;
  return Object.keys(grouped).sort().map((key) => {
    runningSavings += grouped[key].balance;
    return { ...grouped[key], savings: runningSavings };
  });
}

const DashboardPage = () => {
  const accounts = useAccountStore((state) => state.accounts);
  const transactions = useTransactionStore((state) => state.transactions);
  const fetchAccounts = useAccountStore((state) => state.fetchAccounts);
  const fetchTransactions = useTransactionStore((state) => state.fetchTransactions);

  useEffect(() => {
    fetchAccounts();
    fetchTransactions();
  }, [fetchAccounts, fetchTransactions]);

  // ── KPI ──────────────────────────────────────────────────────────────────────
  const [selectedkpiAccountId, setSelectedKpiAccountId] = useState('all');
  const [kpiTimeRange, setKpiTimeRange] = useState('all_time');

  // P3: useCallback — stable handler reference; child memo skips re-render
  const clearKpiFilters = useCallback(() => {
    setSelectedKpiAccountId('all');
    setKpiTimeRange('all_time');
  }, []);

  // P2: useMemo — only recomputes when transactions, account filter or time range change
  const finalKpiTransactions = useMemo(
    () =>
      transactions.filter((tx) => {
        const matchesAccount = selectedkpiAccountId === 'all' ? true : tx.account_id === Number(selectedkpiAccountId);
        return matchesAccount && isInTimeRange(tx.createdat, kpiTimeRange);
      }),
    [transactions, selectedkpiAccountId, kpiTimeRange],
  );

  // ── Line Chart ────────────────────────────────────────────────────────────────
  const [selectedLineChartAccountId, setSelectedLineChartAccountId] = useState('all');
  const [selectedRange, setSelectedRange] = useState('3m');
  const [selectedLabel, setSelectedLabel] = useState('1d');

  const clearLineChartFilters = useCallback(() => {
    setSelectedLineChartAccountId('all');
    setSelectedRange('3m');
    setSelectedLabel('1d');
  }, []);

  const filteredLineChartTransactions = useMemo(
    () =>
      selectedLineChartAccountId === 'all'
        ? transactions
        : transactions.filter((tx) => tx.account_id === Number(selectedLineChartAccountId)),
    [transactions, selectedLineChartAccountId],
  );

  const chartData = useMemo(
    () => getChartData({ transactions: filteredLineChartTransactions, range: selectedRange, label: selectedLabel }),
    [filteredLineChartTransactions, selectedRange, selectedLabel],
  );

  // ── Breakdown Pie Chart ───────────────────────────────────────────────────────
  const [selectedPieChartAccountId, setSelectedPieChartAccountId] = useState('all');
  const [pieChartRange, setPieChartRange] = useState('all_time');

  const clearPieChartFilters = useCallback(() => {
    setSelectedPieChartAccountId('all');
    setPieChartRange('all_time');
  }, []);

  const finalPieChartTransactions = useMemo(
    () =>
      transactions.filter((tx) => {
        const matchesAccount = selectedPieChartAccountId === 'all' ? true : tx.account_id === Number(selectedPieChartAccountId);
        return matchesAccount && isInTimeRange(tx.createdat, pieChartRange);
      }),
    [transactions, selectedPieChartAccountId, pieChartRange],
  );

  const {
    expenseCategoryPercentages,
    incomeCategoryPercentages,
    expenseCategoryPieData,
    pieData,
  } = useMemo(() => {
    const expenseByCategory = finalPieChartTransactions.reduce((acc, tx) => {
      if (!(tx.type === 'debit' || tx.type === 'withdrawal')) return acc;
      // S9: sanitize description used as chart category label
      const category = DOMPurify.sanitize(tx.description || 'Others');
      acc[category] = (acc[category] || 0) + Number(tx.amount);
      return acc;
    }, {});
    const totalExpenseAmount = Object.values(expenseByCategory).reduce((s, v) => s + v, 0);
    const expenseCategoryPercentages = Object.entries(expenseByCategory).map(([category, amount]) => ({
      category,
      percentage: totalExpenseAmount === 0 ? 0 : (amount / totalExpenseAmount) * 100,
    }));

    const incomeByCategory = finalPieChartTransactions.reduce((acc, tx) => {
      if (!(tx.type === 'credit' || tx.type === 'deposit')) return acc;
      const category = tx.category || 'Others';
      acc[category] = (acc[category] || 0) + Number(tx.amount);
      return acc;
    }, {});
    const totalIncomeAmount = Object.values(incomeByCategory).reduce((s, v) => s + v, 0);
    const incomeCategoryPercentages = Object.entries(incomeByCategory)
      .map(([category, amount]) => ({ category, percentage: totalIncomeAmount === 0 ? 0 : (amount / totalIncomeAmount) * 100 }))
      .sort((a, b) => b.percentage - a.percentage)
      .slice(0, 10);

    const sortedExpenseCategories = Object.entries(expenseByCategory).sort((a, b) => b[1] - a[1]);
    const topCategories = sortedExpenseCategories.slice(0, 5);
    const othersTotal = sortedExpenseCategories.slice(5).reduce((s, [, v]) => s + v, 0);
    const expenseCategoryPieData = [
      ...topCategories.map(([name, value]) => ({ name, value })),
      ...(othersTotal > 0 ? [{ name: 'Others', value: othersTotal }] : []),
    ];

    const totalPieChartIncome = finalPieChartTransactions.filter((tx) => tx.type === 'deposit' || tx.type === 'credit').reduce((s, tx) => s + Number(tx.amount), 0);
    const totalPieCharExpense = finalPieChartTransactions.filter((tx) => tx.type === 'debit' || tx.type === 'withdrawal').reduce((s, tx) => s + Number(tx.amount), 0);
    const totalPieChartBalance = accounts.reduce((s, acc) => s + Number(acc.account_balance || 0), 0);
    const pieData = [
      { name: 'Income', value: totalPieChartIncome },
      { name: 'Expense', value: totalPieCharExpense },
      { name: 'Balance', value: totalPieChartBalance },
    ];

    return { expenseCategoryPercentages, incomeCategoryPercentages, expenseCategoryPieData, pieData };
  }, [finalPieChartTransactions, accounts]);

  // ── Health Cards ──────────────────────────────────────────────────────────────
  const [selectedHealthCardsAccountId, setSelectedHealthCardsAccountId] = useState('all');
  const [healthCardsRange, setHealthCardsRange] = useState('all_time');

  const clearHealthCardFilters = useCallback(() => {
    setSelectedHealthCardsAccountId('all');
    setHealthCardsRange('all_time');
  }, []);

  const finalHealthCardTransactions = useMemo(
    () =>
      transactions.filter((tx) => {
        const matchesAccount = selectedHealthCardsAccountId === 'all' ? true : tx.account_id === Number(selectedHealthCardsAccountId);
        return matchesAccount && isInTimeRange(tx.createdat, healthCardsRange);
      }),
    [transactions, selectedHealthCardsAccountId, healthCardsRange],
  );

  const {
    totalHealthCardsIncome,
    totalHealthCardsExpense,
    currentHealthCardsIncome,
    previousHealthCardsIncome,
    currentHealthCardsExpense,
    previousHealthCardsExpense,
  } = useMemo(() => {
    const now = new Date();
    const isSameMonth = (d) => { const dt = new Date(d); return dt.getMonth() === now.getMonth() && dt.getFullYear() === now.getFullYear(); };
    const isPrevMonth = (d) => { const dt = new Date(d); const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1); return dt.getMonth() === prev.getMonth() && dt.getFullYear() === prev.getFullYear(); };
    const sum = (txs, filterFn) => txs.filter(filterFn).reduce((s, tx) => s + Number(tx.amount), 0);
    return {
      totalHealthCardsIncome: sum(finalHealthCardTransactions, (tx) => tx.type === 'deposit' || tx.type === 'credit'),
      totalHealthCardsExpense: sum(finalHealthCardTransactions, (tx) => tx.type === 'debit' || tx.type === 'withdrawal'),
      currentHealthCardsIncome: sum(finalHealthCardTransactions, (tx) => (tx.type === 'deposit' || tx.type === 'credit') && isSameMonth(tx.createdat)),
      previousHealthCardsIncome: sum(finalHealthCardTransactions, (tx) => (tx.type === 'deposit' || tx.type === 'credit') && isPrevMonth(tx.createdat)),
      currentHealthCardsExpense: sum(finalHealthCardTransactions, (tx) => (tx.type === 'debit' || tx.type === 'withdrawal') && isSameMonth(tx.createdat)),
      previousHealthCardsExpense: sum(finalHealthCardTransactions, (tx) => (tx.type === 'debit' || tx.type === 'withdrawal') && isPrevMonth(tx.createdat)),
    };
  }, [finalHealthCardTransactions]);

  // ── Activity ──────────────────────────────────────────────────────────────────
  const [selectedTransActiviyAccountId, setSelectedTransActiviyAccountId] = useState('all');

  const latestTransactions = useMemo(() => {
    const filtered = selectedTransActiviyAccountId === 'all'
      ? transactions
      : transactions.filter((tx) => tx.account_id === Number(selectedTransActiviyAccountId));
    return [...filtered]
      .sort((a, b) => new Date(b.createdat) - new Date(a.createdat))
      .slice(0, 5)
      // S9: sanitize description before passing to LatestTransactions for rendering
      .map((tx) => ({ ...tx, description: DOMPurify.sanitize(tx.description || '') }));
  }, [transactions, selectedTransActiviyAccountId]);

  /* ================= UI RENDERING ================= */
  return (
    <div className="w-full px-4 md:px-6 py-8 space-y-10">
      {/* Header */}
      <DashboardHeader />

      {/* KPI Grid */}
      <section data-testid="dashboard-kpi-section" className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Key Financial Metrics</h2>
          <div className="filter flex">
            <TimeRangeFilterChips value={kpiTimeRange} onChange={setKpiTimeRange} />
            <span className="mr-2"></span>
            <AccountFilterDropdown accounts={accounts} selectedAccountId={selectedkpiAccountId} onChange={setSelectedKpiAccountId} />
            <span className="mr-2"></span>
            <button onClick={clearKpiFilters} title="Clear filters" className="p-2 rounded-lg border-border bg-card text-text/60 hover:text-text hover:bg-border/40 transition cursor-pointer">
              <FiX size={16} />
            </button>
          </div>
        </div>
        <KpiGrid transactions={finalKpiTransactions} />
      </section>

      {/* Charts */}
      <section data-testid="dashboard-trends-section" className="grid grid-cols-1 gap-6">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Income & Expense Trends</h2>
          <div className="flex">
            <RangeFilterChips value={selectedRange} onChange={setSelectedRange} />
            <span className="mr-2"></span>
            <AccountFilterDropdown accounts={accounts} selectedAccountId={selectedLineChartAccountId} onChange={setSelectedLineChartAccountId} />
            <span className="mr-2"></span>
            <button onClick={clearLineChartFilters} title="Clear filters" className="p-2 rounded-lg border-border bg-card text-text/60 hover:text-text hover:bg-border/40 transition cursor-pointer">
              <FiX size={16} />
            </button>
          </div>
        </div>
        <CustomLineChart
          chartData={chartData}
          labelFilter={<LabelFilterChips value={selectedLabel} onChange={setSelectedLabel} />}
        />
      </section>

      {/* Expense Breakdown & Pie Chart */}
      <section data-testid="dashboard-breakdown-section" className="grid grid-cols-3 gap-6">
        <div className="col-span-3 flex justify-between items-center">
          <h2 className="text-lg font-semibold">Income & Expense Breakdown</h2>
          <div className="flex">
            <TimeRangeFilterChips value={pieChartRange} onChange={setPieChartRange} />
            <span className="mr-2"></span>
            <AccountFilterDropdown accounts={accounts} selectedAccountId={selectedPieChartAccountId} onChange={setSelectedPieChartAccountId} />
            <span className="mr-2"></span>
            <button onClick={clearPieChartFilters} title="Clear filters" className="p-2 rounded-lg border-border bg-card text-text/60 hover:text-text hover:bg-border/40 transition cursor-pointer">
              <FiX size={16} />
            </button>
          </div>
        </div>
        <IncomeExpenseBreakdown expenseCategoryPercentages={expenseCategoryPercentages} incomeCategoryPercentages={incomeCategoryPercentages} />
        <Suspense fallback={chartFallback}><CustomPieChart data={expenseCategoryPieData} title={'Expense Categories'} /></Suspense>
        <Suspense fallback={chartFallback}><CustomPieChart data={pieData} title={'Income, Expenses & Balance Summary'} /></Suspense>
      </section>

      {/* Health Cards */}
      <section data-testid="dashboard-health-section">
        <div className="grid grid-cols-4 gap-6">
          <div className="col-span-4 flex justify-between items-center">
            <h2 className="text-lg font-semibold">Financial Health & Performance</h2>
            <div className="flex">
              <TimeRangeFilterChips value={healthCardsRange} onChange={setHealthCardsRange} />
              <span className="mr-2"></span>
              <AccountFilterDropdown accounts={accounts} selectedAccountId={selectedHealthCardsAccountId} onChange={setSelectedHealthCardsAccountId} />
              <span className="mr-2"></span>
              <button onClick={clearHealthCardFilters} title="Clear filters" className="p-2 rounded-lg border-border bg-card text-text/60 hover:text-text hover:bg-border/40 transition cursor-pointer">
                <FiX size={16} />
              </button>
            </div>
          </div>
          <FinancialHealthScore totalIncome={totalHealthCardsIncome} totalExpense={totalHealthCardsExpense} currentIncome={currentHealthCardsIncome} currentExpense={currentHealthCardsExpense} previousIncome={previousHealthCardsIncome} previousExpense={previousHealthCardsExpense} />
          <MonthlyComparison currentIncome={currentHealthCardsIncome} previousIncome={previousHealthCardsIncome} currentExpense={currentHealthCardsExpense} previousExpense={previousHealthCardsExpense} />
          <BudgetHealth totalIncome={totalHealthCardsIncome} totalExpense={totalHealthCardsExpense} />
          <SavingsRate totalIncome={totalHealthCardsIncome} totalExpense={totalHealthCardsExpense} />
        </div>
      </section>

      {/* Transactions and Account */}
      <section className="grid grid-cols-3 gap-6">
        <div data-testid="dashboard-activity-section" className="col-span-2">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold mb-5">Recent Activity's</h2>
            <AccountFilterDropdown accounts={accounts} selectedAccountId={selectedTransActiviyAccountId} onChange={setSelectedTransActiviyAccountId} />
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
