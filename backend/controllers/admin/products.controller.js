const Product = require("../../models/models.products")
const ProductCategory=require("../../models/models.products-category");
const Accounts=require("../../models/models.account");
const createTreeHelpers=require("../../helpers/createTree");
const FilterStatusHelpers=require("../../helpers/FilterStatus");
const searchProductHelpers=require("../../helpers/searchProduct");
const PaginationHelpers=require("../../helpers/pagination");


//[GET] /admin/products
module.exports.index= async (req,res)=>{
    //console.log(req.query.status);

    // Bộ Lọc
    const FilterStatus=FilterStatusHelpers(req.query);
    //console.log(FilterStatus);
    //End Bộ lọc

    //xử lý trạng thái backend
    let find={
        deleted:false
    }
    if(req.query.status){
        find.status=req.query.status;
    }
    //End xử lý trạng thái backend


    // Tìm kiếm đầy đủ tên sản phẩm
    const searchProduct=searchProductHelpers(req.query);
    //console.log(searchProduct);
    if(req.query.keyword){
        find.title=searchProduct.regex;
    }
    //End tìm kiếm 


    //Phân Trang 
    const countProduct= await Product.countDocuments(find);
    let objectPagination=PaginationHelpers({
        currentPage:1,//  mặc định là trang 1
        limitPage:4 // giới hạn số lượng trong một trang
    },
    req.query,
    countProduct
);
    //End Phân Trang


    //Sort
    let sort={}

    if(req.query.sortKey && req.query.sortValue){
        sort[req.query.sortKey]=req.query.sortValue;
    }else{
        sort.position="desc";
    }
    //EndSort

    const products=await Product.find(find)
        .limit(objectPagination.limitPage)
        .skip(objectPagination.skip)
        .sort(sort);

    for (const product of products){
        //lấy ra thông tin người tạo
        const user = await Accounts.findOne({
            _id:product.createBy.account_id
        });
        if(user){
            product.accountFullname=user.fullName;
        }
        
        //lấy ra thông tin người cập nhật
        const updatedBy=product.updatedBy.slice(-1)[0];
        if(updatedBy){
            const userUpdated=await Accounts.findOne({
                _id:updatedBy.account_id
            });
            updatedBy.accountFullname=userUpdated.fullName;
        }

    }
    res.render("admin/pages/products/index",{
        title:"Trang Danh Sách Sản Phẩm",
        products:products,
        FilterStatus:FilterStatus,
        key:searchProduct.key,
        pagination:objectPagination
    });
};

//[PATH]/admin/products/change-status/:status/:id
module.exports.changeStatus = async (req,res)=>{
    //console.log(req.params);
    const status= req.params.status;
    const id=req.params.id;

    const updatedBy={
            account_id:res.locals.user.id,
            updatedAt:new Date()
        }

    await Product.updateOne({ _id: id }, { 
        status: status,
        $push:{updatedBy:updatedBy}
    });

    req.flash("success","Cập nhật trạng thái thành công!");

    res.redirect("/admin/products");
};

//[PATH]/admin/products/change-multi
module.exports.changeMulti = async (req,res)=>{
    //console.log(req.body);

    const type = req.body.type;
    const ids = req.body.ids.split(", ");

    const updatedBy={
            account_id:res.locals.user.id,
            updatedAt:new Date()
        }
    
    switch(type){
        case "active":
            await Product.updateMany({ _id: { $in: ids }}, { 
                status: "active",
                $push:{updatedBy:updatedBy}
            });
            req.flash("success",`Cập nhật trạng thái thành công ${ids.length} sản phẩm!`);
            break;

        case "inactive":
            await Product.updateMany({ _id: { $in: ids }}, { 
                status: "inactive",
                $push:{updatedBy:updatedBy}
            });
            req.flash("success",`Cập nhật trạng thái thành công ${ids.length} sản phẩm!`);
            break;

        case "delete-all":
            await Product.updateMany({_id: {$in: ids}},{deleted:true ,deletedAt: new Date() });
            req.flash("success",`Đã xóa thành công ${ids.length} sản phẩm!`);
            break;

        case "change-position":
           for (const item of ids) {
            let [id,position]=item.split("-");
            position=parseInt(position);

            await Product.updateOne({_id:id},{position:position,$push:{updatedBy:updatedBy}});
            req.flash("success",`Đã thay đổi vị trí thành công ${ids.length} sản phẩm!`);
           }
        default:
            break;
    }
    res.redirect("/admin/products");
};

