exports.summary = (req, res) => {
  res.json(req.app.locals.db.dashboard);
};

exports.charts = (req, res) => {
  res.json(req.app.locals.db.charts);
};
