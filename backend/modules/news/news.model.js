const { DataTypes, Model } = require("sequelize");
const { sequelize } = require("../../db");

class Article extends Model {}

Article.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    author: {
      type: DataTypes.STRING(120),
      allowNull: false,
      defaultValue: "Anonymous",
    },
    authorId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "Article",
    tableName: "articles",
    timestamps: true,
  }
);

const associate = () => {
  const User = require("../auth/auth.model");
  Article.belongsTo(User, { foreignKey: "authorId", as: "user" });
};

module.exports = Article;
module.exports.Article = Article;
module.exports.associate = associate;
