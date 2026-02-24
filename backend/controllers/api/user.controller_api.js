const md5 = require("md5")
const User = require("../../models/models.user");
const generateHelper = require("../../helpers/generate");
const sendMailHelper = require("../../helpers/sendMail");
const ForgotPassword = require("../../models/models.forgot-password");
const Cart = require("../../models/models.carts");

module.exports.register = async (req, res) => {
    req.body.password = md5(req.body.password);
    const expiresCookie = 365 * 24 * 60 * 60 * 1000;
    const existEmail = await User.findOne({
        email: req.body.email,
        deleted: false
    });

    if (existEmail) {
        res.json({
            code: 400,
            message: "Email đã tồn tại"
        });
    } else {
        const user = new User({
            fullName: req.body.fullName,
            email: req.body.email,
            password: req.body.password
        });
        await user.save();
        const token = user.tokenUser;
        res.cookie("tokenUser", token, {
            httpOnly: true,
            sameSite: "lax",
            maxAge: expiresCookie
        });

        //Thông tin người dùng 
        const userInfo = {
            _id: user._id,
            fullName: user.fullName,
            email: user.email
        }

        res.json({
            code: 200,
            message: "Tạo Tài Khoản Thành Công!",
            tokenUser: token,
            userInfo: userInfo
        });
    }
}

module.exports.login = async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    const expiresCookie = 365 * 24 * 60 * 60 * 1000;
    const user = await User.findOne({
        email: email,
        deleted: false
    });

    if (!user) {
        res.json({
            code: 400,
            message: "Email không tồn tại!"
        });
        return;
    }
    if (md5(password) != user.password) {
        res.json({
            code: 400,
            message: "Sai mật khẩu"
        });
        return;
    }
    const token = user.tokenUser;
    const userInfo = {
        _id: user._id,
        fullName: user.fullName,
        email: user.email
    }
    //res.cookie("tokenUser",token);
    res.cookie("tokenUser", token, {
        httpOnly: true,
        sameSite: "lax",
        maxAge: expiresCookie
    });

    const cart = await Cart.findOne({
        user_id: user.id
    })
    if (cart) {
        res.cookie("cartId", cart.id, {
            httpOnly: true,
            sameSite: "lax",
            maxAge: expiresCookie
        });
    } else {
        await Cart.updateOne({
            _id: req.cookies.cartId
        }, {
            user_id: user.id
        });
    }
    res.json({
        code: 200,
        message: "Đăng nhập thành công!",
        token: token,
        userInfo: userInfo
    });


}


module.exports.logout = async (req, res) => {
    res.clearCookie("cartId", { httpOnly: true, sameSite: "lax" });
    res.clearCookie("tokenUser", { httpOnly: true, sameSite: "lax" });

    res.json({
        code: 200,
        message: "Đăng xuất thành công!"
    });
}

module.exports.forgotPassword = async (req, res) => {
    const email = req.body.email;
    const user = await User.findOne({
        email: email,
        deleted: false,
    });
    if (!user) {
        res.json({
            code: 400,
            message: "Email không tồn tại"
        });
        return;
    }
    const otp = generateHelper.generateRandomNumber(8);
    const objectForgotPassword = {
        email: email,
        otp: otp,
        expireAt: Date.now()
    }
    //console.log(objectForgotPassword);
    const forgotPassword = new ForgotPassword(objectForgotPassword);
    await forgotPassword.save();


    //Gửi mã OTP
    const subject = "Mã OTP xác minh lấy lại mật khẩu";
    const html = `
        Mã OTP để lấy lại mật khẩu của bạn là <b>${otp}</b>
    `
    sendMailHelper.sendMail(email, subject, html);


    res.json({
        code: 200,
        message: "Đã gửi mã OTP qua email!"
    });


}

module.exports.otpPassword = async (req, res) => {
    const email = req.body.email;
    const otp = req.body.otp;

    const result = await ForgotPassword.findOne({
        email: email,
        otp: otp
    });

    if (!result) {
        res.json({
            code: 400,
            message: "OTP không hợp lệ!"
        });
        return;
    }
    const user = await User.findOne({
        email: email
    });
    const token = user.tokenUser;
    //res.cookie("tokenUser",token);
    res.json({
        code: 200,
        message: "Xác thực thành công!",
        token: token
    });
}

module.exports.resetPassword = async (req, res) => {
    const token = req.body.token;
    const password = req.body.password;

    const user = await User.findOne({
        tokenUser: token,
    });
    if (md5(password) === user.password) {
        res.json({
            code: 400,
            message: "Vui lòng nhập mật khẩu mới khác với mật khẩu cũ."
        });
        return;
    }
    await User.updateOne(
        {
            tokenUser: token,
        }, {
        password: md5(password),
    }
    );
    res.json({
        code: 200,
        message: "Đổi mật khẩu thành công!"
    });
}

module.exports.profile = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                code: 401,
                message: "Chưa đăng nhập"
            });
        }

        res.json({
            code: 200,
            user: {
                _id: req.user._id,
                fullName: req.user.fullName,
                email: req.user.email
            }
        });
    } catch (err) {
        console.error('Error getting profile:', err);
        res.status(500).json({
            code: 500,
            message: "Lỗi server"
        });
    }
}