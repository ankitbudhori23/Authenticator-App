const asyncHandler = require("../../utils/asyncHandler");
const ApiResponse = require("../../utils/ApiResponse");
const service = require("./game.service");

const list = asyncHandler(async (req, res) => {
  const games = await service.listGames();
  res.json(new ApiResponse(200, games, "Games fetched"));
});

const get = asyncHandler(async (req, res) => {
  const game = await service.getGame(req.params.id);
  res.json(new ApiResponse(200, game, "Game fetched"));
});

const create = asyncHandler(async (req, res) => {
  const game = await service.createGame(req.body);
  res.status(201).json(new ApiResponse(201, game, "Game created"));
});

const submitScore = asyncHandler(async (req, res) => {
  const entry = await service.recordScore(req.params.id, {
    userId: req.user?.id,
    score: req.body.score,
  });
  res.status(201).json(new ApiResponse(201, entry, "Score recorded"));
});

const leaderboard = asyncHandler(async (req, res) => {
  const board = await service.leaderboard(req.params.id);
  res.json(new ApiResponse(200, board, "Leaderboard fetched"));
});

module.exports = { list, get, create, submitScore, leaderboard };
