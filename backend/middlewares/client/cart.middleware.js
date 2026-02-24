// const Cart=require("../../models/models.carts");
// module.exports.cartId = async(req,res,next)=>{
//     //console.log("Chạy vào đây");
//     //console.log(req.cookies.cartId);
//     if(!req.cookies.cartId){
//         const cart=new Cart();
//         await cart.save();

//         const expiresCookie=365*24*60*60*1000;

//         res.cookie("cartId",cart.id,{
//             expires: new Date(Date.now()+expiresCookie)
//         });
//     }else{
//         const cart=await Cart.findOne({
//             _id:req.cookies.cartId
//         });
//         cart.totalQuantity=cart.products.reduce((sum,item)=>sum+item.quantity,0);
//         res.locals.miniCart=cart;
//     }

//     next();
// }