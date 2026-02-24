const express = require('express');
const router = express.Router();
const { preview, confirm } = require('../controllers/transfer.controller');

router.post('/preview', preview);
router.post('/confirm', confirm);

export default router;
