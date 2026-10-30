const { DataTypes, Model } = require("sequelize");
const { sequelize } = require("../../db");

class Game extends Model {}
class Score extends Model {}

Game.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    genre: {
      type: DataTypes.STRING(60),
      allowNull: false,
      defaultValue: "misc",
    },
    plays: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    modelName: "Game",
    tableName: "games",
    timestamps: true,
  }
);

Score.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    score: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    gameId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "Score",
    tableName: "scores",
    timestamps: true,
  }
);

const associate = () => {
  const User = require("../auth/auth.model");
  Game.hasMany(Score, { foreignKey: "gameId", as: "scores" });
  Score.belongsTo(Game, { foreignKey: "gameId", as: "game" });
  Score.belongsTo(User, { foreignKey: "userId", as: "user" });
};

module.exports = { Game, Score, associate };
