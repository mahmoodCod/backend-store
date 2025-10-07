const { errorResponse, successRespons } = require("../../helpers/respanses");
const Ban = require("../../model/Ban");
const User = require("../../model/User");
const cities = require('../../cities/cities.json');
const { createAddressValidator,updateAddressValidator } = require("../../validators/address");
const { createPaginationData } = require("../../utils");

exports.getAll = async(req,res,next) => {
  try {
    let { page = 1, limit = 10 } = req.query;

    const users = await User.find({}).skip((page - 1) * limit).limit(limit);

    const totalUsers = await User.countDocuments();

    return successRespons(res,200, {
      users,
      pagination: createPaginationData(page, limit, totalUsers, 'Users'),
    });

  } catch (err) {
    next(err);
  };
};

exports.banUser = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const user = await User.findOne({ _id: userId });
    if (!user) {
      return errorResponse(res, 404, "User not found !!");
    }

    if (user.roles.includes("ADMIN")) {
      return errorResponse(res, 403, "You cannot ban an admin !!");
    }

    const deletedUser = await User.findOneAndDelete({ _id: userId });

    await Ban.create({ phone: user.phone });

    return successRespons(res, 200, {
      user: deletedUser,
      message: "User banned successfully, user and posts removed",
    });
  } catch (err) {
    next(err);
  }
};

exports.createAddress = async(req,res,next) => {
    try {
        const user = req.user;

        const { name, postalCode, location, address, cityId } = req.body;

        await createAddressValidator.validate(req.body , { abortEarly: false });

        const city = cities.find((city) => +city.id === +cityId);

        if (!city) {
            return errorResponse(res,409, 'City is not valid !!');
        };

        const addressObject = { 
            name,
            postalCode,
            location,
            address,
            cityId 
        };

        const updatedUser = await User.findByIdAndUpdate( user._id, {
            $push: {
                addresses: addressObject,
            },
        },
        {
            new: true,
        },
    );

    return successRespons(res,201, { user: updatedUser, message:'Address create successfully :))'});
    } catch (err) {
        next(err);
    };
};

exports.removeAddress = async (req, res, next) => {
    try {
        const { addressId } = req.params;

        const user = await User.findOne({ _id: req.user._id });

        const address = user.addresses.id(addressId);

        if(!address) {
            return errorResponse(res,404, 'Address not found !!');
        };

        await user.addresses.pull(addressId);

        const updatedUser = await user.save();

        return successRespons(res,200, {
            user: updatedUser,
            message: 'Address deleted successfully :))'
        });
      
    } catch (err) {
      next(err);
    }
};

exports.updateAddress = async(req,res,next) => {
  try {
    const user = await User.findOne({ _id: req.user._id });
    const { addressId } = req.params;

    const { name, postalCode, location, address, cityId } = req.body;

        await updateAddressValidator.validate(req.body , { abortEarly: false });

        const userAddress = user.addresses.id(addressId);

        if(!userAddress) {
            return errorResponse(res,404, 'Address not found !!');
        };

        userAddress.name = name || userAddress.name;
        userAddress.location = location || userAddress.location;
        userAddress.postalCode = postalCode || userAddress.postalCode;
        userAddress.cityId = cityId || userAddress.cityId;
        userAddress.address = address || userAddress.address;

        const updateAddress = await user.save();

        return successRespons(res,200, {
          user:updateAddress,
          message: 'Address updated successfully :))',
        });

  } catch (err) {
    next(err);
  };
};