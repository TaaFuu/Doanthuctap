const express = require("express");
const router = express.Router();

const controller = require("../../controllers/api/user.controller_api");


router.post("/register", controller.register);

router.post("/login", controller.login);

router.get("/logout", controller.logout);

router.get("/profile", controller.profile);

router.post("/password/forgot", controller.forgotPassword);
router.post("/password/otp", controller.otpPassword);
router.post("/password/reset", controller.resetPassword);

module.exports = router;