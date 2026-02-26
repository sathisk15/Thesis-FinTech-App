import { useEffect } from 'react';
import { useState } from 'react';
import { useAccountStore } from '../../store/useAccountStore';
import AddAccount from './components/AddAccount';
import AccountCard from './components/AccountCard';
import DepositMoney from './components/DepositMoney';
import Transfer from './components/Transfer';

const AccountsPage = () => {
  const { accounts, fetchAccounts, loading } = useAccountStore();

  useEffect(() => {
    fetchAccounts();
  }, []);

  const addAccount = useAccountStore((state) => state.addAccount);

  const [showModal, setShowModal] = useState(false);
  const [accountData, setAccountData] = useState({
    account_name: '',
    currency: 'EUR',
    initialBalance: 100,
  });

  const depositMoney = useAccountStore((state) => state.depositMoney);

  const [showDepositModal, setShowDepositModal] = useState(false);
  const [depositData, setDepositData] = useState({
    accountId: '',
    amount: 0,
    description: '',
  });

  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferFrom, setTransferFrom] = useState(null);

  const [transferData, setTransferData] = useState({
    toAccountId: '',
    amount: '',
    description: '',
  });
  return (
    <>
      <div className="w-full py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <p className="text-2xl 2xl:text-3xl font-semibold text-text/60">
            Accounts Information
          </p>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowModal(true)}
              className="h-10 px-4 rounded-md bg-primary text-white cursor-pointer"
            >
              Create Account
            </button>
            <button
              onClick={() => setShowDepositModal(true)}
              className="h-10 px-4 rounded-md border border-border text-text cursor-pointer"
            >
              Deposit
            </button>
          </div>
        </div>

        {/* Accounts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 2xl:grid-cols-4 gap-6">
          {loading && <p>Loading accounts...</p>}
          {console.log(accounts)}
          {accounts.map((account) => (
            <AccountCard
              key={account.id}
              account={account}
              setTransferFrom={setTransferFrom}
              setShowTransferModal={setShowTransferModal}
            />
          ))}
        </div>
      </div>
      {showModal && (
        <AddAccount
          accountData={accountData}
          setAccountData={setAccountData}
          addAccount={addAccount}
          setShowModal={setShowModal}
          accounts={accounts}
        />
      )}
      {showDepositModal && (
        <DepositMoney
          accounts={accounts}
          depositData={depositData}
          setDepositData={setDepositData}
          depositMoney={depositMoney}
          setShowDepositModal={setShowDepositModal}
        />
      )}
      {showTransferModal && transferFrom && (
        <Transfer
          accounts={accounts}
          transferFrom={transferFrom}
          transferData={transferData}
          setTransferData={setTransferData}
          setShowTransferModal={setShowTransferModal}
        />
      )}
    </>
  );
};

export default AccountsPage;
