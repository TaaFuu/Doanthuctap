const express = require("express");
const multer = require("multer");
const router = express.Router();
//const storageMulter=require("../../helpers/storageMulter");


const upload = multer();
const uploadCloud = require("../../middlewares/admin/uploadCloud.middleware");
const controller = require("../../controllers/api/products.controller_api");


router.get("/", controller.index);
router.get("/detail/:id", controller.detail);
router.post("/reduce-stock", controller.reduceStock);

module.exports = router;