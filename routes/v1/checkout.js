const express = require('express');
const { auth } = require('../../middlewares/auth');
const { createCheckout, verifyCheckout } = require('../../controller/v1/checkout.js')

const router = express.Router();

router.route("/").post(auth, createCheckout);
router.route("/verify").get(verifyCheckout);

module.exports = router;