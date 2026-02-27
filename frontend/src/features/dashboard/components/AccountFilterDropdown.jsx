export const AccountFilterDropdown = ({
  accounts,
  selectedAccountId,
  onChange,
}) => {
  return (
    <select
      value={selectedAccountId}
      onChange={(e) => onChange(e.target.value)}
      className="
        bg-card text-text text-sm
        border border-border
        rounded-xl px-3 py-2
        focus:outline-none
        focus:ring-2 focus:ring-primary/30
        focus:border-primary/40
        hover:border-border/70
        transition
      "
    >
      <option value="all">All Accounts</option>
      {accounts.map((account) => (
        <option key={account.id} value={account.id}>
          {account.account_name}
        </option>
      ))}
    </select>
  );
};
