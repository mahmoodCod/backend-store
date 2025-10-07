const { errorResponse, successRespons } = require("../../helpers/respanses");
const Seller = require("../../model/Seller");
const { createSellerValidator, updateSellerValidator } = require("../../validators/seller");
const cities = require("../../cities/cities.json");

exports.create = async(req,res,next) => {
    try {
        const { name, contactDetails, cityId } = req.body;
        const user = req.user;

        await createSellerValidator.validate(req.body, { abortEarly: false });

        const existingSeller = await Seller.findOne({ user: user._id });

        if (existingSeller) {
            return errorResponse(res,400, 'Seller already existing !!');
        };

        const city = cities.find((city) => +city.id === +cityId);

        if (!city) {
            return errorResponse(res,409, 'City is not valid !!');
        };

        const seller = await Seller.create({
            name,
            contactDetails,
            cityId,
            user: user._id
        });

        return successRespons(res,201, {
            message: 'Seller created successfully :))',
            seller
        });

    } catch (err) {
        next(err);
    };
};

exports.updateSeller = async(req,res,next) => {
    try {
        const { name, contactDetails, cityId } = req.body;
        const user = req.user;

        await updateSellerValidator.validate(req.body, { abortEarly: false });

        const existingSeller = await Seller.findOne({ user: user._id });

        if (!existingSeller) {
            return errorResponse(res,404, 'Seller not found !!');
        };

        const seller = await Seller.findByIdAndUpdate( existingSeller._id, {
            name,
            contactDetails,
            cityId
        }, { new: true }
    );

    return successRespons(res,200, {
        message: "Seller updated successfully :))",
        seller,
    });

    } catch (err) {
        next(err);
    };
};

exports.removeSeller = async(req,res,next) => {
    try {
        const user = req.user;
    const existingSeller = await Seller.findOne({ user: user._id });

    if (!existingSeller) {
        return errorResponse(res,404, 'Seller not found !!');
    };

    await existingSeller.deleteOne();

    //! Delete products
    //! Delete products from user shoping cart

    return successRespons(res,200, {
        message: "Seller deleted successfully :))",
        Seller: existingSeller,
    });
    } catch (err) {
        next(err);
    };
};

exports.get = async(req,res,next) => {
    try {
        const user = req.user;
        const seller = await Seller.findOne({ user: user._id });
    
        if (!seller) {
            return errorResponse(res,404, 'Seller not found !!');
        };

        return successRespons(res,200, {
            seller
        });

    } catch (err) {
        next(err);
    };
};