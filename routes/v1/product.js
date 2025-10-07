const express = require('express');
const { auth } = require('../../middlewares/auth');
const roleGuard = require('../../middlewares/roleGuard');
const { createProduct, deleteProduct, getOneProduct, updateProduct, getAllProduct } = require('../../controller/v1/product');
const { multerStorage } = require('../../utils/multerConfigs');

const upload = multerStorage('public/images/products');

const router = express.Router();

router.route('/')
.post(auth, roleGuard('ADMIN'),upload.array('images', 10), createProduct)
.get(getAllProduct);

router.route('/:productId')
.get(getOneProduct)
.patch(auth,roleGuard('ADMIN'),upload.array('images', 10),updateProduct)
.delete(auth, roleGuard('ADMIN'), deleteProduct);

module.exports = router;