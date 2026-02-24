const md5 = require("md5");
const Accounts=require("../../models/models.account");

module.exports.login=async(req,res)=>{
    if(req.cookies.token){
        res.redirect("/admin/dashboard");
    }else{
         res.render("admin/pages/auth/login",{
        pageTitle:"Trang đăng nhập"
    })
    }
}


module.exports.loginPost=async(req,res)=>{
    const email=req.body.email;
    const password=req.body.password;
    const user= await Accounts.findOne({
        email:email,
        deleted:false,
    })
    if(!user){
        req.flash("error","Email không tồn tại!");
        res.redirect("/admin/auth/login");
        return;
    }
    if(md5(password)!=user.password){
        req.flash("error","Sai mật khẩu");
        res.redirect("/admin/auth/login");
        return;
    }

    if(user.status=="inactive"){
        req.flash("error","Tài khoản đã bị khóa");
        res.redirect("/admin/auth/login");
        return;
    }

    res.cookie("token",user.token);

    res.redirect("/admin/dashboard");
}

module.exports.logout=async(req,res)=>{
    res.clearCookie("token");
    res.redirect("/admin/auth/login");
}