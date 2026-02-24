const express = require("express");
const controller = require("../../controllers/api/message_api.controller");

const router = express.Router();

router.post("/message", controller.message);

module.exports = router;
