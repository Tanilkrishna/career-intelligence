import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, Navigate } from 'react-router-dom';
import { useToast } from '../components/ToastProvider';
import { LayoutDashboard, Target, Briefcase, Settings, LogOut, Menu, X } from 'lucide-react';
import MaintenanceBanner from '../components/MaintenanceBanner';
import apiClient from '../services/api/client';

const DashboardLayout = () => {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [serviceStatus, setServiceStatus] = useState({ type: 'info', message: '' });
  const toast = useToast();

  useEffect(() => {
    const checkHealth = async () => {
      try {
        await apiClient.get('/health');
        setServiceStatus({ type: 'info', message: '' }); // Clear message if OK
      } catch (err) {
        if (err.message.includes('buffering timed out') || !err.response) {
          setServiceStatus({ 
            type: 'warning', 
            message: 'We’re warming things up—analysis may take a bit longer today.' 
          });
        }
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { icon: LayoutDashboard, label: 'Overview', path: '/dashboard' },
    { icon: Target, label: 'Gap Analysis', path: '/dashboard/gaps' },
    { icon: Briefcase, label: 'Recommendations', path: '/dashboard/recommendations' },
    { icon: Settings, label: 'Settings', path: '/dashboard/settings' },
  ];

  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  if (user && !user.targetRole) {
    return <Navigate to="/onboarding" replace />;
  }

  const handleLogout = async () => {
    try {
      const apiClient = (await import('../services/api/client')).default;
      await apiClient.post('/auth/logout');
    } catch (err) {
      console.error('Logout API failed:', err);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login?logout=1';
    }
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="flex h-screen bg-gray-900 text-white font-sans overflow-hidden">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-gray-800 border-r border-gray-700 flex flex-col transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:inset-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
            CareerIntel
          </h1>
          <button onClick={toggleSidebar} className="lg:hidden text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>
        
        <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsSidebarOpen(false)}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                location.pathname === item.path 
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' 
                  : 'text-gray-400 hover:bg-gray-700/50 hover:text-gray-200'
              }`}
            >
              <item.icon size={20} />
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-700">
          <button 
            onClick={handleLogout}
            className="flex items-center space-x-3 text-gray-400 hover:text-red-400 w-full px-4 py-2 transition-colors"
          >
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <MaintenanceBanner type={serviceStatus.type} message={serviceStatus.message} />
        {/* Topbar */}
        <header className="h-16 bg-gray-800 border-b border-gray-700 flex items-center justify-between px-4 lg:px-8 shrink-0">
          <div className="flex items-center space-x-4">
            <button 
              onClick={toggleSidebar}
              className="lg:hidden p-2 text-gray-400 hover:bg-gray-700 rounded-lg"
            >
              <Menu size={24} />
            </button>
            <h2 className="text-lg lg:text-xl font-semibold truncate">
              {navItems.find(i => i.path === location.pathname)?.label || 'Dashboard'}
            </h2>
          </div>
          <div className="flex items-center space-x-4">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-gray-200">{user?.email?.split('@')?.[0] || 'User'}</p>
              <p className="text-xs text-gray-400 capitalize">{user?.targetRole?.replace('-', ' ') || 'Developer'}</p>
            </div>
            <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-sm font-bold shadow-lg border border-white/10">
              {user?.email?.substring(0, 2).toUpperCase() || 'UI'}
            </div>
          </div>
        </header>

        {/* Dynamic Outlet */}
        <div className="flex-1 overflow-auto p-4 lg:p-8 relative">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
