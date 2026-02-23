// src/components/Navbar.tsx
import { RiLogoutBoxLine } from 'react-icons/ri';

const Navbar = () => {
  return (
    <header className="w-full bg-card border-b border-border px-6 py-4 flex items-center justify-between">
      <span className="text-xl font-bold text-text">FinTechApp Demo</span>

      <div className="flex items-center gap-4">
        <div className="text-right hidden md:block">
          <p className="text-sm font-medium text-text">Sathiskumar</p>
          <p className="text-xs text-text/60">test12@gmail.com</p>
        </div>

        <img
          src="https://i.pravatar.cc/100"
          alt="avatar"
          className="w-10 h-10 rounded-full cursor-pointer"
        />

        <RiLogoutBoxLine className="text-2xl cursor-pointer text-text/70" />
      </div>
    </header>
  );
};

export default Navbar;
