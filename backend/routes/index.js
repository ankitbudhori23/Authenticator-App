const { Router } = require("express");
const authRoutes = require("../modules/auth/auth.routes");
const newsRoutes = require("../modules/news/news.routes");
const gameRoutes = require("../modules/game/game.routes");

const router = Router();

router.get("/health", (req, res) => {
  res.json({ status: "ok", uptime: process.uptime() });
});

router.use("/auth", authRoutes);
router.use("/news", newsRoutes);
router.use("/games", gameRoutes);

module.exports = router;
