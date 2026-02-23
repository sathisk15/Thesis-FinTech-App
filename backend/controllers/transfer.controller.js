exports.preview = (req, res) => {
  res.json({ valid: true });
};

exports.confirm = (req, res) => {
  res.json({ success: true });
};
