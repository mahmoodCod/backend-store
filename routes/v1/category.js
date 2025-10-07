const express = require('express');
const { auth } = require('../../middlewares/auth');
const roleGuard = require('../../middlewares/roleGuard');
const { createCategory, editCategory, deleteCategory, fetchAllCategory } = require('../../controller/v1/category');
const { craeteSubCategory, getAllSubCategory, getSubCategory, deleteSubCategory, editSubCategory } = require('../../controller/v1/subCategory');
const { multerStorage } = require('../../utils/multerConfigs');

const upload = multerStorage('public/images/category-icons');

const router = express.Router();

router
.route('/')
.post(auth, roleGuard('ADMIN'), upload.single('icon'), createCategory)
.get(fetchAllCategory);

router
.route('/:categoryId')
.put(auth, roleGuard('ADMIN'), upload.single('icon'), editCategory)
.delete(auth, roleGuard('ADMIN'), deleteCategory);

router
.route('/sub')
.post(auth, roleGuard('ADMIN'), craeteSubCategory)
.get(getAllSubCategory);

router
.route('/sub/:categoryId')
.get(getSubCategory)
.delete(auth, roleGuard('ADMIN'), deleteSubCategory)
.put(auth,roleGuard('ADMIN'), editSubCategory);


module.exports = router;