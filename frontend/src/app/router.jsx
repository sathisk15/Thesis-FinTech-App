import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';

// P4/P5: React.lazy — each route is a separate chunk loaded on demand.
// Static imports in V1 bundled all pages into one JS file, blocking the
// initial parse. Lazy imports mean only the current page's code is evaluated.
const DashboardPage   = lazy(() => import('../features/dashboard'));
const TransactionsPage = lazy(() => import('../features/transations'));
const SettingsPage    = lazy(() => import('../features/settings'));
const AccountsPage    = lazy(() => import('../features/accounts'));
const SignInPage      = lazy(() => import('../features/auth/SignInPage'));
const SignUpPage      = lazy(() => import('../features/auth/SignUpPage'));
const PayPage         = lazy(() => import('../features/pay'));
const TransferPage    = lazy(() => import('../features/transfer/TransferPage'));

import AppLayout from '../shared/layouts/AppLayout';
import ProtectedRoute from '../shared/routes/ProtectedRoute';

const fallback = (
  <div className="flex h-screen items-center justify-center text-text/40 text-sm">
    Loading…
  </div>
);

export const router = createBrowserRouter([
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: '/',
        element: <AppLayout />,
        children: [
          { index: true, element: <Navigate to="/dashboard" /> },
          { path: 'dashboard',    element: <Suspense fallback={fallback}><DashboardPage /></Suspense> },
          { path: 'account',      element: <Suspense fallback={fallback}><AccountsPage /></Suspense> },
          { path: 'transactions', element: <Suspense fallback={fallback}><TransactionsPage /></Suspense> },
          { path: 'transfer',     element: <Suspense fallback={fallback}><TransferPage /></Suspense> },
          { path: 'pay',          element: <Suspense fallback={fallback}><PayPage /></Suspense> },
          { path: 'settings',     element: <Suspense fallback={fallback}><SettingsPage /></Suspense> },
        ],
      },
    ],
  },
  { path: '/login',    element: <Suspense fallback={fallback}><SignInPage /></Suspense> },
  { path: '/register', element: <Suspense fallback={fallback}><SignUpPage /></Suspense> },
]);
