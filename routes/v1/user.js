const express = require('express');
const { getAll,banUser,createAddress,removeAddress,updateAddress } = require('../../controller/v1/user');
const { auth } = require('../../middlewares/auth');
const roleGuard = require('../../middlewares/roleGuard');

const router = express.Router();

router.route('/').get(auth, roleGuard('ADMIN'), getAll);
router.route('/ban/:userId').post(auth,roleGuard('ADMIN'),banUser);
router.route('/me/addresses').post(auth,createAddress);
router.route('/me/addresses/:addressId').delete(auth,removeAddress).patch(auth, updateAddress); // put->(update all data) patch->(update part of data)

module.exports = router;