import React from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import App from './App';
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';
import Recommendations from './pages/Recommendations';
import Login from './pages/Login';
import Register from './pages/Register';
import Onboarding from './pages/Onboarding';
import PublicProfile from './components/PublicProfile';

// Simple wrapper to guard protected routes
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" replace />;
  return children;
};

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />, // The Landing page
  },
  {
    path: '/career/:username',
    element: <PublicProfile />
  },
  {
    path: '/login',
    element: <Login />
  },
  {
    path: '/register',
    element: <Register />
  },
  {
    path: '/onboarding',
    element: <ProtectedRoute><Onboarding /></ProtectedRoute>
  },
  {
    path: '/dashboard',
    element: <ProtectedRoute><DashboardLayout /></ProtectedRoute>,
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: 'gaps',
        element: <div className="text-white">Gap Analysis Details (Coming Soon)</div>
      },
      {
        path: 'recommendations',
        element: <Recommendations />
      },
      {
        path: 'settings',
        element: <div className="text-white">Settings</div>
      }
    ]
  }
]);

export default function Router() {
  return <RouterProvider router={router} />;
}
