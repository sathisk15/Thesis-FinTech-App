import { useEffect, useState } from 'react';
import { useAccountStore } from '../../store/useAccountStore';
import AddAccount from './components/AddAccount';
import AccountCard from './components/AccountCard';
import DepositMoney from './components/DepositMoney';
import Transfer from './components/Transfer';
import Pay from './components/Pay';

const AccountsPage = () => {
  const { accounts, fetchAccounts, loading } = useAccountStore();

  useEffect(() => {
    fetchAccounts();
  }, []);

  const addAccount = useAccountStore((state) => state.addAccount);
  const depositMoney = useAccountStore((state) => state.depositMoney);

  const [showModal, setShowModal] = useState(false);
  const [accountData, setAccountData] = useState({
    account_type: '',
    currency: 'EUR',
    initialBalance: 100,
    account_name: '',
    account_number: '',
  });

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

  const [showPayModal, setShowPayModal] = useState(false);
  const [payForm, setPayForm] = useState({
    fromAccountId: '',
    amount: '',
    description: '',
    recipientName: '',
    externalAccountNumber: '',
    externalBankName: '',
  });

  return (
    <>
      <section data-testid="accounts-page" className="w-full space-y-10">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-text">
              Accounts
            </h1>
            <p className="text-sm text-text/60 mt-1">
              Manage and transfer funds between your linked accounts
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              data-testid="accounts-link-button"
              onClick={() => setShowModal(true)}
              className="h-10 px-4 rounded-lg
                         bg-primary text-white
                         hover:bg-primary/90
                         transition"
            >
              Link Account
            </button>

            <button
              data-testid="accounts-deposit-button"
              onClick={() => setShowDepositModal(true)}
              className="h-10 px-4 rounded-lg
                         border border-border
                         text-text
                         hover:bg-primary/5
                         transition"
            >
              Deposit
            </button>
          </div>
        </div>

        {/* Accounts Section */}
        <div className="space-y-4">
          <h2 className="text-sm font-medium text-text/60">Your Accounts</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
            {loading && (
              <p className="text-sm text-text/60">Loading accounts…</p>
            )}

            {!loading && accounts.length === 0 && (
              <div
                className="col-span-full rounded-xl
                              border border-dashed border-border
                              py-14 text-center text-text/60"
              >
                No accounts linked yet.
              </div>
            )}

            {accounts.map((account) => (
              <AccountCard
                key={account.id}
                account={account}
                setTransferFrom={setTransferFrom}
                setShowTransferModal={setShowTransferModal}
                setPayForm={setPayForm}
                setShowPayModal={setShowPayModal}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Modals */}
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

      {showPayModal && payForm && (
        <Pay
          accounts={accounts}
          payForm={payForm}
          setPayForm={setPayForm}
          setShowPayModal={setShowPayModal}
        />
      )}
    </>
  );
};

export default AccountsPage;
