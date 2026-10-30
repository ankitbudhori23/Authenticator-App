const { Sequelize } = require("sequelize");
const config = require("../config");

const { db } = config;

const sequelize =
  db.dialect === "sqlite"
    ? new Sequelize({
        dialect: "sqlite",
        storage: db.storage,
        logging: db.logging ? console.log : false,
      })
    : new Sequelize(db.name, db.user, db.password, {
        host: db.host,
        port: db.port,
        dialect: db.dialect,
        logging: db.logging ? console.log : false,
        pool: db.pool,
      });

const connectDB = async () => {
  await sequelize.authenticate();
  console.log(`DB connected (${db.dialect})`);

  // Load models so they are registered before sync
  require("../modules/auth/auth.model");
  require("../modules/news/news.model");
  require("../modules/game/game.model");

  // Wire associations (if any modules export a defineAssociations fn)
  const setups = [
    require("../modules/auth/auth.model").associate,
    require("../modules/news/news.model").associate,
    require("../modules/game/game.model").associate,
  ];
  setups.forEach((fn) => typeof fn === "function" && fn());

  const syncOpts =
    config.nodeEnv === "development" ? { alter: true } : { alter: false };
  await sequelize.sync(syncOpts);
  console.log("DB models synced");
};

module.exports = { sequelize, connectDB };
