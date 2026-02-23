const express = require('express');
const router = express.Router();
const {
  getSettings,
  updateSettings,
} = require('../controllers/settings.controller');

router.get('/security', getSettings);
router.post('/security', updateSettings);

module.exports = router;
