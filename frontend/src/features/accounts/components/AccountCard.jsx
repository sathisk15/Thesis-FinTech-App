import { useState } from 'react';
import { FiEye, FiEyeOff, FiSend } from 'react-icons/fi';
import {} from 'react-icons/fi';

const AccountCard = ({ account, setTransferFrom, setShowTransferModal }) => {
  const [showNumber, setShowNumber] = useState(false);

  const maskedNumber = '••••' + account.account_number?.slice(-4);

  return (
    <div className="bg-card border border-border rounded-lg p-4 flex gap-4">
      <div className="w-12 h-12 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">
        {account.account_type?.slice(0, 2).toUpperCase()}
      </div>

      <div className="flex-1 space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xl font-semibold text-text">
            {account.account_type} Account
          </p>

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

        <p className="text-xs text-text/50">
          Last updated: {new Date(account.updatedat).toLocaleDateString()}
        </p>

        <p className="text-lg font-medium text-text">
          € {account.currency} {account.account_balance?.toFixed(2)}
        </p>
      </div>
    </div>
  );
};

export default AccountCard;
