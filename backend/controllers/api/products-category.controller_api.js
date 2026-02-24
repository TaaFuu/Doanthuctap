const ProductCategory=require("../../models/models.products-category");

const createTreeHelpers=require("../../helpers/createTree_API");

module.exports.index = async(req,res)=>{
    let find={
        deleted:false,
    }

    const records= await ProductCategory.find(find);
    const newRecords=createTreeHelpers.tree(records);
    res.json(newRecords);
}


