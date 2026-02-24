const express=require("express");
const router=express.Router();

const controller=require("../../controllers/api/checkout.controller_api");

router.post("/order",controller.order);

module.exports=router