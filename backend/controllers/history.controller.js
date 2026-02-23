exports.list = (req, res) => {
  res.json(req.app.locals.db.transactions);
};
