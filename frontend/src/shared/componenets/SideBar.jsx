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
    <aside className="w-64 bg-card border-r border-border hidden md:flex flex-col">
      <div className="p-6">
        <div className="w-full h-10 flex items-center justify-center ">
          <span className="text-white text-3xl  bg-primary rounded-xl p-2">
            <GiCoins />
          </span>
        </div>
      </div>

      <nav className="flex flex-col gap-2 px-4 justify-center">
        {navItems.map(({ name, path, icon: Icon }) => (
          <NavLink
            key={name}
            to={path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                isActive
                  ? 'bg-primary text-white'
                  : 'text-text hover:bg-primary/10'
              }`
            }
          >
            <Icon className="text-xl" />
            {name}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
