const md5 = require('md5');
const Accounts = require("../../models/models.account");
const Role = require("../../models/models.roles");


module.exports.index = async (req, res) => {
    let find = {
        deleted: false,
    };
    const records = await Accounts.find(find).select("-password -token");

    //console.log(records)

    for (const record of records) {
        const role = await Role.findOne({
            _id: record.role_id,
            deleted: false,
        });
        record.role = role;
    }

    res.render("admin/pages/accounts/index", {
        title: "Danh sách tài khoản",
        records: records
    });
}

module.exports.create = async (req, res) => {
    let find = {
        deleted: false
    };
    const roles = await Role.find(find);
    res.render("admin/pages/accounts/create", {
        title: "Tạo Tài khoản mới",
        roles: roles
    });
}

module.exports.createPost = async (req, res) => {
    const emailCheck = await Accounts.findOne({
        email: req.body.email,
        deleted: false,
    });

    if (emailCheck) {
        req.flash("error", `Email ${req.body.email} đã tồn tại!`);
        res.redirect("/admin/accounts/create")
    } else {
        req.body.password = md5(req.body.password);
        const records = new Accounts(req.body);
        await records.save();

        res.redirect("/admin/accounts")
    }
}

module.exports.edit = async (req, res) => {
    let find = {
        _id: req.params.id,
        deleted: false,
    };
    try {
        const data = await Accounts.findOne(find);
        const role = await Role.find({ deleted: false });


        res.render("admin/pages/accounts/edit", {
            title: "Chỉnh sửa tài khoản",
            data: data,
            roles: role
        });

    } catch (error) {
        res.redirect("/admin/accounts");
    }
}

module.exports.editPatch = async (req, res) => {
    const id = req.params.id;

    const emailCheck = await Accounts.findOne({
        _id: { $ne: id },
        email: req.body.email,
        deleted: false,
    });

    if (emailCheck) {
        req.flash("error", `Email ${req.body.email} đã tồn tại`);
    } else {
        if (req.body.password) {
            req.body.password = md5(req.body.password);
        } else {
            delete req.body.password;
        }

        await Accounts.updateOne({ _id: id }, req.body);
        req.flash("success", "Cập nhật tài khoản thành công!");

    }
    res.redirect("/admin/accounts");
}

module.exports.delete = async (req, res) => {
    const id = req.params.id;
    await Accounts.updateOne({ _id: id }, {
        deleted: true,
    });
    req.flash("success", `Đã xóa thành công sản phẩm!`);
    res.redirect("/admin/accounts");
}