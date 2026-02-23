import { createBrowserRouter, Navigate } from 'react-router-dom';

import DashboardPage from '../features/dashboard';
import LoginPage from '../features/login';
import TransferPage from '../features/transfer';
import HistoryPage from '../features/history';
import SettingsPage from '../features/settings';
import AppLayout from '../shared/layouts/AppLayout';

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
        path: 'transfer',
        element: <TransferPage />,
      },
      {
        path: 'history',
        element: <HistoryPage />,
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
