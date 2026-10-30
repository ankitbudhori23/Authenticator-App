const ApiError = require("../../utils/ApiError");
const { Game, Score } = require("./game.model");

const listGames = () => Game.findAll({ order: [["id", "ASC"]] });

const getGame = async (id) => {
  const game = await Game.findByPk(id);
  if (!game) throw new ApiError(404, "Game not found");
  return game;
};

const createGame = async ({ name, genre }) => {
  if (!name) throw new ApiError(400, "name is required");
  return Game.create({ name, genre: genre || "misc" });
};

const recordScore = async (gameId, { userId, score }) => {
  const game = await getGame(gameId);
  if (typeof score !== "number") {
    throw new ApiError(400, "score must be a number");
  }
  const entry = await Score.create({
    gameId: game.id,
    userId: userId || null,
    score,
  });
  await game.increment("plays");
  return entry;
};

const leaderboard = async (gameId) => {
  await getGame(gameId);
  return Score.findAll({
    where: { gameId: parseInt(gameId, 10) },
    order: [["score", "DESC"]],
    limit: 10,
  });
};

module.exports = { listGames, getGame, createGame, recordScore, leaderboard };
