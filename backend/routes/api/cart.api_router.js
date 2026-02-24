const express=require("express");
const router=express.Router();

const controller=require("../../controllers/api/cart.controller_api");

router.get("/",controller.index);
router.post("/add/:productId", controller.addProduct);
router.get("/delete/:productId",controller.delete);


module.exports=router