const Cart = require("../../models/models.carts");

module.exports.cartId = async (req, res, next) => {
    try {
        let cart;

        // Nếu user đã login: giữ nguyên hành vi (tạo cart nếu chưa có)
        if (req.user) {
            cart = await Cart.findOne({ user_id: req.user._id.toString() });

            if (!cart) {
                cart = new Cart({
                    user_id: req.user._id.toString(),
                    products: []
                });
                await cart.save();
            }
            req.cart = cart;
        } else {
            // User chưa login: chỉ load cart nếu client gửi cookie `cartId`.
            // KHÔNG tự động tạo cart ẩn danh mới và KHÔNG đặt cookie mới.
            if (req.cookies && req.cookies.cartId) {
                try {
                    cart = await Cart.findById(req.cookies.cartId);
                } catch (err) {
                    cart = null;
                }
                if (cart) req.cart = cart;
                else req.cart = null; // không tạo cart mới
            } else {
                req.cart = null; // không có cart cho user chưa đăng nhập
            }
        }

        // Tính tổng số lượng tạm thời nếu có cart
        if (req.cart) {
            req.cart.totalQuantity = req.cart.products.reduce(
                (sum, item) => sum + item.quantity,
                0
            );
        }

        next();
    } catch (error) {
        console.log("Lỗi middleware cartId:", error);
        next(error);
    }
};
