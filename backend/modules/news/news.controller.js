const asyncHandler = require("../../utils/asyncHandler");
const ApiResponse = require("../../utils/ApiResponse");
const service = require("./news.service");

const list = asyncHandler(async (req, res) => {
  const articles = await service.listArticles();
  res.json(new ApiResponse(200, articles, "Articles fetched"));
});

const get = asyncHandler(async (req, res) => {
  const article = await service.getArticle(req.params.id);
  res.json(new ApiResponse(200, article, "Article fetched"));
});

const create = asyncHandler(async (req, res) => {
  const article = await service.createArticle({
    ...req.body,
    authorId: req.user?.id,
    author: req.body.author || req.user?.email,
  });
  res.status(201).json(new ApiResponse(201, article, "Article created"));
});

const update = asyncHandler(async (req, res) => {
  const article = await service.updateArticle(req.params.id, req.body);
  res.json(new ApiResponse(200, article, "Article updated"));
});

const remove = asyncHandler(async (req, res) => {
  const article = await service.deleteArticle(req.params.id);
  res.json(new ApiResponse(200, article, "Article deleted"));
});

module.exports = { list, get, create, update, remove };
