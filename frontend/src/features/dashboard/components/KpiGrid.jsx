import React from 'react';
import { BsCashCoin, BsCurrencyDollar } from 'react-icons/bs';
import { GiExpense } from 'react-icons/gi';
import KpiCard from './KpiCard';

/**
 * KpiGrid
 *
 * Displays all KPI cards in a grid
 */

const KpiGrid = ({
  totalBalance,
  totalIncome,
  totalExpense,
  netSavings,
  expenseIncomeRatio,
  cashFlow,
  averageDailySpend,
  monthlyBurnRate,
  avgIncome3M,
  avgExpense3M,
  topSpendingCategory,
  largestExpense,
  balanceChange,
  incomeChange,
  expenseChange,
  netSavingsChange,
  expenseIncomeRatioChange,
  cashFlowChange,
  burnRateChange,
  formatCurrency,
}) => {
  const kpis = [
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
    {
      label: 'Net Savings',
      value: formatCurrency(netSavings),
      change: netSavingsChange,
      icon: <BsCashCoin />,
    },
    {
      label: 'Expense / Income',
      value: `${expenseIncomeRatio.toFixed(1)}%`,
      change: expenseIncomeRatioChange,
      icon: <GiExpense />,
    },
    {
      label: 'Cash Flow',
      value: formatCurrency(cashFlow),
      change: cashFlowChange,
      icon: <BsCurrencyDollar />,
    },
    {
      label: 'Avg Daily Spend',
      value: formatCurrency(averageDailySpend),
      change: expenseChange,
      icon: <GiExpense />,
    },
    {
      label: 'Burn Rate (Monthly)',
      value: formatCurrency(monthlyBurnRate),
      change: burnRateChange,
      icon: <GiExpense />,
    },
    {
      label: 'Avg Income (3M)',
      value: formatCurrency(avgIncome3M),
      change: incomeChange,
      icon: <BsCashCoin />,
    },
    {
      label: 'Avg Expense (3M)',
      value: formatCurrency(avgExpense3M),
      change: expenseChange,
      icon: <GiExpense />,
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
      icon: <GiExpense />,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
