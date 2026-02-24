module.exports.registerPost = async(req,res,next) =>{
    
    //console.log(req.body.title);

    if(!req.body.fullName){
        req.flash("error",`Vui lòng nhập họ tên!`);
        res.redirect("/client/user/register");
        return;
    }

    if(!req.body.email){
        req.flash("error",`Vui lòng nhập email!`);
        res.redirect("/client/user/register");
        return;
    }

    if(!req.body.password){
        req.flash("error",`Vui lòng nhập mật khẩu!`);
        res.redirect("/client/user/register");
        return;
    }
    next();
}


module.exports.loginPost = async(req,res,next) =>{
    
    //console.log(req.body.title);
    if(!req.body.email){
        req.flash("error",`Vui lòng nhập email!`);
        res.redirect("/client/user/login");
        return;
    }

    if(!req.body.password){
        req.flash("error",`Vui lòng nhập mật khẩu!`);
        res.redirect("/client/user/login");
        return;
    }
    next();
}

module.exports.forgotPasswordPost = async(req,res,next) =>{
    
    //console.log(req.body.title);
    if(!req.body.email){
        req.flash("error",`Vui lòng nhập email!`);
        res.redirect("/client/user/forgot-password");
        return;
    }

    next();
}

module.exports.resetPasswordPost = async(req,res,next) =>{
    
    if(!req.body.password){
        req.flash("error",`Vui lòng nhập mật khẩu!`);
        res.redirect("/client/user/reset");
        return;
    }
    if(!req.body.confirmPassword){
        req.flash("error",`Vui lòng xác nhập mật khẩu!`);
        res.redirect("/client/user/reset");
        return;
    }

    if(req.body.password !=req.body.confirmPassword){
        req.flash("error",`Mật khẩu không khớp!`);
        res.redirect("/client/user/reset");
        return;
    }

    next();
}