import { BsArrowUpRight, BsArrowDownRight, BsGraphUp } from 'react-icons/bs';
import {
  GiExpense,
  GiPayMoney,
  GiReceiveMoney,
  GiWallet,
} from 'react-icons/gi';
import { MdTrendingUp, MdTrendingDown } from 'react-icons/md';
import { FaFire, FaChartPie, FaPiggyBank } from 'react-icons/fa';
import KpiCard from './KpiCard';

/**
 * KpiGrid
 *
 * Displays all KPI cards in a grid
 */

const formatCurrency = (value, currency = 'EUR') =>
  new Intl.NumberFormat('en-IE', {
    style: 'currency',
    currency,
  }).format(value);

function getTotalIncomeRaw(transactions) {
  let income = 0;
  for (const tx of transactions) {
    if (tx.type === 'credit') income += tx.amount;
  }
  return income;
}

function getTotalExpenseRaw(transactions) {
  let expense = 0;
  for (const tx of transactions) {
    if (tx.type === 'debit') expense += tx.amount;
  }
  return expense;
}

function getDateKey(dateStr) {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function getInitialTotalBalance(transactions) {
  const perAccount = {};

  for (const tx of transactions) {
    const { account_id, balance_after, createdat, id } = tx;
    const time = new Date(createdat).getTime();

    if (
      !perAccount[account_id] ||
      time < perAccount[account_id].time ||
      (time === perAccount[account_id].time && id < perAccount[account_id].id)
    ) {
      perAccount[account_id] = {
        time,
        id,
        balance: balance_after,
      };
    }
  }

  return Object.values(perAccount).reduce((sum, acc) => sum + acc.balance, 0);
}

function getTotalBalance(transactions) {
  const perAccount = {};

  for (const tx of transactions) {
    const { account_id, balance_after, createdat, id } = tx;
    const time = new Date(createdat).getTime();

    if (!perAccount[account_id]) {
      perAccount[account_id] = {
        earliestTime: time,
        earliestId: id,
        latestTime: time,
        latestId: id,
        initial: balance_after,
        final: balance_after,
      };
      continue;
    }

    // earliest
    if (
      time < perAccount[account_id].earliestTime ||
      (time === perAccount[account_id].earliestTime &&
        id < perAccount[account_id].earliestId)
    ) {
      perAccount[account_id].earliestTime = time;
      perAccount[account_id].earliestId = id;
      perAccount[account_id].initial = balance_after;
    }

    // latest
    if (
      time > perAccount[account_id].latestTime ||
      (time === perAccount[account_id].latestTime &&
        id > perAccount[account_id].latestId)
    ) {
      perAccount[account_id].latestTime = time;
      perAccount[account_id].latestId = id;
      perAccount[account_id].final = balance_after;
    }
  }

  let totalInitial = 0;
  let totalFinal = 0;

  for (const acc of Object.values(perAccount)) {
    totalInitial += acc.initial;
    totalFinal += acc.final;
  }

  return {
    value: formatCurrency(totalFinal),
    change:
      totalInitial === 0
        ? 0
        : ((totalFinal - totalInitial) / totalInitial) * 100,
  };
}

function getTotalIncome(transactions, initialTotalBalance) {
  let totalIncome = 0;

  for (const tx of transactions) {
    if (tx.type === 'credit') {
      totalIncome += tx.amount;
    }
  }

  const change =
    initialTotalBalance === 0 ? 0 : (totalIncome / initialTotalBalance) * 100;

  return {
    value: formatCurrency(totalIncome),
    change,
  };
}

function getTotalExpense(transactions, initialTotalBalance) {
  let totalExpense = 0;

  for (const tx of transactions) {
    if (tx.type === 'debit') {
      totalExpense += tx.amount;
    }
  }

  const change =
    initialTotalBalance === 0 ? 0 : (totalExpense / initialTotalBalance) * 100;

  return {
    value: formatCurrency(totalExpense),
    change,
  };
}

function getNetSavings(transactions) {
  const initial = getInitialTotalBalance(transactions);
  const income = getTotalIncomeRaw(transactions);
  const expense = getTotalExpenseRaw(transactions);

  const netSavings = income - expense;
  const change = initial === 0 ? 0 : (netSavings / initial) * 100;

  return {
    value: formatCurrency(netSavings),
    change,
  };
}

function getExpenseIncomeRatio(transactions) {
  const initial = getInitialTotalBalance(transactions);
  const income = getTotalIncomeRaw(transactions);
  const expense = getTotalExpenseRaw(transactions);

  const ratio = income === 0 ? 0 : (expense / income) * 100;
  const change = initial === 0 ? 0 : (ratio / initial) * 100;

  return {
    value: `${ratio.toFixed(1)}%`,
    change,
  };
}

function getCashFlow(transactions) {
  const initial = getInitialTotalBalance(transactions);
  const income = getTotalIncomeRaw(transactions);
  const expense = getTotalExpenseRaw(transactions);

  const cashFlow = income - expense;
  const change = initial === 0 ? 0 : (cashFlow / initial) * 100;

  return {
    value: formatCurrency(cashFlow),
    change,
  };
}

function getAvgDailySpend(transactions) {
  const initial = getInitialTotalBalance(transactions);
  const dailyExpenseMap = {};

  for (const tx of transactions) {
    if (tx.type !== 'debit') continue;

    const dayKey = getDateKey(tx.createdat);
    dailyExpenseMap[dayKey] = (dailyExpenseMap[dayKey] || 0) + tx.amount;
  }

  const days = Object.keys(dailyExpenseMap).length;
  const totalExpense = Object.values(dailyExpenseMap).reduce(
    (s, v) => s + v,
    0,
  );

  const averageDailySpend = days === 0 ? 0 : totalExpense / days;
  const change = initial === 0 ? 0 : (averageDailySpend / initial) * 100;

  return {
    value: formatCurrency(averageDailySpend),
    change,
  };
}

function getMonthlyBurnRate(transactions) {
  const initial = getInitialTotalBalance(transactions);
  const monthlyExpenseMap = {};

  for (const tx of transactions) {
    if (tx.type !== 'debit') continue;

    const d = new Date(tx.createdat);
    const key = `${d.getFullYear()}-${d.getMonth() + 1}`;

    monthlyExpenseMap[key] = (monthlyExpenseMap[key] || 0) + tx.amount;
  }

  const months = Object.keys(monthlyExpenseMap).length;
  const totalExpense = Object.values(monthlyExpenseMap).reduce(
    (s, v) => s + v,
    0,
  );

  const monthlyBurnRate = months === 0 ? 0 : totalExpense / months;
  const change = initial === 0 ? 0 : (monthlyBurnRate / initial) * 100;

  return {
    value: formatCurrency(monthlyBurnRate),
    change,
  };
}

function getAvgIncomeLast3Months(transactions) {
  const initial = getInitialTotalBalance(transactions);
  const monthlyIncomeMap = {};

  for (const tx of transactions) {
    if (tx.type !== 'credit') continue;

    const d = new Date(tx.createdat);
    const key = `${d.getFullYear()}-${d.getMonth() + 1}`;

    monthlyIncomeMap[key] = (monthlyIncomeMap[key] || 0) + tx.amount;
  }

  const sortedMonths = Object.keys(monthlyIncomeMap)
    .sort((a, b) => new Date(b + '-01') - new Date(a + '-01'))
    .slice(0, 3);

  const totalIncome = sortedMonths.reduce((s, m) => s + monthlyIncomeMap[m], 0);

  const avgIncome3M =
    sortedMonths.length === 0 ? 0 : totalIncome / sortedMonths.length;

  const change = initial === 0 ? 0 : (avgIncome3M / initial) * 100;

  return {
    value: formatCurrency(avgIncome3M),
    change,
  };
}

function getExpenseChange(transactions) {
  const initial = getInitialTotalBalance(transactions);

  let totalExpense = 0;
  for (const tx of transactions) {
    if (tx.type === 'debit') totalExpense += tx.amount;
  }

  return initial === 0 ? 0 : (totalExpense / initial) * 100;
}

function getTopSpendingCategory(transactions) {
  const categoryTotals = {};

  for (const tx of transactions) {
    if (tx.type !== 'debit') continue;

    const category = tx.category || 'Uncategorized';
    categoryTotals[category] = (categoryTotals[category] || 0) + tx.amount;
  }

  let topCategory = null;
  let maxAmount = 0;

  for (const [category, amount] of Object.entries(categoryTotals)) {
    if (amount > maxAmount) {
      maxAmount = amount;
      topCategory = { name: category, amount };
    }
  }

  return topCategory;
}

function getLargestExpense(transactions) {
  let largestExpense = null;

  for (const tx of transactions) {
    if (tx.type !== 'debit') continue;

    if (!largestExpense || tx.amount > largestExpense.amount) {
      largestExpense = tx;
    }
  }

  return largestExpense;
}

function getSavingsRate(transactions) {
  let income = 0;
  let expense = 0;

  for (const tx of transactions) {
    if (tx.type === 'credit') income += tx.amount;
    if (tx.type === 'debit') expense += tx.amount;
  }

  const netSavings = income - expense;
  const savingsRate = income === 0 ? 0 : (netSavings / income) * 100;

  return {
    value: `${savingsRate.toFixed(1)}%`,
    change: savingsRate, // semantic change indicator
  };
}

const KpiGrid = ({ transactions }) => {
  const initialTotalBalance = getInitialTotalBalance(transactions);

  const topSpendingCategory = getTopSpendingCategory(transactions);
  const largestExpense = getLargestExpense(transactions);
  const expenseChange = getExpenseChange(transactions);
  const kpis = [
    {
      label: 'Total Balance',
      ...getTotalBalance(transactions),
      icon: <GiWallet />,
    },
    {
      label: 'Total Income',
      ...getTotalIncome(transactions, initialTotalBalance),
      icon: <GiReceiveMoney />,
    },
    {
      label: 'Total Expense',
      ...getTotalExpense(transactions, initialTotalBalance),
      icon: <GiPayMoney />,
    },
    {
      label: 'Net Savings',
      ...getNetSavings(transactions),
      icon: <BsGraphUp />,
    },
    {
      label: 'Expense / Income',
      ...getExpenseIncomeRatio(transactions),
      icon: <FaChartPie />,
    },
    {
      label: 'Cash Flow',
      ...getCashFlow(transactions),
      icon: <BsArrowUpRight />,
    },
    {
      label: 'Avg Daily Spend',
      ...getAvgDailySpend(transactions),
      icon: <MdTrendingDown />,
    },
    {
      label: 'Burn Rate (Monthly)',
      ...getMonthlyBurnRate(transactions),
      icon: <FaFire />,
    },
    {
      label: 'Avg Income (3M)',
      ...getAvgIncomeLast3Months(transactions),
      icon: <MdTrendingUp />,
    },
    {
      label: 'Top Spending',
      value: topSpendingCategory ? topSpendingCategory.name : '—',
      change: expenseChange,
      icon: <GiExpense />,
    },
    {
      label: 'Largest Expense',
      value: largestExpense ? formatCurrency(largestExpense.amount) : '—',
      change: expenseChange,
      icon: <BsArrowDownRight />,
    },
    {
      label: 'Savings Rate',
      ...getSavingsRate(transactions),
      icon: <FaPiggyBank />,
    },
  ];

  return (
    <div className="grid grid-cols-4 gap-6">
      {kpis.map((item) => (
        <KpiCard
          key={item.label}
          label={item.label}
          value={item.value}
          change={item.change}
          icon={item.icon}
        />
      ))}
    </div>
  );
};

export default KpiGrid;
