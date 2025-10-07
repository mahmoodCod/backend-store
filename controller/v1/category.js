const json = require("body-parser/lib/types/json");
const { categoryValidator, categoryEditValidator } = require('../../validators/category');
const { errorResponse, successRespons } = require("../../helpers/respanses");
const Category = require("../../model/Category");
const SubCategory = require("../../model/SubCategory");
const { isValidObjectId } = require("mongoose");


const supportedFormat = [
    "image/jpeg",
    "image/svg",
    "image/png",
    "image/webp",
    "image/gif",
    "image/svg+xml",
]
exports.createCategory = async(req,res,next) => {
    try {
        let { title, slug, parent, description, filters } = req.body;
        filters = JSON.parse(filters);

        await categoryValidator.validate({
            title,
            slug,
            parent,
            description,
            filters
        }, { abortEarly: false }
    );

    let icon = null;
    if (req.file) {
        const { filename, mimetype } = req.file;

        if(!supportedFormat.includes(mimetype)) {
            return errorResponse(res,400, 'Unsopported image format !!');
        };

        icon = {
            filename,
            path: `images/category-icons/${filename}`,
        };
    };

    const newCategory = await Category.create({
        title,
        parent,
        slug,
        description,
        filters,
        icon
    });

    return successRespons(res,201, {
        category: newCategory,
    });

    } catch (err) {
        next(err);
    };
};

exports.editCategory = async(req,res,next) => {
    try {
        const { categoryId } = req.params;

        if (!isValidObjectId(categoryId)) {
            return errorResponse(res,400, 'Category id is not valid !!');
        };
        
        let { title, slug, parent, description, filters } = req.body;
        filters = JSON.parse(filters);

        await categoryEditValidator.validate({
            title,
            slug,
            parent,
            description,
            filters
        }, { abortEarly: false }
    );

    let icon = null;
    if (req.file) {
        const { filename, mimetype } = req.file;

        if(!supportedFormat.includes(mimetype)) {
            return errorResponse(res,400, 'Unsopported image format !!');
        };

        icon = {
            filename,
            path: `images/category-icons/${filename}`,
        };
    };

    const updatedCategory = await Category.findByIdAndUpdate(categoryId, {
        title,
        parent,
        slug,
        description,
        filters,
        icon,
    }, { new: true });

    if (!updatedCategory) {
        return errorResponse(res,404, 'Category not found !!');
    };

    return successRespons(res,200, { category: updatedCategory});
    } catch (err) {
        next(err);
    };
};

exports.deleteCategory = async(req,res,next) => {
    try {
        const { categoryId } = req.params;

        if (!isValidObjectId(categoryId)) {
            return errorResponse(res,400, 'Category id is not valid !!');
        };

        const deletedcategory = await Category.findByIdAndDelete(categoryId);

        if(!deletedcategory) {
            return errorResponse(res,404, 'Category not found !!');
        };

        return successRespons(res,200, {
            message: 'Category deleted successfully :))',
            category: deletedcategory,
        });


    } catch (err) {
        next(err);
    };
};

exports.fetchAllCategory = async(req,res,next) => {
    try {
        const fetchSubCategoresRecursively = async (parentId = null) => {
            const subCategories = await SubCategory.find({ parent: parentId });
            const parentSubcategories = await Category.find({ parent: parentId }).lean();

        const fetchedParentSubCategory = [];

        for(const category of parentSubcategories) {
            category.subCategories = await fetchSubCategoresRecursively(category._id);

            fetchedParentSubCategory.push(category);
        };

        return [ ...fetchedParentSubCategory, ...subCategories ];
    };

        const categories = await fetchSubCategoresRecursively(null);

        return successRespons(res,200, { categories });

    } catch (err) {
        next(err);
    };
};