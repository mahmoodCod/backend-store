
const { errorResponse, successRespons } = require('../../helpers/respanses');
const Ban = require('../../model/Ban');
const bcrypt = require('bcrypt');
const { sendSms } = require('../../services/otp');
const { sendOtpValidator, otpVerifyValidator } = require('../../validators/auth');
const User = require('../../model/User');
const jwt = require('jsonwebtoken');
const redis = require('../../redis');

// start helper function

function getOtpRedisPattern(phone) {
    return `OTP: ${phone}`;
};
async function getOtpDetails(phone) {
    const otp = await redis.get(getOtpRedisPattern(phone));

    if (!otp) {
        return {
            expired: true,
            remainingTime: 0,
        };
    };
    const remainingTime =  await redis.ttl(getOtpRedisPattern(phone));// second
    const minutes = Math.floor(remainingTime / 60);
    const seconds = remainingTime % 60; // 01:20
    const formattedTime = `${minutes.toString().padStart(2,'0')}: ${seconds.toString().padStart(2,'0')}`;

    return {
        expired: false,
        remainingTime: formattedTime,
    };
};

const genarateOtp = async(phone, length = 4, expireTime = 1) => {
    const digist = '0123456789';
    let otp = '';

    for (let i = 0 ; i < length ; i++) {
        otp += digist[Math.random() * digist.length];
    };

    otp = '1111'; // Temporary -> موقت
    const hashedOtp = await bcrypt.hash(otp,12);

    await redis.set(getOtpRedisPattern(phone), hashedOtp, 'EX', expireTime * 60);

    return otp;
};

// finish helper function
exports.send = async (req,res,next) => {
    try {
        const { phone } = req.body;

        await sendOtpValidator.validate(req.body, {abortEarly: false});

        const isBanned = await Ban.findOne({ phone });

        if (isBanned) {
            return errorResponse(res, 403, 'Thise phone number has been banned');
        };

        const { expired,remainingTime } = await getOtpDetails(phone);

        if (!expired) {
            return successRespons(res, 200, {message: `OTP already send, please try again afetr ${remainingTime}`});
        };

        const otp = await genarateOtp(phone);

        await sendSms(phone,otp);

        return successRespons(res,200,{message: 'otp send successfully :))'});

    } catch (err) {
        next(err);
    };
};

exports.verify = async (req,res,next) => {
    try {
        const { phone, otp, isSeller } = req.body;
    
        await otpVerifyValidator.validate(req.body, { abortEarly: false });
    
        const savedOtp = await redis.get(getOtpRedisPattern(phone));
    
        if (!savedOtp) {
          return errorResponse(res, 400, "Wrong or expired OTP");
        }
    
        const otpIsCorrect = await bcrypt.compare(otp, savedOtp);
    
        if (!otpIsCorrect) {
          return errorResponse(res, 400, "Wrong or expired OTP !!");
        }
    
        const existingUser = await User.findOne({ phone });
        if (existingUser) {
          const token = jwt.sign(
            { userId: existingUser._id },
            process.env.JWT_SECRET,
            {
              expiresIn: "30d",
            }
          );
    
          return successRespons(res, 200, { user: existingUser, token });
        }
    
        //* Register
        const isFirstUser = (await User.countDocuments()) === 0;
    
        const user = await User.create({
          phone,
          username: phone,
          roles: isFirstUser ? ["ADMIN"] : isSeller ? ["USER", "SELLER"] : ["USER"],
        });
    
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
          expiresIn: "30d",
        });
    
        return successRespons(res, 201, {
          message: "User registed successfully :))",
          token,
          user,
        });
      } catch (err) {
        next(err);
      }
    };

exports.getMe = async (req,res,next) => {
    try {
        const user = req.user;

        return successRespons(res,200, { user });

    } catch (err) {
        next(err);
    };
};