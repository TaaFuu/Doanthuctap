// const Product=require("../../models/models.products");
// const ProductCategory=require("../../models/models.products-category");
// const productHelper=require("../../helpers/products")
// const productCategoryHelper=require("../../helpers/products-category")

// module.exports.index= async (req,res)=>{
//     const products = await Product.find({
//          status:"active",
//          deleted:false
//     }).sort({position: "desc"});
    
//     // console.log(newProduct);
//     const newProduct=productHelper.priceNewProducts(products);
//     res.render("client/pages/products/index.pug",{
//         Title:"Danh Sách Sản Phẩm",
//         Product:newProduct
//     });
// }


// module.exports.detail= async (req,res)=>{
//     //console.log(req.params.slugProduct);
//     try {
//         const find={
//         deleted:false,
//         slug:req.params.slugProduct,
//         status:"active"
//     };

//     const product=await Product.findOne(find);

//     if(product.product_category_id){
//         const category=await ProductCategory.findOne({
//             _id:product.product_category_id,
//             status:"active",
//             deleted:false
//         });
//         product.category=category;
//     }

//     product.priceNew=productHelper.priceNewProduct(product);

//     //console.log(product);
//     res.render("client/pages/products/detail.pug",{
//         pageTitle:product.title,
//         product: product
//     });

//     } catch (error) {
//         res.redirect(`/products`);
//     }

// }


// module.exports.category= async (req,res)=>{
//     //console.log(req.params.slugCategory);

//     const category= await ProductCategory.findOne({
//         slug:req.params.slugCategory,
//         status:"active",
//         deleted:false
//     });

//     //console.log(category.id);
    
    
//     const listSubCategory=await productCategoryHelper.getSubCategory(category.id);
//     const listSubCategoryId=listSubCategory.map(item=>item.id);

//     console.log(listSubCategoryId)

//     const products = await Product.find({
//         product_category_id:{$in: [category.id, ...listSubCategoryId]},
//         deleted:false
//     }).sort({position: "desc"});

//     const newProducts=productHelper.priceNewProducts(products);
//     //console.log(products)

//     res.render("client/pages/products/index.pug",{
//         Title:category.title,
//         Product:newProducts
//     });
// }