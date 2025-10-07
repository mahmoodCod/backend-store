const { isValidObjectId } = require("mongoose");
const { successRespons, errorResponse } = require("../../helpers/respanses");
const Product = require("../../model/Product");
const Seller = require("../../model/Seller");
const SellerRequest = require('../../model/sellerRequest');
const { createSellerRequestValidator, updateSellerRequestValidator } = require('../../validators/sellerRequest');
const { createPaginationData } = require("../../utils/index");

exports.createSellerRequest = async (req,res,next) => {
    try {
        const user = req.user;

        await createSellerRequestValidator.validate(req.body, {
            abortEarly: false
        });
        const { productId, price, stock } = req.body;

        const seller = await Seller.findOne({ user: user._id });

        if (!seller) {
            return errorResponse(res,404, 'Seller not found !!');
        };

        const existingRequest = await SellerRequest.findOne({
            seller: seller._id,
            product: productId
        });

        if (existingRequest) {
            return errorResponse(res,400, 'Request alredy exist !!');
        };

        const product = await Product.findById(productId);

        if (!product) {
            return errorResponse(res,404, 'Product not found !!');
        };

        const newSellerRequest = SellerRequest.create({
            seller: seller._id,
            product: productId,
            price,
            stock
        });

        return successRespons(res,201, {
            message: ' Seller created new Request successfully :))',
            request: newSellerRequest
        });
    } catch (err) {
        next(err);
    };
};

exports.getAllSellerRequest = async (req,res,next) => {
    try {
        const user = req.user;
        const { status = 'pending', page = 1, limit = 10 } = req.query;

        const seller = await Seller.findOne({ user: user._id });

        if (!seller) {
            return errorResponse(res,404, 'Seller not found !!');
        };

        const filters = {
            seller: seller._id,
            status,
        };

        const sellerRequests = await SellerRequest.find(filters).sort({
            createdAt: 'desc'
        }).skip((page - 1) * limit).limit(limit);

        const totalRequests = await SellerRequest.countDocuments(filters);

        return successRespons(res,200, {
            sellerRequests,
            pagination: createPaginationData(page, limit, totalRequests, 'SellerRequest'),
        });

    } catch (err) {
        next(err);
    };
};

exports.removeSellerRequest = async (req,res,next) => {
    try {
        const { idSeller } = req.params;
        const user = req.user;
    
        if (!isValidObjectId(idSeller)) {
          return errorResponse(res, 400, "Seller request id is not valid !!");
        }
    
        const seller = await Seller.findOne({ user: user._id });
    
        if (!seller) {
          return errorResponse(res, 404, "Seller not found !!");
        }
    
        const sellerRequest = await SellerRequest.findById(idSeller);
    
        if (!sellerRequest) {
          return errorResponse(res, 404, "Seller request not found !!");
        }
    
        if (sellerRequest.seller.toString() !== seller._id.toString()) {
          return errorResponse(
            res,
            403,
            "You have not access to this seller request !!"
          );
        }
    
        if (sellerRequest.status !== "pending") {
          return errorResponse(
            res,
            400,
            "Seller request already reject or accept, cannot be deleted !!"
          );
        }
    
        await SellerRequest.findByIdAndDelete(idSeller);
    
        return successRespons(res, 200, {
          message: "Seller request deleted successfully :))",
        });
      } catch (err) {
        next(err);
      }
};

exports.updateSellerRequest = async (req,res,next) => {
    try {
        const { idSeller } = req.params;
        const { status, adminComment } = req.body;

        await updateSellerRequestValidator.validate({
            status,
            adminComment,
        }, { abortEarly: false });

        const sellerRequest = await SellerRequest.findById(idSeller);

        if (!sellerRequest) {
            return errorResponse(res,400, 'Seller request not found !!');
        };

        if (status === 'reject') {
            sellerRequest.status = 'rejected';
            if (adminComment) {
                sellerRequest.adminComment = adminComment;
            };

        await sellerRequest.save();

        return successRespons(res,200, {
            message: 'Seller request reject successfully :))',
            sellerRequest,
        });
    } else if (status === 'accept') {
        if (adminComment) {
            sellerRequest.adminComment = adminComment;
        };

        const product = await Product.findById(sellerRequest.product);
        if (!product) {
            return errorResponse(res,404, 'Product not found !!');
        };

        const existingProductSeller = product.sellers.find(seller => seller.seller.toString() === sellerRequest.seller.toString());

        if (!existingProductSeller) {
            return errorResponse(res,400, 'Seller already exist for this product !!');
        };

        product.sellers.push({
            seller: sellerRequest.seller,
            stock: sellerRequest.stock,
            price: sellerRequest.price,
        });

        await product.save();

        sellerRequest.status = 'accepted';

        await sellerRequest.save();

        return successRespons(res,200, 'Seller request accepted successfully and added to the product :))');
    };
    } catch (err) {
        next(err);
    };
};