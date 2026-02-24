import { useEffect } from 'react';
import { useState } from 'react';
import { useAccountStore } from '../../store/useAccountStore';
import AddAccount from './components/AddAccount';

const AccountsPage = () => {
  const { accounts, fetchAccounts, loading } = useAccountStore();

  useEffect(() => {
    fetchAccounts();
  }, []);

  const addAccount = useAccountStore((state) => state.addAccount);

  const [showModal, setShowModal] = useState(false);
  const [accountData, setAccountData] = useState({
    type: '',
    currency: 'PLN',
    initialBalance: 0,
  });

  return (
    <>
      <div className="w-full py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <p className="text-2xl 2xl:text-3xl font-semibold text-text/60">
            Accounts Information
          </p>

          <button
            onClick={() => setShowModal(true)}
            className="h-10 px-4 rounded-md bg-primary text-white flex items-center gap-2"
          >
            Add Account
          </button>
        </div>

        {/* Accounts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 2xl:grid-cols-4 gap-6">
          {loading && <p>Loading accounts...</p>}

          {accounts.map((account) => (
            <div
              key={account.id}
              className="bg-card border border-border rounded-lg p-4 flex gap-4"
            >
              <div className="w-12 h-12 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">
                {account.type.slice(0, 2).toUpperCase()}
              </div>

              <div className="flex-1 space-y-2">
                <p className="text-xl font-semibold text-text">
                  {account.type}
                </p>

                <p className="font-mono text-text/60 tracking-widest">
                  AC •••• {account.accountNumber.slice(-4)}
                </p>

                <p className="text-xs text-text/50">
                  Last updated:{' '}
                  {new Date(account.updatedAt).toLocaleDateString()}
                </p>

                <p className="text-lg font-medium text-text">
                  {account.currency} {account.balance.toFixed(2)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
      {showModal && (
        <AddAccount
          accountData={accountData}
          setAccountData={setAccountData}
          addAccount={addAccount}
          setShowModal={setShowModal}
        />
      )}
    </>
  );
};

export default AccountsPage;
