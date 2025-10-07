const { errorResponse } = require("../../helpers/respanses");
const Product = require("../../model/Product");

exports.redirectToProduct = async (req,res,next) =>  {
    try {
        const { shortIdentifier } = req.params;

        const product = await Product.findOne({ shortIdentifier });

        if (!product) {
            return errorResponse(res,404, 'Product not found !!');
        };

        return res.redirect(`/api/v1/products/${product._id}`);

    } catch (err) {
        next(err);
    };
};