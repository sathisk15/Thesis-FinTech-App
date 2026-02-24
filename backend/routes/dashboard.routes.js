const express = require('express');
const router = express.Router();
const { summary, charts } = require('../controllers/dashboard.controller.js');

router.get('/summary', summary);
router.get('/charts', charts);

export default router;
