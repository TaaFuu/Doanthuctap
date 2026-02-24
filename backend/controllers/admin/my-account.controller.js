const md5=require('md5');
const Accounts=require("../../models/models.account");

module.exports.index= async(req,res)=>{
    res.render("admin/pages/my-account/index",{
        title:"Thông tin cá nhân",
    });
}


module.exports.edit= async(req,res)=>{
    res.render("admin/pages/my-account/edit",{
        title:"Chỉnh sửa thông tin cá nhân ",
    });
}


module.exports.editPatch=async(req,res)=>{
    const id=res.locals.user.id;

    const emailCheck=await Accounts.findOne({
        _id:{$ne:id},
        email: req.body.email,
        deleted:false,
    });

    if(emailCheck){
        req.flash("error",`Email ${req.body.email} đã tồn tại`);
    }else{
        if(req.body.password){
        req.body.password=md5(req.body.password);
    }else{
        delete req.body.password;
    }
    
    await Accounts.updateOne({_id:id},req.body);
    req.flash("success","Cập nhật tài khoản thành công!");
    
    }

    
    res.redirect("/admin/my-account/edit")
}