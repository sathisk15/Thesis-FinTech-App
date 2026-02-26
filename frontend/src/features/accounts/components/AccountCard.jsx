import { useState } from 'react';
import { FiEye, FiEyeOff, FiSend } from 'react-icons/fi';
import {} from 'react-icons/fi';

const AccountCard = ({ account, setTransferFrom, setShowTransferModal }) => {
  const [showNumber, setShowNumber] = useState(false);

  const maskedNumber = '••••' + account.account_number?.slice(-4);

  const formatCurrency = (value, currency = 'EUR') =>
    new Intl.NumberFormat('en-IE', {
      style: 'currency',
      currency,
    }).format(value);

  const currency = formatCurrency(account.account_balance?.toFixed(2));

  return (
    <div className="bg-card border border-border rounded-lg p-4 flex gap-4">
      {/* Icon */}
      <div className="mt-1 w-12 h-12 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">
        {account.account_type?.slice(0, 2).toUpperCase()}
      </div>

      <div className="flex-1 space-y-2">
        {/* Name + Type | Transfer Icon */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <p className="text-xl font-semibold text-text">
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
            className="text-primary hover:opacity-80 cursor-pointer"
            title="Transfer Money"
          >
            <FiSend size={18} />
          </button>
        </div>

        {/* Account Number + Eye */}
        <div className="flex items-center justify-between">
          <p className="font-mono text-text/60 tracking-widest">
            AC {showNumber ? account.account_number.slice(-8) : maskedNumber}
          </p>

          <button
            onClick={() => setShowNumber((prev) => !prev)}
            className="text-text/60 hover:text-text cursor-pointer"
          >
            {showNumber ? <FiEyeOff size={18} /> : <FiEye size={18} />}
          </button>
        </div>

        {/* Last Updated */}
        <p className="text-xs text-text/50">
          Last updated: {new Date(account.updatedat).toLocaleDateString()}
        </p>

        {/* Balance */}
        <p
          className={`text-lg font-medium ${
            account.account_balance > 0 ? 'text-green-500' : 'text-red-500'
          }`}
        >
          {currency.slice(0, 1) + ' ' + currency.slice(1)}
        </p>
      </div>
    </div>
  );
};

export default AccountCard;
