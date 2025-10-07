const express = require('express');
const { send,verify,getMe } = require('../../controller/v1/auth');
const { auth } = require('../../middlewares/auth');

const router = express.Router();

router.post('/send', send);
router.post('/verify', verify);
router.get('/me',auth, getMe);

module.exports = router;