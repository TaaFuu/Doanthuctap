const Role=require("../../models/models.roles");


module.exports.index= async (req,res)=>{
    let find={
        deleted:false
    }
    const record= await Role.find(find);

    res.render("admin/pages/roles/index",{
        title:"Nhóm quyền",
        records:record
    });
}
module.exports.create= async (req,res)=>{

    res.render("admin/pages/roles/create",{
        title:"Tạo nhóm quyền",
    });
}

module.exports.createPost= async (req,res)=>{
    console.log(req.body);

    const record= new Role(req.body)
    await record.save();
    
    res.redirect("/admin/roles");
}

module.exports.edit= async (req,res)=>{
    try {
        const id=req.params.id;

    let find={
        _id:id,
        deleted:false,
    }
    const data= await Role.findOne(find);
    console.log(data);
    res.render("admin/pages/roles/edit",{
        title:"Sửa nhóm quyền",
        data:data,
    });
    } catch (error) {
        res.redirect("/admin/roles");
    }
}

module.exports.editPatch= async (req,res)=>{
    try {
        const id=req.params.id;

        await Role.updateOne({_id:id},req.body);
        req.flash("success","cập nhật thành công");
    } catch (error) {
        req.flash("error","cập nhật thất bại");
    }

    res.redirect("/admin/roles");
}

module.exports.permissions= async (req,res)=>{
    let find={
        deleted:false,
    }
    const record= await Role.find(find);
    res.render("admin/pages/roles/permissions",{
        PageTitle:"Phân quyền",
        records:record,
    });
}

module.exports.permissionsPatch= async (req,res)=>{
    const permissions=JSON.parse(req.body.permissions);
    //console.log(permissions);
    for (const item of permissions) {
        await Role.updateOne({_id:item.id},{permissions: item.permissions}) 
    }
    req.flash("success","cập nhật thành công");
    
    res.redirect("/admin/roles/permissions");

}