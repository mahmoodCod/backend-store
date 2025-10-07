const express = require("express");
const { auth } = require("../../middlewares/auth");
const roleGuard = require("../../middlewares/roleGuard");
const { create, updateSeller, removeSeller, get } = require("../../controller/v1/seller");

const router = express.Router();

router.route('/')
.post(auth, roleGuard('SELLER'), create)
.patch(auth, roleGuard('SELLER'), updateSeller)
.delete(auth, roleGuard('SELLER'), removeSeller)
.get(auth, roleGuard('SELLER'), get)

module.exports = router;