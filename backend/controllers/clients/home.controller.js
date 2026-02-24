// const Product=require("../../models/models.products");
// const productHelper=require("../../helpers/products")
// const createTreeHelpers=require("../../helpers/createTree");

// module.exports.index= async (req,res)=>{
//     // Lấy sản phẩm nổi bật
//     const productsFeatured=await Product.find({
//         featured:"1",
//         deleted:false,
//         status:"active"
//     }).limit(6);
//     const newProductsFeatured=productHelper.priceNewProducts(productsFeatured);
//     //end lấy sản phẩm nổi bật



//     //Lấy sản phẩm mới nhất
//     const productsNew=await Product.find({
//         deleted:false,
//         status:"active"
//     }).sort({position:"desc"}).limit(6);
//     const newProductsNew=productHelper.priceNewProducts(productsNew);
//     //End lấy sản phẩm mới nhất


//     res.render("client/pages/home/index.pug",{
//         pageTitle:"Trang chủ",
//         productsFeatured:newProductsFeatured,
//         productsNew:newProductsNew
//     });
// }