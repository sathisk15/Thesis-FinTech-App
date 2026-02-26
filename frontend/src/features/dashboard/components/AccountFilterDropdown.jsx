export const AccountFilterDropdown = ({
  accounts,
  selectedAccountId,
  onChange,
}) => {
  return (
    <select
      value={selectedAccountId}
      onChange={(e) => onChange(e.target.value)}
      className="border rounded-md px-3 py-1 text-sm bg-white"
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
