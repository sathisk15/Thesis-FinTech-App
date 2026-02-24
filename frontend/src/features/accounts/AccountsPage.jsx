const AccountsPage = () => {
  return (
    <div className="w-full py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <p className="text-2xl 2xl:text-3xl font-semibold text-text/60">
          Accounts Information
        </p>

        <button className="h-10 px-4 rounded-md bg-primary text-white flex items-center gap-2">
          Add Account
        </button>
      </div>

      {/* Accounts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 2xl:grid-cols-4 gap-6">
        {/* Current Account */}
        <div className="bg-card border border-border rounded-lg p-4 flex gap-4">
          <div className="w-12 h-12 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">
            CA
          </div>

          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xl font-semibold text-text">Current Account</p>
            </div>

            <p className="font-mono text-text/60 tracking-widest">
              AC •••• 0057
            </p>

            <p className="text-xs text-text/50">Last updated: Sep 20, 2023</p>

            <div className="flex justify-between items-center">
              <p className="text-lg font-medium text-text">PLN 201,500.00</p>
            </div>
          </div>
        </div>

        {/* Savings Account */}
        <div className="bg-card border border-border rounded-lg p-4 flex gap-4">
          <div className="w-12 h-12 rounded-full bg-success/20 text-success flex items-center justify-center font-bold">
            SA
          </div>

          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xl font-semibold text-text">Savings Account</p>
            </div>

            <p className="font-mono text-text/60 tracking-widest">
              AC •••• 9366
            </p>

            <p className="text-xs text-text/50">Last updated: Sep 20, 2023</p>

            <div className="flex justify-between items-center">
              <p className="text-lg font-medium text-text">PLN 802,500.00</p>
            </div>
          </div>
        </div>

        {/* Business Account */}
        <div className="bg-card border border-border rounded-lg p-4 flex gap-4">
          <div className="w-12 h-12 rounded-full bg-warning/20 text-warning flex items-center justify-center font-bold">
            BA
          </div>

          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xl font-semibold text-text">
                Business Account
              </p>
            </div>

            <p className="font-mono text-text/60 tracking-widest">
              AC •••• 7528
            </p>

            <p className="text-xs text-text/50">Last updated: Sep 20, 2023</p>

            <div className="flex justify-between items-center">
              <p className="text-lg font-medium text-text">PLN 500,800.00</p>
            </div>
          </div>
        </div>

        {/* Joint Account */}
        <div className="bg-card border border-border rounded-lg p-4 flex gap-4">
          <div className="w-12 h-12 rounded-full bg-danger/20 text-danger flex items-center justify-center font-bold">
            JA
          </div>

          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xl font-semibold text-text">Joint Account</p>
            </div>

            <p className="font-mono text-text/60 tracking-widest">
              AC •••• 3149
            </p>

            <p className="text-xs text-text/50">Last updated: Sep 20, 2023</p>

            <div className="flex justify-between items-center">
              <p className="text-lg font-medium text-text">PLN 401,200.00</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountsPage;
