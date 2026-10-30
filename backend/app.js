const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const logger = require("./middlewares/logger");
const errorHandler = require("./middlewares/errorHandler");
const ApiError = require("./utils/ApiError");
const routes = require("./routes");

const app = express();

app.use(cors());
app.use(bodyParser.json({ limit: "1mb" }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(logger);

app.get("/", (req, res) => {
  res.json({
    message: "Multi-app backend",
    apps: ["auth", "news", "games"],
  });
});

app.use("/api/v1", routes);

app.use((req, res, next) => {
  next(new ApiError(404, `Route not found: ${req.originalUrl}`));
});

app.use(errorHandler);

module.exports = app;
