const SignUpPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md bg-card border border-border rounded-lg p-8 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-semibold text-text">Create Account</h1>
          <p className="text-text/60">Get started with your Banking account</p>
        </div>

        {/* Form */}
        <form className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm text-text/60">Full Name</label>
            <input
              type="text"
              placeholder="Sathiskumar"
              className="w-full h-10 px-3 rounded-md bg-background border border-border text-text outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm text-text/60">Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              className="w-full h-10 px-3 rounded-md bg-background border border-border text-text outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm text-text/60">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full h-10 px-3 rounded-md bg-background border border-border text-text outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm text-text/60">Confirm Password</label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full h-10 px-3 rounded-md bg-background border border-border text-text outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <button
            type="submit"
            className="w-full h-10 rounded-md bg-primary text-white font-medium"
          >
            Create Account
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-sm text-text/60">
          Already have an account?{' '}
          <span className="text-primary cursor-pointer">Sign in</span>
        </p>
      </div>
    </div>
  );
};

export default SignUpPage;
