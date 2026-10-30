const ApiError = require("../utils/ApiError");
const config = require("../config");

const errorHandler = (err, req, res, next) => {
  let error = err;

  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || 500;
    const message = error.message || "Internal Server Error";
    error = new ApiError(statusCode, message, error.errors || []);
  }

  const response = {
    success: false,
    statusCode: error.statusCode,
    message: error.message,
    errors: error.errors,
    ...(config.nodeEnv === "development" && { stack: err.stack }),
  };

  res.status(error.statusCode).json(response);
};

module.exports = errorHandler;
