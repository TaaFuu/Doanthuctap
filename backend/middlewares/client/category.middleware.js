// const ProductCategory=require("../../models/models.products-category");
// const createTreeHelpers=require("../../helpers/createTree");

// module.exports.category = async(req,res,next)=>{
//     const find={
//         deleted:false
//     }

//     const productsCategory= await ProductCategory.find(find);
//     const newProductsCategory=createTreeHelpers.tree(productsCategory)

//     res.locals.layoutProductsCategory=newProductsCategory
//     next();
// }