exports.getSettings = (req, res) => {
  res.json(req.app.locals.db.securitySettings);
};

exports.updateSettings = (req, res) => {
  Object.assign(req.app.locals.db.securitySettings, req.body);
  res.json({ success: true });
};
