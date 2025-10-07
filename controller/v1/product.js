const { createProductValidator, updateProductValidator } = require("../../validators/product");
const Product = require("../../model/Product");
const { errorResponse, successRespons } = require("../../helpers/respanses");
const { createPaginationData } = require('../../utils/index');
const { isValidObjectId, default: mongoose } = require("mongoose");
const subCategory = require("../../model/SubCategory");
const { nanoid } = require("nanoid");
const fs = require('fs');

const supportedFormat = [
    "image/jpeg",
    "image/svg",
    "image/png",
    "image/webp",
    "image/gif",
    "image/svg+xml",
]
exports.createProduct = async (req, res, next) => {
  try {
    let {
      name,
      slug,
      description,
      subCategory,
      sellers,
      filterValue,
      customFilters,
    } = req.body;

    if(sellers) sellers = JSON.parse(sellers);
    filterValue = JSON.parse(filterValue);
    customFilters = JSON.parse(customFilters);

    if (!isValidObjectId(subCategory)) {
        return errorResponse(res,400, 'SubCategory Id is not currect !!');
    };

    const validatedData = await createProductValidator.validate({
      name,
      slug,
      description,
      subCategory,
      sellers,
      filterValue,
      customFilters,
    },
      { abortEarly: false });

    let shortIdentifier = "";

    let images = [];
    for(let i = 0; i < req.files.length; i++) {
        const file = req.files[i];

        if (!supportedFormat.includes(file.mimetype)) {
            return errorResponse(res,400, 'UnSupported image format !!');
        };

        images.push(file.filename);

        while(!shortIdentifier) {
            shortIdentifier = nanoid(6);
            const product = await Product.findOne({
                shortIdentifier,
            });

            if(product) shortIdentifier = "";
        };
    };

    const newProduct = await Product.create({
        name: validatedData.name,
        slug: validatedData.slug,
        description: validatedData.description,
        subCategory: validatedData.subCategory,
        images,
        sellers: validatedData.sellers.map((seller) => ({
          seller: seller.id,
          price: seller.stock,
          stock: seller.stock,
        })),
        filterValue: validatedData.filterValues || {},
        customFilters: validatedData.customFilters || {},
        shortIdentifier
    });

    return successRespons(res,201, {
        message: 'Product created successfully :))',
        product: newProduct
    });

  } catch (err) {
    next(err);
  }
};

exports.getAllProduct = async (req,res,next) => {
  try {
    const { 
      name,
      subCategory,
      minPrice,
      maxPrice,
      sellerId,
      filterValue,
      page = 1,
      limit = 10
    } = req.query;

    const filters = {
      "sellers.stock": { $gt: 0 },
    };

    if (name) {
      filters.name = { $regex: name, options: "i" };
    };

    if (subCategory) {
      filters.subCategory = mongoose.Types.ObjectId.createFromHexString(subCategory);
    };

    if (minPrice) {
      filters["sellers.price"] = { $gte : +minPrice };
    };

    if (maxPrice) {
      filters["sellers.price"] = { $lte : +maxPrice };
    };

    if (sellerId) {
      filters["sellers.seller"] = mongoose.Types.ObjectId.createFromHexString(sellerId);
    };

    if (filterValue) {
      const parseFilterValue = JSON.parse(filterValue);
      Object.keys(parseFilterValue).forEach((key) => {
        filters[`filterValue.${key}`] = parseFilterValue[key];
      });
    };

    const products =  await Product.aggregate([
      {
        $match: filters,
      },
      {
        $lookup: {
          from: "comments",
          localField: "_id",
          foreignField: "product",
          as: "comments"
        },
      },
      {
        $addFields: {
          averageRating: {
            $cond: {
              if: { $gt: [{ $size: "$comments" }, 0] },
              then: { $avg: `$comments.rating` },
              else: 0
            },
          },
        },
      },
      {
        $project: {
          comments: 0
        },
      },
      {
        $skip: ( page - 1 ) * limit,
      },
      {
        $limit: +limit,
      },
    ]);

    const totalProduct = await Product.countDocuments(filters);

    return successRespons(res,200, {
      products,
      pagination: createPaginationData(page, limit, totalProduct, "Products"),
    });
  } catch (err) {
    next(err);
  };
};

exports.getOneProduct = async (req,res,next) => {
  try {
    const { productId } = req.params;

    if (!isValidObjectId(productId)) {
      return errorResponse(res,400, "Product id is not currect !!");
    };

    const product = await Product.findById(productId)
    .populate('subCategory')
    .populate('sellers.seller');

    if (!product) {
      return errorResponse(res,404, "Product not found !!");
    };

    return successRespons(res,200, { product })
  } catch (err) {
    next(err);
  };
};

exports.deleteProduct = async (req,res,next) => {
  try {
    const { productId } = req.params;

        if (!isValidObjectId(productId)) {
            return errorResponse(res,400, 'Product id is not valid !!');
        };

        const deletedProduct = await Product.findByIdAndDelete(productId);
        
        deletedProduct?.images?.map((image) => fs.unlink(`public/images/products/${image}`, (err) => next(err)));

        if(!deletedProduct) {
            return errorResponse(res,404, 'Product not found !!');
        };

        return successRespons(res,200, {
            message: 'Product deleted successfully :))',
            product: deletedProduct,
        });
  } catch (err) {
    next(err);
  };
};

exports.updateProduct = async (req,res,next) => {
  try {
    const { id } = req.params;

    let {
      name,
      slug,
      description,
      subCategory,
      sellers,
      filterValue,
      customFilters,

    } = req.body;

    if (filterValue) {
      filterValue = JSON.parse(filterValue);
    };

    if (customFilters) {
      customFilters = JSON.parse(customFilters);
    };

    await updateProductValidator.validate({
      name,
      slug,
      description,
      subCategory,
      sellers,
      filterValue,
      customFilters,
    },{ abortEarly: false });

    let images = [];
    if(req.files) {
    for(let i = 0; i < req.files.length; i++) {
        const file = req.files[i];

        if (!supportedFormat.includes(file.mimetype)) {
            return errorResponse(res,400, 'UnSupported image format !!');
        };

        images.push(file.filename);
      };
    };

    const updateProduct = await Product.findByIdAndUpdate(id,{
      name,
      slug,
      description,
      subCategory,
      filterValue,
      customFilters,
      images: images.length ? images: null,
    },{ new: true });

    if (!updateProduct) {
      return errorResponse(res,404, 'Product not found !!');
    };

    return successRespons(res,200, {
      message: 'Product updated successfully :))',
      product: updateProduct
    });

  } catch (err) {
    next(err);
  };
};
