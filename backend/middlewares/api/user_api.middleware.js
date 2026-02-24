const User = require("../../models/models.user");

module.exports.infoUser = async (req, res, next) => {
    if (req.cookies.tokenUser) {
        const user = await User.findOne({
            tokenUser: req.cookies.tokenUser,
            deleted: false
        }).select("-password");

        if (user) {
            req.user = user;
        }
    }
    next();
};
