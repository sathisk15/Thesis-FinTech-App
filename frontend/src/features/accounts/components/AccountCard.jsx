import { useState } from 'react';
import { FiEye, FiEyeOff, FiSend } from 'react-icons/fi';

const AccountCard = ({ account, setTransferFrom, setShowTransferModal }) => {
  const [showNumber, setShowNumber] = useState(false);

  const maskedNumber = '•••• ' + account.account_number?.slice(-4);

  const formatCurrency = (value, currency = 'EUR') =>
    new Intl.NumberFormat('en-IE', {
      style: 'currency',
      currency,
    }).format(value);

  const currency = formatCurrency(account.account_balance?.toFixed(2));

  return (
    <div
      className="group bg-card border border-border rounded-xl
                 p-5 flex gap-4
                 hover:shadow-md hover:border-border/80
                 transition-all duration-200"
    >
      {/* Avatar / Icon */}
      <div
        className="mt-1 w-12 h-12 rounded-xl
                   bg-primary/15 text-primary
                   flex items-center justify-center
                   font-semibold tracking-wide"
      >
        {account.account_name.slice(0, 2).toUpperCase()}
      </div>

      <div className="flex-1 space-y-2">
        {/* Name + Type | Transfer */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col">
            <p className="text-lg font-semibold tracking-tight text-text">
              {account.account_name}
            </p>
            <p className="text-sm text-text/60">
              {account.account_type} Account
            </p>
          </div>

          <button
            onClick={() => {
              setTransferFrom(account);
              setShowTransferModal(true);
            }}
            className="p-2 rounded-lg
                       text-primary/80
                       hover:text-primary
                       hover:bg-primary/10
                       transition cursor-pointer"
            title="Transfer Money"
          >
            <FiSend size={16} />
          </button>
        </div>

        {/* Account Number */}
        <div className="flex items-center justify-between">
          <p className="font-mono text-sm text-text/60 tracking-widest">
            AC {showNumber ? account.account_number.slice(-8) : maskedNumber}
          </p>

          <button
            onClick={() => setShowNumber((prev) => !prev)}
            className="p-1 rounded-md
                       text-text/50
                       hover:text-text
                       hover:bg-border/40
                       transition cursor-pointer"
          >
            {showNumber ? <FiEyeOff size={16} /> : <FiEye size={16} />}
          </button>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-text/50">
            Updated {new Date(account.updatedat).toLocaleDateString()}
          </p>

          <p
            className={`text-lg font-semibold tracking-tight ${
              account.account_balance > 0 ? 'text-green-500' : 'text-red-500'
            }`}
          >
            {currency.slice(0, 1) + ' ' + currency.slice(1)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AccountCard;
