import { Outlet } from 'react-router-dom';
import Sidebar from '../componenets/SideBar';
import Navbar from '../componenets/NavBar';
import { useEffect } from 'react';
import api from '../../api/axios';
import { useAuthStore } from '../../store/useAuthStore';

const AppLayout = () => {
  const token = useAuthStore((state) => state.token);
  const setUser = useAuthStore((state) => state.setUser);
  const logout = useAuthStore((state) => state.logout);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get('/auth/me');
        setUser(response.data.user);
      } catch (error) {
        logout();
      }
    };

    if (token) {
      fetchUser();
    }
  }, [token, setUser, logout]);

  return (
    <div className="flex h-screen bg-background text-text overflow-hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Area */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Top Navbar */}
        <Navbar />

        {/* Page Content */}
        <main
          className="flex-1 overflow-y-auto
                     bg-background
                     px-4 py-4 md:px-6 md:py-6"
        >
          {/* Content surface */}
          <div className="max-w-[1600px] mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
