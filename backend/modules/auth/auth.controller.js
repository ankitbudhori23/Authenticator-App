const asyncHandler = require("../../utils/asyncHandler");
const ApiResponse = require("../../utils/ApiResponse");
const ApiError = require("../../utils/ApiError");
const authService = require("./auth.service");

const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    throw new ApiError(400, "name, email and password are required");
  }
  const user = await authService.registerUser({ name, email, password });
  res.status(201).json(new ApiResponse(201, user, "User registered"));
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new ApiError(400, "email and password are required");
  }
  const data = await authService.loginUser({ email, password });
  res.status(200).json(new ApiResponse(200, data, "Login successful"));
});

const me = asyncHandler(async (req, res) => {
  const user = await authService.getProfile(req.user.id);
  res.status(200).json(new ApiResponse(200, user, "Profile fetched"));
});

module.exports = { register, login, me };
