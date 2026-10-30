const { Router } = require("express");
const { list, get, create, submitScore, leaderboard } = require("./game.controller");
const { verifyJWT } = require("../../middlewares/auth.middleware");

const router = Router();

router.get("/", list);
router.get("/:id", get);
router.post("/", verifyJWT, create);
router.post("/:id/scores", verifyJWT, submitScore);
router.get("/:id/leaderboard", leaderboard);

module.exports = router;
