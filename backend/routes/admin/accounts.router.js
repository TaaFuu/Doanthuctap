const express = require("express");
const multer = require("multer");
const router = express.Router();
const upload = multer();
const controller = require("../../controllers/admin/accounts.controller");
const uploadCloud = require("../../middlewares/admin/uploadCloud.middleware");

const validate = require("../../validates/admin/accounts.validate");

router.get("/", controller.index);

router.get("/create", controller.create);

router.post("/create", upload.single("avatar"),
    uploadCloud.upload,
    validate.createPost,
    controller.createPost
);

router.get("/edit/:id", controller.edit);

router.patch("/edit/:id", upload.single("avatar"),
    uploadCloud.upload,
    validate.editPatch,
    controller.editPatch
);

router.delete("/delete/:id", controller.delete);

module.exports = router;

