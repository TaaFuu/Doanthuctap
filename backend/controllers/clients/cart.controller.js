// const Cart=require("../../models/models.carts");
// const Product = require("../../models/models.products");
// const productsHelper=require("../../helpers/products");


// module.exports.index= async (req,res)=>{
//     const cartId=req.cookies.cartId;
//     const cart= await Cart.findOne({
//         _id:cartId
//     });

//     if(cart.products.length>0){
//         for (const item of cart.products) {
//             const productId=item.product_id;
//             const productInfo= await Product.findOne({
//                 _id:productId,
//             }).select("title thumbnail slug price discountPercentage");

//             productInfo.priceNew=productsHelper.priceNewProduct(productInfo);

//             item.productInfo=productInfo;
//             item.totalPrice=productInfo.priceNew * item.quantity;

//         }
//     }
//     cart.totalPrice= cart.products.reduce((sum,item)=>sum + item.quantity * item.productInfo.priceNew,0);

//     //console.log(cart);
//     res.render("client/pages/cart/index.pug",{
//         Title:"Giỏ hàng",
//         cartDetail:cart
//     });
// }


// module.exports.addPost= async(req,res)=>{
//     const productId=req.params.productId;
//     const quantity= parseInt(req.body.quantity);
//     const cartId=req.cookies.cartId;


//     const cart=await Cart.findOne({
//         _id:cartId
//     });
//     const existProductInCart=cart.products.find(item=>item.product_id == productId);

//     if(existProductInCart){
//         const quantityNew= quantity + existProductInCart.quantity;
//         await Cart.updateOne({
//             _id:cartId,
//             "products.product_id":productId
//         },{
//             $set:{
//                 "products.$.quantity":quantityNew
//             }
//         })
//     }else{
//         const objectCart={
//             product_id:productId,
//             quantity:quantity
//         };

//         await Cart.updateOne(
//             {
//                 _id:cartId
//             },
//             {
//                 $push:{products:objectCart}
//             }
//         );
//     }
//     req.flash("success","Đã thêm sản phẩm vào giỏ hàng!");
    
//     res.redirect(`/products/detail/${productId}`);
// }

// module.exports.delete= async(req,res)=>{
//     //console.log(req.params.productId);
//     const cartId=req.cookies.cartId;
//     const productId=req.params.productId;

//     await Cart.updateOne(
//         {
//             _id:cartId
//         },{
//             $pull:{products: {product_id:productId}}
//         });


//     req.flash("success","Đã xóa thành công khỏi giỏ hàng ");
//     res.redirect(`/cart`);
// }

// module.exports.update= async(req,res)=>{
//     //console.log(req.params.productId);
//     const cartId=req.cookies.cartId;
//     const productId=req.params.productId;
//     const quantity=req.params.quantity;

//     await Cart.updateOne(
//         {
//          _id:cartId,
//         "products.product_id":productId,
//         },{
//             $set:{"products.$.quantity": quantity},
//         });


//     req.flash("success","Đã cập nhật số lượng thành công ");
//     res.redirect(`/cart`);
// }
