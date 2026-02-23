const fs = require('fs');
const path = require('path');

module.exports = function loadDb() {
  const dbPath = path.join(__dirname, '../data/db.json');
  const raw = fs.readFileSync(dbPath, 'utf-8');
  return JSON.parse(raw);
};
