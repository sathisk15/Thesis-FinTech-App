const express = require('express');
const router = express.Router();
const { list } = require('../controllers/history.controller.js');

router.get('/', list);

export default router;
