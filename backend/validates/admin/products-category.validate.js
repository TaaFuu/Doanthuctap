module.exports.createPost = async(req,res,next) =>{
    
    //console.log(req.body.title);

    if(!req.body.title){
        req.flash("error",`Vui lòng nhập tiêu đề!`);
        res.redirect("/admin/products/create");
        return;
    }
    next();
} 