//[DELETE]/admin/products/delete/:id
module.exports.deleteItem = async(req,res)=>{
    const id=req.params.id;
    //await Product.deleteOne({ _id: id});
    await Product.updateOne({ _id:id},{
        deleted:true,
        deletedBy:{
            account_id:res.locals.user.id,
            deletedAt:new Date(),
    }});
    req.flash("success",`Đã xóa thành công sản phẩm!`);
    res.redirect("/admin/products");
}
//[Get]/admin/products/create
module.exports.create = async(req,res)=>{
    console.log(res.locals.user);
    let find={
        deleted:false
    }

    const category= await ProductCategory.find(find);
    const newCategory=createTreeHelpers.tree(category);
    res.render("admin/pages/products/create",{
        title:"Thêm mới Sản Phẩm",
        category:newCategory
    });
}
//[Post]/admin/products/create
module.exports.createPost = async(req,res)=>{
    //console.log(req.file);
    console.log(req.body.title);

    req.body.price=parseInt(req.body.price);
    req.body.discountPercentage=parseInt(req.body.discountPercentage);
    req.body.stock=parseInt(req.body.stock);

    if(req.body.position ==""){
        const countProduct=await Product.countDocuments();
        req.body.position=countProduct +1;
    }else{
        req.body.position=parseInt(req.body.position);
    }

    // if(req.file){
    //     req.body.thumbnail=`/uploads/${req.file.filename}`;
    // }
    req.body.createBy={
        account_id:res.locals.user.id
    }

    const product= new Product(req.body);
    await product.save();

    //console.log(req.body);
    res.redirect("/admin/products");
}
//[Get]/admin/products/edit/id
module.exports.edit = async(req,res)=>{
    //console.log(req.params.id);
    try {
        const find={
        deleted:false,
        _id:req.params.id
    }
    
    
    const product=await Product.findOne(find);

    const category= await ProductCategory.find({
        deleted:false
    });
    const newCategory=createTreeHelpers.tree(category);
    //console.log(product);
    res.render("admin/pages/products/edit",{
        title:"Chỉnh sửa Sản Phẩm",
        product:product,
        category:newCategory
    });
        
    } catch (error) {
        req.redirect("/admin/products")
    }
}
//[PATCH]/admin/products/edit/:id
module.exports.editPatch = async(req,res)=>{
    console.log(req.file);
    req.body.price=parseInt(req.body.price);
    req.body.discountPercentage=parseInt(req.body.discountPercentage);
    req.body.stock=parseInt(req.body.stock);
    req.body.position=parseInt(req.body.position);

    if(req.file){
        req.body.thumbnail=`/uploads/${req.file.filename}`;
    }

    try {
        const updatedBy={
            account_id:res.locals.user.id,
            updatedAt:new Date()
        }


        await Product.updateOne({
            _id:req.params.id
        },{
            ...req.body,
            $push:{updatedBy:updatedBy}
        });
        req.flash("success",`Đã cập nhât thành công sản phẩm!`);
    } catch (error) {
        req.flash("error",`Đã cập nhât thành công sản phẩm!`);
    }

    //console.log(req.body);
    res.redirect("/admin/products");
}

//[Get]/admin/products/detail/:id
module.exports.detail = async(req,res)=>{
    //console.log(req.params.id);
    try {
        const find={
        deleted:false,
        _id:req.params.id
    }

    const product=await Product.findOne(find);
    //console.log(product);
    res.render("admin/pages/products/detail.pug",{
        title:product.title,
        product:product
    });
    } catch (error) {
        req.redirect("/admin/products")
    }
}