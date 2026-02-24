const systemConfig=require("../../config/sytem");
const Accounts=require("../../models/models.account");
const Role=require("../../models/models.roles");
module.exports.requireAuth = async(req,res,next)=>{

    if(!req.cookies.token){
        res.redirect(`${systemConfig.prefixAdmin}/auth/login`);
    }else{
        const user= await Accounts.findOne({token:req.cookies.token}).select("-password");
        if(!user){
            res.redirect(`${systemConfig.prefixAdmin}/auth/login`);
        }else{
            const role=await Role.findOne({
                _id:user.role_id
            }).select("title permissions");

            res.locals.role=role;
            res.locals.user=user;
            next();
        }
    }
}