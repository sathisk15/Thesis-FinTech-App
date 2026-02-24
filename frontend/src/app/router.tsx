import { createBrowserRouter, Navigate } from 'react-router-dom';

import DashboardPage from '../features/dashboard';
import LoginPage from '../features/login';
import TransferPage from '../features/transfer';
import TransactionsPage from '../features/transations';
import SettingsPage from '../features/settings';
import AppLayout from '../shared/layouts/AppLayout';
import AccountsPage from '../features/Accounts';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" />,
      },
      {
        path: 'dashboard',
        element: <DashboardPage />,
      },
      {
        path: 'account',
        element: <AccountsPage />,
      },
      {
        path: 'transfer',
        element: <TransferPage />,
      },
      {
        path: 'transactions',
        element: <TransactionsPage />,
      },
      {
        path: 'settings',
        element: <SettingsPage />,
      },
    ],
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
]);
