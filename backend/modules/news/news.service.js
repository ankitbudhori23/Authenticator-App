const ApiError = require("../../utils/ApiError");
const Article = require("./news.model");

const listArticles = () =>
  Article.findAll({ order: [["createdAt", "DESC"]] });

const getArticle = async (id) => {
  const article = await Article.findByPk(id);
  if (!article) throw new ApiError(404, "Article not found");
  return article;
};

const createArticle = async ({ title, content, author, authorId }) => {
  if (!title || !content) {
    throw new ApiError(400, "title and content are required");
  }
  return Article.create({
    title,
    content,
    author: author || "Anonymous",
    authorId: authorId || null,
  });
};

const updateArticle = async (id, payload) => {
  const article = await getArticle(id);
  await article.update(payload);
  return article;
};

const deleteArticle = async (id) => {
  const article = await getArticle(id);
  await article.destroy();
  return article;
};

module.exports = {
  listArticles,
  getArticle,
  createArticle,
  updateArticle,
  deleteArticle,
};
