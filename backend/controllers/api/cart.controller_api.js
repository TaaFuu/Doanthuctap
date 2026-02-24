const Cart = require("../../models/models.carts");
const Product = require("../../models/models.products");
const productsHelper = require("../../helpers/products");

// Lấy giỏ hàng
module.exports.index = async (req, res) => {
  try {
    const cart = req.cart;
    if (!cart) {
      return res.status(401).json({ code: 401, message: 'Vui lòng đăng nhập' });
    }

    if (cart.products && cart.products.length > 0) {
      const populatedProducts = await Promise.all(
        cart.products.map(async (item) => {
          const product = await Product.findById(item.product_id);
          return {
            product_id: item.product_id,
            quantity: item.quantity,
            product: product ? {
              _id: product._id,
              title: product.title || product.name,
              price: product.price,
              thumbnail: product.thumbnail,
              image: product.image,
              images: product.images
            } : null
          };
        })
      );

      const validProducts = populatedProducts.filter((p) => p.product !== null);

      res.json({
        code: 200,
        cart: {
          ...cart.toObject(),
          products: validProducts,
        },
      });
    } else {
      res.json({ code: 200, cart });
    }
  } catch (err) {
    console.error('Error fetching cart:', err);
    res.status(500).json({ code: 500, message: 'Lỗi server' });
  }
};

// Thêm sản phẩm vào giỏ hàng (reserve stock nguyên tử)
module.exports.addProduct = async (req, res) => {
  const product_id = req.params.productId;   // lấy từ route
  const quantity = Number(req.body.quantity) || 1;            // số lượng từ body
  let cart = req.cart;                     // middleware đã gán

  console.log('[cart.addProduct] product_id=', product_id, 'quantity=', quantity, 'cart_id=', cart?._id, 'user=', cart?._doc?.user_id || cart?.user_id || 'n/a');

  if (!cart) {
    res.status(401).json({ code: 401, message: "Vui lòng đăng nhập" });
    return;
  }

  // Kiểm tra sản phẩm tồn tại
  const product = await Product.findById(product_id);
  if (!product) {
    res.status(400).json({ code: 400, message: "Sản phẩm không tồn tại" });
    return;
  }

  // Kiểm tra không cho thêm vượt quá stock (dựa trên số lượng đang có trong giỏ )
  const indexExist = cart.products.findIndex(p => p.product_id.toString() === product_id.toString());
  const existingQty = indexExist >= 0 ? cart.products[indexExist].quantity : 0;
  if (product.stock < existingQty + quantity) {
    res.status(400).json({ code: 400, message: `Chỉ còn ${product.stock} sản phẩm trong kho` });
    return;
  }

  // Cập nhật cart (không giảm stock ở đây)
  const index = indexExist; // reuse
  if (index >= 0) {
    cart.products[index].quantity = cart.products[index].quantity + quantity;
  } else {
    cart.products.push({ product_id, quantity });
  }

  // Save cart, nếu lỗi khi save thì rollback 
  const saved = await cart.save().then(() => true).catch(async (errSave) => {
    await Product.updateOne({ _id: product_id }, { $inc: { stock: quantity } });
    console.log("Lỗi khi lưu cart, đã rollback stock:", errSave);
    res.status(500).json({ code: 500, message: "Lỗi server" });
    return false;
  });
  if (!saved) return;

  cart = await Cart.findById(cart._id);

  const populatedProducts = await Promise.all(
    cart.products.map(async (item) => {
      const product = await Product.findById(item.product_id);
      return {
        product_id: item.product_id,
        quantity: item.quantity,
        product: product ? {
          _id: product._id,
          title: product.title || product.name,
          price: product.price,
          thumbnail: product.thumbnail,
          image: product.image,
          images: product.images
        } : null
      };
    })
  );

  const totalQuantity = populatedProducts.reduce((sum, item) => sum + item.quantity, 0);

  res.json({
    code: 200,
    message: "Đã thêm vào giỏ hàng",
    cart: {
      ...cart.toObject(),
      products: populatedProducts,
      totalQuantity
    }
  });
};



// Xóa sản phẩm 
module.exports.delete = async (req, res) => {
  const product_id = req.params.productId; // lấy từ route
  let cart = req.cart;

  if (!cart) {
    res.status(401).json({ code: 401, message: "Vui lòng đăng nhập" });
    return;
  }

  // Lấy số lượng sẽ xóa để trả lại kho
  const found = cart.products.find(p => p.product_id.toString() === product_id.toString());
  const removedQty = found ? found.quantity : 0;

  cart.products = cart.products.filter(p => p.product_id.toString() !== product_id.toString());

  const saved = await cart.save().then(() => true).catch((errSave) => {
    console.log("Lỗi khi lưu cart:", errSave);
    res.status(500).json({ code: 500, message: "Lỗi server" });
    return false;
  });
  if (!saved) return;

  cart = await Cart.findById(cart._id);

  const populatedProducts = await Promise.all(
    cart.products.map(async (item) => {
      const product = await Product.findById(item.product_id);
      return {
        product_id: item.product_id,
        quantity: item.quantity,
        product: product ? {
          _id: product._id,
          title: product.title || product.name,
          price: product.price,
          thumbnail: product.thumbnail,
          image: product.image,
          images: product.images
        } : null
      };
    })
  );

  // Tính tổng số lượng
  const totalQuantity = populatedProducts.reduce((sum, item) => sum + item.quantity, 0);

  res.json({
    code: 200,
    message: "Đã xóa sản phẩm",
    cart: {
      ...cart.toObject(),
      products: populatedProducts,
      totalQuantity
    }
  });
};

