import { NavLink } from 'react-router-dom';
import {
  RiDashboardLine,
  RiExchangeFundsLine,
  RiBankLine,
  RiSendPlaneLine,
  RiSettings3Line,
  RiWallet3Line,
} from 'react-icons/ri';
import { GiCoins } from 'react-icons/gi';

const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: RiDashboardLine },
  { name: 'Accounts', path: '/account', icon: RiBankLine },
  { name: 'Transactions', path: '/transactions', icon: RiExchangeFundsLine },
  { name: 'Transfer', path: '/transfer', icon: RiSendPlaneLine },
  { name: 'Pay', path: '/pay', icon: RiWallet3Line },
  { name: 'Settings', path: '/settings', icon: RiSettings3Line },
];

const Sidebar = () => {
  return (
    <aside
      className="w-64 hidden md:flex flex-col
                      bg-background/80 backdrop-blur
                      border-r border-border
                      shadow-sm"
    >
      {/* Logo / Brand */}
      <div className="px-6 py-6">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl bg-primary/15
                          flex items-center justify-center
                          text-primary text-xl"
          >
            <GiCoins />
          </div>
          <span className="text-lg font-semibold tracking-tight text-text">
            E<span className="text-primary">-</span>Wallet
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1 px-4">
        {navItems.map(({ name, path, icon: Icon }) => (
          <NavLink
            key={name}
            to={path}
            className={({ isActive }) =>
              `group relative flex items-center gap-3
               px-4 py-2.5 rounded-lg
               text-sm font-medium
               transition-all duration-200
               ${
                 isActive
                   ? 'bg-primary/10 text-primary'
                   : 'text-text/70 hover:text-primary hover:bg-primary/5'
               }`
            }
          >
            {({ isActive }) => (
              <>
                {/* Active indicator */}
                <span
                  className={`absolute left-0 top-1/2 -translate-y-1/2
                              h-5 w-1 rounded-full bg-primary
                              transition-opacity duration-200
                              ${isActive ? 'opacity-100' : 'opacity-0'}`}
                />

                {/* Icon */}
                <Icon className="text-lg transition-transform group-hover:translate-x-0.5" />

                {/* Label */}
                <span className="tracking-tight">{name}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
