exports.setHeaders = (req,res,next) => {
    res.setHeader("Access-Controll-Allow-Origin","*");
    res.setHeader("Access-Controll-Allow-Methods","GET,POST,PUT,DELETE,PATCH");
    res.setHeader("Access-Controll-Allow-Headers","Contents-Types, Authorization");

    next();
};