const express=require("express");
const router=express.Router();

const controller=require("../../controllers/api/products-category.controller_api");

router.get("/",controller.index);



module.exports=router