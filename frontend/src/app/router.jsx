import { createBrowserRouter, Navigate } from 'react-router-dom';

import DashboardPage from '../features/dashboard';
import TransactionsPage from '../features/transations';
import SettingsPage from '../features/settings';
import AppLayout from '../shared/layouts/AppLayout';
import AccountsPage from '../features/accounts';
import SignInPage from '../features/auth/SignInPage';
import SignUpPage from '../features/auth/SignUpPage';
import ProtectedRoute from '../shared/routes/ProtectedRoute';
import PayPage from '../features/pay';

export const router = createBrowserRouter([
  {
    element: <ProtectedRoute />,
    children: [
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
            path: 'transactions',
            element: <TransactionsPage />,
          },
          {
            path: 'pay',
            element: <PayPage />,
          },
          {
            path: 'settings',
            element: <SettingsPage />,
          },
        ],
      },
    ],
  },
  {
    path: '/login',
    element: <SignInPage />,
  },
  {
    path: '/register',
    element: <SignUpPage />,
  },
]);
