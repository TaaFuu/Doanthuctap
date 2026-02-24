// const User=require("../../models/models.user");
// const md5=require("md5");
// const ForgotPassword=require("../../models/models.forgot-password");
// const generateHelper=require("../../helpers/generate");
// const sendMailHelper=require("../../helpers/sendMail");
// const Cart=require("../../models/models.carts");



// module.exports.register= async (req,res)=>{
//     res.render("client/pages/user/register",{
//         Title:"Đăng kí tài khoảng",
//     });
// }

// module.exports.registerPost= async (req,res)=>{
//     //console.log(req.body);
//     const existEmail=await User.findOne({
//         email:req.body.email
//     });

//     if(existEmail){
//         req.flash("error","Email đã tồn tại");
//         res.redirect("/user/register")
//         return;

//     }
//     req.body.password=md5(req.body.password);
//     const user=new User(req.body);
//     await user.save();

//     res.cookie("tokenUser",user.tokenUser);

//     res.redirect("/");
// }


// module.exports.login= async (req,res)=>{
//     res.render("client/pages/user/login",{
//         Title:"Đăng nhập tài khoản",
//     });
// }

// module.exports.loginPost= async (req,res)=>{
//     const email=req.body.email;
//     const password=req.body.password;

//     const user=await User.findOne({
//         email:email,
//         deleted:false
//     });
//     //console.log(user);

//     if(!user){
//         req.flash("error","Email không tồn tại!");
//         res.redirect("/user/login");
//         return;
//     }
//     if(md5(password) !== user.password){
//         req.flash("error","Sai mật khẩu");
//         res.redirect("/user/login");
//         return;
//     }
//     // if(user.status === "inactive"){
//     //     req.flash("error","tài khoản bị khóa");
//     //     res.redirect("/user/login");
//     //     return;
//     // }

//     const cart= await Cart.findOne({
//         user_id:user.id
//     })
//     if(cart){
//         res.cookie("cartId",cart.id);
//     }else{
//         await Cart.updateOne({
//             _id:req.cookies.cartId
//         },{
//             user_id:user.id
//         });
//     }

//     res.cookie("tokenUser",user.tokenUser);
//     res.redirect("/");
// }


// module.exports.logout= async (req,res)=>{
//     res.clearCookie("tokenUser");
//     res.clearCookie("cartId");
//     res.redirect("/");
// }

// module.exports.forgotPassword= async (req,res)=>{
//     res.render("client/pages/user/forgot-password",{
//         pageTitle:"Lấy lại mật khẩu"
//     })
// }

// module.exports.forgotPasswordPost= async (req,res)=>{
//     const email=req.body.email;
//     const user= await User.findOne({
//         email:email,
//         deleted:false
//     });
//     if(!user){
//         req.flash("error","Email không tồn tại!");
//         res.redirect("/user/forgot-password");
//         return;
//     }

//     //Lưu thông tin vào DB
//     const otp=generateHelper.generateRandomNumber(8);
//     const objectForgotPassword={
//         email:email,
//         otp:otp,
//         expireAt: Date.now()
//     }
//     const forgotPassword=new ForgotPassword(objectForgotPassword);
//     await forgotPassword.save();

//     //Nếu tồn tại email thì gửi mã OTP qua email
//     const subject="Mã OTP xác minh lấy lại mật khẩu";
//     const html=`
//         Mã OTP để lấy lại mật khẩu  <b>${otp}</b> .Thời hạn sử dụng là 3 phút
//     `
//     sendMailHelper.sendMail(email,subject,html);
//     res.redirect(`/user/password/otp?email=${email}`);

// }

// module.exports.otpPassword= async (req,res)=>{
//     const email=req.query.email;
//     res.render("client/pages/user/otp-password",{
//         Title:"Nhập mã otp",
//         email:email
//     });
// }

// module.exports.otpPasswordPost= async (req,res)=>{
//     const email=req.body.email;
//     const otp=req.body.otp;

//     const result=await ForgotPassword.findOne({
//         email:email,
//         otp:otp
//     });
//     if(!result){
//         req.flash("error","OTP không hợp lệ!");
//         res.redirect("/user/otp-password");
//         return;
//     }
//     const user=await User.findOne({
//         email:email
//     });
//     res.cookie("tokenUser",user.tokenUser);

//     res.redirect("/user/password/reset");
// }


// module.exports.resetPassword= async (req,res)=>{
//     res.render("client/pages/user/reset-password",{
//         pageTitle:"Đổi mật khẩu",
//     })
// }

// module.exports.resetPasswordPost= async (req,res)=>{
//     const password=req.body.password;
//     const tokenUser=req.cookies.tokenUser;

//     await User.updateOne({
//         tokenUser:tokenUser
//     },{
//         password:md5(password)
//     })

//     res.redirect("/");
    
// }


// module.exports.info=async(req,res)=>{

//     res.render("client/pages/user/info",{
//         pageTitle:"Thông tin tài khoản",
//     })
// }