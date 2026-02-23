exports.login = (req, res) => {
  const { email, password } = req.body;
  const users = req.app.locals.db.users;

  const user = users.find((u) => u.email === email && u.password === password);

  if (!user) {
    return res.status(401).json({ success: false });
  }

  res.json({ success: true, mfaRequired: true });
};

exports.mfa = (req, res) => {
  res.json({ success: true });
};
