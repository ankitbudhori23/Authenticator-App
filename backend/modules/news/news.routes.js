const { Router } = require("express");
const { list, get, create, update, remove } = require("./news.controller");
const { verifyJWT } = require("../../middlewares/auth.middleware");

const router = Router();

router.get("/", list);
router.get("/:id", get);
router.post("/", verifyJWT, create);
router.put("/:id", verifyJWT, update);
router.delete("/:id", verifyJWT, remove);

module.exports = router;
