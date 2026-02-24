const TransferPage = () => {
  return (
    <div className="w-full max-w-3xl mx-auto py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-text mb-2">
          Transfer Money
        </h1>
        <p className="text-text/60">
          Send money securely between your accounts
        </p>
      </div>

      {/* Transfer Card */}
      <div className="bg-card border border-border rounded-lg p-8 space-y-8">
        {/* From Account */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-text/60">
            From Account
          </label>
          <select className="w-full h-10 px-3 rounded-md bg-background border border-border text-text outline-none focus:ring-2 focus:ring-primary">
            <option>Current Account</option>
            <option>Savings Account</option>
          </select>
        </div>

        {/* To Account */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-text/60">To Account</label>
          <select className="w-full h-10 px-3 rounded-md bg-background border border-border text-text outline-none focus:ring-2 focus:ring-primary">
            <option>Savings Account</option>
            <option>External Account</option>
          </select>
        </div>

        {/* Amount */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-text/60">Amount</label>
          <input
            type="number"
            placeholder="Enter amount"
            className="w-full h-10 px-3 rounded-md bg-background border border-border text-text outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-text/60">
            Description (optional)
          </label>
          <textarea
            placeholder="Add a note for this transfer"
            className="w-full min-h-[80px] px-3 py-2 rounded-md bg-background border border-border text-text outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Summary */}
        <div className="bg-background border border-border rounded-md p-4 space-y-2">
          <p className="text-sm text-text/60">Transfer Summary</p>
          <div className="flex justify-between text-text">
            <span>From</span>
            <span>Current Account</span>
          </div>
          <div className="flex justify-between text-text">
            <span>To</span>
            <span>Savings Account</span>
          </div>
          <div className="flex justify-between font-semibold text-text">
            <span>Total</span>
            <span>$0.00</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4 pt-4">
          <button className="h-10 px-6 rounded-md border border-border text-text">
            Cancel
          </button>

          <button className="h-10 px-6 rounded-md bg-primary text-white">
            Transfer
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransferPage;
