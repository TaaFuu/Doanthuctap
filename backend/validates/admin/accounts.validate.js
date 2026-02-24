module.exports.createPost = async(req,res,next) =>{
    
    //console.log(req.body.title);

    if(!req.body.fullName){
        req.flash("error",`Vui lòng nhập họ tên!`);
        res.redirect("/admin/products/create");
        return;
    }

    if(!req.body.email){
        req.flash("error",`Vui lòng nhập email!`);
        res.redirect("/admin/products/create");
        return;
    }

    if(!req.body.password){
        req.flash("error",`Vui lòng nhập mật khẩu!`);
        res.redirect("/admin/products/create");
        return;
    }
    next();
}

module.exports.editPatch = async(req,res,next) =>{
    
    //console.log(req.body.title);

    if(!req.body.fullName){
        req.flash("error",`Vui lòng nhập họ tên!`);
        res.redirect("/admin/products/create");
        return;
    }

    if(!req.body.email){
        req.flash("error",`Vui lòng nhập email!`);
        res.redirect("/admin/products/create");
        return;
    }

    
    next();
}