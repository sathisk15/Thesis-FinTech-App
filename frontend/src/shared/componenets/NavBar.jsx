import { RiLogoutBoxLine } from 'react-icons/ri';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { FiUser } from 'react-icons/fi';
import avatar from '../../assets/user-avatar.png';
const Navbar = () => {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header
      className="w-full flex items-center justify-between
                 px-6 py-4
                 bg-background/80 backdrop-blur
                 border-b border-border
                 shadow-sm"
    >
      {/* Title */}
      <span className="text-lg font-semibold tracking-tight text-text">
        Expense Tracker
      </span>

      {/* Right Section */}
      <div className="flex items-center gap-4">
        {/* User Info */}
        <div className="text-right hidden md:block leading-tight">
          <p className="text-sm font-medium text-text">
            {user?.firstname} {user?.lastname ?? ''}
          </p>
          <p className="text-xs text-text/60">{user?.email}</p>
        </div>

        {/* Avatar */}
        <div className="relative group cursor-pointer">
          <div
            className="w-10 h-10 rounded-full
                       bg-gradient-to-br from-primary/30 to-primary/5
                       p-[2px]"
          >
            <img
              src={avatar}
              alt="avatar"
              className="w-full h-full rounded-full bg-background"
            />
            {/* <FiUser className="w-full h-full rounded-full bg-background" /> */}
          </div>

          {/* Online Status */}
          <span
            className="absolute bottom-0 right-0
                       w-2.5 h-2.5 rounded-full
                       bg-green-500
                       ring-2 ring-background"
          />
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          title="Logout"
          className="p-2 rounded-lg
                     text-text/60
                     hover:text-red-500
                     hover:bg-red-500/10
                     transition cursor-pointer"
        >
          <RiLogoutBoxLine className="text-lg" />
        </button>
      </div>
    </header>
  );
};

export default Navbar;
