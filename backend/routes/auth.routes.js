const express = require('express');
const router = express.Router();
const { login, mfa } = require('../controllers/auth.controller');

router.post('/login', login);
router.post('/mfa', mfa);

module.exports = router;
