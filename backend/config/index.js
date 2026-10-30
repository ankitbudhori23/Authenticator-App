require("dotenv").config();

const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || "development",
  jwtSecret: process.env.JWT_SECRET || "change-me-in-env",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  db: {
    dialect: process.env.DB_DIALECT || "mysql", // mysql | postgres | sqlite | mssql
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306,
    name: process.env.DB_NAME || "app_db",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    storage: process.env.DB_STORAGE || "./data/dev.sqlite", // used only for sqlite
    logging: process.env.DB_LOGGING === "true",
    pool: {
      max: parseInt(process.env.DB_POOL_MAX || "10", 10),
      min: parseInt(process.env.DB_POOL_MIN || "0", 10),
      idle: parseInt(process.env.DB_POOL_IDLE || "10000", 10),
      acquire: parseInt(process.env.DB_POOL_ACQUIRE || "30000", 10),
    },
  },
};

module.exports = config;
