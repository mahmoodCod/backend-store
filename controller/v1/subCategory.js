const { isValidObjectId } = require("mongoose");
const { errorResponse, successRespons } = require("../../helpers/respanses");
const parentCategory = require("../../model/Category");
const SubCategory = require('../../model/SubCategory');
const { subCategoryValidator } = require("../../validators/category");

exports.craeteSubCategory = async(req,res,next) => {
    try {
        let { title, slug, parent, description, filters } = req.body;
        // filters = JSON.parse(filters);

        await subCategoryValidator.validate({
            title,
            slug,
            parent,
            description,
            filters
        }, { abortEarly: false }
    );

    const parentCheck = await parentCategory.findById(parent);

    if (!parentCheck) {
        return errorResponse(res,400, 'Parent id is not correct !!');
    };

    const category = await SubCategory.create({
        title,
        slug,
        description,
        filters,
        parent,
    });

    return successRespons(res,201, {
        category,
        message: 'SubCategory created successfully :))',
    });
    } catch (err) {
        next(err);
    };
};

exports.getAllSubCategory = async(req,res,next) => {
    try {
        const categores = await SubCategory.find();

        return successRespons(res,200, { categores });
    } catch (err) {
        next(err);
    };
};

exports.getSubCategory = async(req,res,next) => {
    try {
        const { categoryId } = req.params;

        if(!isValidObjectId(categoryId)) {
            return errorResponse(res,400, 'Category id is not correct !!');
        };

        const category = await SubCategory.findOne({ _id: categoryId });

        if (!category) {
            return errorResponse(res,404, 'SubCategory not found !!');
        };

        return successRespons(res,200, { category });
    } catch (err) {
        next(err);
    };
};

exports.deleteSubCategory = async(req,res,next) => {
    try {
        const { categoryId } = req.params;

        if (!isValidObjectId(categoryId)) {
            return errorResponse(res,400, 'SubCategory id is not valid !!');
        };

        const deletedSubcategory = await SubCategory.findByIdAndDelete(categoryId);

        if(!deletedSubcategory) {
            return errorResponse(res,404, 'SubCategory not found !!');
        };

        return successRespons(res,200, {
            message: 'SubCategory deleted successfully :))',
            category: deletedSubcategory,
        });
    } catch (err) {
        next(err);
    };
};

exports.editSubCategory = async(req,res,next) => {
    try {
        const { categoryId } = req.params;

        if (!isValidObjectId(categoryId)) {
            return errorResponse(res,400, 'SubCategory id is not valid !!');
        };
        
        let { title, slug, parent, description, filters } = req.body;

        await subCategoryValidator.validate({
            title,
            slug,
            parent,
            description,
            filters
        }, { abortEarly: false }
    );

    const parentCheck = await parentCategory.findById(parent);

    if (!parentCheck) {
        return errorResponse(res,400, 'Parent id is not correct !!');
    };

    const updatedCategory = await SubCategory.findByIdAndUpdate(categoryId, {
        title,
        parent,
        slug,
        description,
        filters,
    }, { new: true });

    if (!updatedCategory) {
        return errorResponse(res,404, 'SubCategory not found !!');
    };

    return successRespons(res,200, { category: updatedCategory});
        
    } catch (err) {
        next(err);
    };
};