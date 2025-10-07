const express = require("express");
const { auth } = require("../../middlewares/auth");
const roleGuard = require("../../middlewares/roleGuard");
const { getAllCites } = require("../../controller/v1/location");

const router = express.Router();

router.route('/').get(getAllCites);

module.exports = router;