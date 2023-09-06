const express = require('express');
const passwordcode = require('../Controller/password');
const router = express.Router();

router.post('/sendcode', passwordcode.sendAuthCode);
router.post('/passwordretrieval', passwordcode.passwordretrieval);
module.exports = router;