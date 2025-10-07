const { successRespons } = require("../../helpers/respanses");
const cities = require('../../cities/cities.json');
const provinces = require('../../cities/provinces.json');

exports.getAllCites = async(req,res,next) => {
    try {
        return successRespons(res,200, {
            cities,
            provinces
        });

    } catch (err) {
        next(err);
    };
};