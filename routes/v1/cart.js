const express = require('express');
const { auth } = require('../../middlewares/auth');
const { getCart, addCart, removeCart } = require('../../controller/v1/cart');

const router = express.Router();

router.route('/').get(auth, getCart);
router.route('/add').post(auth, addCart);
router.route('/remove').delete(auth, removeCart);

module.exports = router;