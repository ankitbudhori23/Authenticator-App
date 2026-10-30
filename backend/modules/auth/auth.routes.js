const { Router } = require("express");
const { register, login, me } = require("./auth.controller");
const { verifyJWT } = require("../../middlewares/auth.middleware");

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", verifyJWT, me);

module.exports = router;
