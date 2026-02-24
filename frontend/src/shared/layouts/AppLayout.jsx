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
    <div className="flex h-screen bg-background text-text">
      <Sidebar />
      <div className="flex flex-col flex-1">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-3 bg-background">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
