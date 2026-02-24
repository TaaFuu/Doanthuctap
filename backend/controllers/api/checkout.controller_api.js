const Cart = require("../../models/models.carts");
const Product = require("../../models/models.products");
const Order = require("../../models/models.order");

module.exports.order = async (req, res) => {
    // Kiểm tra user đã login hay chưa
    if (!req.user) {
        res.status(401).json({ code: 401, message: "Vui lòng đăng nhập để đặt hàng" });
        return;
    }

    const userInfo = req.body.userInfo;
    const paymentMethod = req.body.paymentMethod || "cod";

    console.log("Order Request - userInfo:", userInfo);
    console.log("Order Request - paymentMethod:", paymentMethod);

    // Validate userInfo
    if (!userInfo || !userInfo.fullName || !userInfo.phone || !userInfo.address) {
        console.log("Xác thực thất bại");
        res.status(400).json({ code: 400, message: "Vui lòng nhập đầy đủ thông tin người nhận" });
        return;
    }

    // Lấy giỏ hàng của user từ middleware
    const cart = req.cart;

    console.log("Cart:", cart);

    if (!cart || !cart.products || cart.products.length === 0) {
        console.log("Cart is empty");
        res.status(400).json({ code: 400, message: "Giỏ hàng rỗng" });
        return;
    }

    // Build product list with full product details
    const products = [];
    for (const item of cart.products) {
        // Lấy product từ DB
        const product = await Product.findById(item.product_id).select("title price discountPercentage thumbnail image images");

        if (!product) {
            res.status(400).json({ code: 400, message: "Sản phẩm không tồn tại", productId: item.product_id });
            return;
        }

        // Chống undefined
        const price = Number(product.price) || 0;
        const discount = Number(product.discountPercentage) || 0;
        const quantity = Number(item.quantity) || 1;

        products.push({ product_id: item.product_id, title: product.title, price, discountPercentage: discount, quantity, thumbnail: product.thumbnail });
    }

    // Tính tổng tiền an toàn
    const totalPrice = products.reduce((sum, item) => {
        const priceNew = item.price - (item.price * item.discountPercentage / 100);
        return sum + (priceNew * item.quantity);
    }, 0);

    // Giảm stock nguyên tử cho từng sản phẩm khi đặt hàng
    // Nếu có sản phẩm không đủ, rollback những sản phẩm đã giảm trước đó và trả lỗi
    const decremented = [];
    for (const item of products) {
        const qty = Number(item.quantity) || 1;
        const updated = await Product.findOneAndUpdate(
            { _id: item.product_id, stock: { $gte: qty } },
            { $inc: { stock: -qty } }
        );
        if (!updated) {
            // rollback
            for (const d of decremented) {
                await Product.updateOne({ _id: d.product_id }, { $inc: { stock: d.quantity } });
            }
            res.status(400).json({ code: 400, message: `Sản phẩm không đủ số lượng: ${item.title || item.product_id}` });
            return;
        }
        decremented.push({ product_id: item.product_id, quantity: qty });
    }

    // Tạo đơn hàng sau khi giảm stock thành công
    const order = await Order.create({
        user_id: req.user._id.toString(),
        cart_id: cart._id.toString(),
        userInfo,
        products,
        totalPrice,
        paymentMethod: paymentMethod,
        paymentStatus: paymentMethod === "cod" ? "pending" : "pending"
    });

    // Clear giỏ hàng
    await Cart.updateOne({ _id: cart._id }, { products: [] });

    res.json({ code: 200, message: "Đặt hàng thành công", orderId: order._id, paymentMethod: paymentMethod });
};
