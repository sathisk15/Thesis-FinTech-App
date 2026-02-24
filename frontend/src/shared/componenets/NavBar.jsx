import { RiLogoutBoxLine } from 'react-icons/ri';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';

const Navbar = () => {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="w-full bg-card border-b border-border px-6 py-4 flex items-center justify-between">
      <span className="text-xl font-bold text-text">Banking App</span>

      <div className="flex items-center gap-4">
        <div className="text-right hidden md:block">
          <p className="text-sm font-medium text-text">
            {user?.firstname + ' ' + (user?.lastname ?? '')}
          </p>
          <p className="text-xs text-text/60">{user?.email}</p>
        </div>

        <img
          src="https://i.pravatar.cc/100"
          alt="avatar"
          className="w-10 h-10 rounded-full cursor-pointer"
        />

        <RiLogoutBoxLine
          className="text-2xl cursor-pointer text-text/70"
          onClick={handleLogout}
        />
      </div>
    </header>
  );
};

export default Navbar;
