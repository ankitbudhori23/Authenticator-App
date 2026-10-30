const jwt = require("jsonwebtoken");
const ApiError = require("../utils/ApiError");
const config = require("../config");

const verifyJWT = (req, res, next) => {
  try {
    const token =
      req.header("Authorization")?.replace("Bearer ", "") || req.cookies?.token;

    if (!token) throw new ApiError(401, "Unauthorized: token missing");

    const decoded = jwt.verify(token, config.jwtSecret);
    req.user = decoded;
    next();
  } catch (err) {
    next(new ApiError(401, err.message || "Invalid token"));
  }
};

module.exports = { verifyJWT };
