const DashboardHeader = ({
  accounts,
  setSelectedAccountId,
  selectedAccountId,
}) => {
  return (
    <div className="space-y-1 flex justify-between">
      {/* Header */}
      <div className="heading">
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-text">
          Dashboard
        </h1>
        <p className="text-sm text-text/60">
          Overview of your financial activity
        </p>
      </div>
      {/* Filter */}
      <div className="flex gap-2 pt-3">
        <button
          onClick={() => setSelectedAccountId(null)}
          className={`px-4 py-1.5 rounded-full text-sm border transition cursor-pointer
        ${
          selectedAccountId === null
            ? 'bg-primary text-white border-primary'
            : 'bg-transparent text-text/70 border-border hover:bg-muted'
        }`}
        >
          All Account
        </button>
        {accounts.map((account) => {
          const { id } = account;
          return (
            <button
              key={id}
              onClick={() => setSelectedAccountId(id)}
              className={`px-4 py-1.5 rounded-full text-sm border transition cursor-pointer
        ${
          selectedAccountId === id
            ? 'bg-primary text-white border-primary'
            : 'bg-transparent text-text/70 border-border hover:bg-muted'
        }`}
            >
              {account.account_name}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default DashboardHeader;
