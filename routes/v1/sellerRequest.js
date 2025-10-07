const express = require('express');
const { auth } = require('../../middlewares/auth');
const roleGuard = require('../../middlewares/roleGuard');
const { createSellerRequest, getAllSellerRequest, removeSellerRequest, updateSellerRequest } = require('../../controller/v1/sellerRequest');

const router = express.Router();

router.route('/')
.post(auth, roleGuard('SELLER'), createSellerRequest)
.get(auth, roleGuard('SELLER'), getAllSellerRequest);

router.route('/:idSeller')
.delete(auth, roleGuard('SELLER'), removeSellerRequest)
.patch(auth, roleGuard('ADMIN'), updateSellerRequest);

module.exports = router;