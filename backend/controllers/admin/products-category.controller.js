const ProductCategory = require("../../models/models.products-category");

const createTreeHelpers = require("../../helpers/createTree");

module.exports.index = async (req, res) => {
    let find = {
        deleted: false,
    }

    const records = await ProductCategory.find(find);
    const newRecords = createTreeHelpers.tree(records);
    console.log(newRecords);
    res.render("admin/pages/products-category/index", {
        pageTitle: "Danh mục sản phẩm",
        record: newRecords
    });
}

module.exports.create = async (req, res) => {
    let find = {
        deleted: false,
    }


    const records = await ProductCategory.find(find);
    const newRecords = createTreeHelpers.tree(records);
    console.log(newRecords);

    //console.log(records);
    res.render("admin/pages/products-category/create", {
        pageTitle: "Danh mục sản phẩm",
        record: newRecords,
    });
}

module.exports.createPost = async (req, res) => {
    if (req.body.position == "") {
        const countProduct = await ProductCategory.countDocuments();
        req.body.position = countProduct + 1;
    } else {
        req.body.position = parseInt(req.body.position);
    }
    const record = new ProductCategory(req.body);
    await record.save();

    res.redirect("/admin/products-category");
}

module.exports.edit = async (req, res) => {
    try {
        const id = req.params.id;
        //console.log(id);

        const data = await ProductCategory.findOne({
            _id: id,
            deleted: false
        });
        //console.log(data);
        const record = await ProductCategory.find({
            deleted: false
        });

        const newRecords = createTreeHelpers.tree(record);

        res.render("admin/pages/products-category/edit", {
            pageTitle: "Chỉnh Sửa Danh mục sản phẩm",
            data: data,
            record: newRecords
        });
    } catch (error) {
        res.redirect("/admin/products-category");
    }
}

module.exports.editPatch = async (req, res) => {
    const id = req.params.id;
    console.log(req.body);
    req.body.position = parseInt(req.body.position);

    await ProductCategory.updateOne({ _id: id }, req.body);
    res.redirect("/admin/products-category");
}

module.exports.delete = async (req, res) => {
    const id = req.params.id;
    await ProductCategory.updateOne({ _id: id }, {
        deleted: true,
        deletedBy: {
            account_id: res.locals.user.id,
            deletedAt: new Date(),
        }
    });
    req.flash("success", `Đã xóa thành công sản phẩm!`);
    res.redirect("/admin/products-category");
}