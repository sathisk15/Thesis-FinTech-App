const SettingsPage = () => {
  return (
    <div className="flex min-h-screen bg-background w-full items-center justify-center">
      <div className="w-full max-w-4xl p-4 my-6 md:px-10 md:my-10 bg-card border border-border rounded-lg shadow-sm">
        {/* Section Header */}
        <div className="mt-6 border-b border-border pb-4">
          <p className="text-2xl 2xl:text-3xl font-semibold text-text">
            General Settings
          </p>
        </div>

        {/* Profile Info */}
        <div className="py-10">
          <p className="text-lg font-bold text-text">Profile Information</p>

          <div className="flex items-center gap-4 my-8">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary text-white font-bold text-2xl">
              S
            </div>
            <p className="text-2xl font-semibold text-text">Sathiskumar</p>
          </div>

          {/* Profile Form */}
          <form className="space-y-6">
            {/* Names */}
            <div className="flex flex-col md:flex-row gap-4">
              {['First Name', 'Last Name'].map((label) => (
                <div key={label} className="w-full space-y-2">
                  <label className="text-sm font-medium text-text/60">
                    {label}
                  </label>
                  <input className="w-full h-10 px-3 rounded-md bg-background border border-border text-text outline-none focus:ring-2 focus:ring-primary" />
                </div>
              ))}
            </div>

            {/* Email & Contact */}
            <div className="flex flex-col md:flex-row gap-4">
              {['Email', 'Contact'].map((label) => (
                <div key={label} className="w-full space-y-2">
                  <label className="text-sm font-medium text-text/60">
                    {label}
                  </label>
                  <input className="w-full h-10 px-3 rounded-md bg-background border border-border text-text outline-none focus:ring-2 focus:ring-primary" />
                </div>
              ))}
            </div>

            {/* Country & Currency */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="w-full space-y-2">
                <label className="text-sm font-medium text-text/60">
                  Country
                </label>
                <input className="w-full h-10 px-3 rounded-md bg-background border border-border text-text outline-none focus:ring-2 focus:ring-primary" />
              </div>

              <div className="w-full space-y-2">
                <label className="text-sm font-medium text-text/60">
                  Currency
                </label>
                <select className="w-full h-10 px-3 rounded-md bg-background border border-border text-text outline-none focus:ring-2 focus:ring-primary">
                  <option>USD</option>
                </select>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-6">
              <button
                type="submit"
                className="h-10 px-8 rounded-md bg-primary text-white font-medium"
              >
                Save
              </button>
            </div>
          </form>
        </div>

        {/* Change Password */}
        <div className="py-10 border-t border-border">
          <p className="text-xl font-bold text-text mb-1">Change Password</p>
          <span className="text-sm text-text/60">
            This will be used to log into your account and perform sensitive
            actions.
          </span>

          <form className="mt-6 space-y-6">
            {['Current Password', 'New Password', 'Confirm Password'].map(
              (label) => (
                <div key={label} className="space-y-2">
                  <label className="text-sm font-medium text-text/60">
                    {label}
                  </label>
                  <input
                    type="password"
                    className="w-full h-10 px-3 rounded-md bg-background border border-border text-text outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              ),
            )}

            <div className="flex justify-end pt-6">
              <button
                type="submit"
                className="h-10 px-8 rounded-md bg-primary text-white font-medium"
              >
                Change Password
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
