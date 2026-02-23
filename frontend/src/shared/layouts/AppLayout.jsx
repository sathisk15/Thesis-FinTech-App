import { Outlet } from 'react-router-dom';
import Sidebar from '../componenets/SideBar';
import Navbar from '../componenets/NavBar';

const AppLayout = () => {
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
