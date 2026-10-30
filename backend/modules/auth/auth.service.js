const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const ApiError = require("../../utils/ApiError");
const config = require("../../config");
const User = require("./auth.model");

const sanitize = (user) => {
  const plain = user.get({ plain: true });
  delete plain.password;
  return plain;
};

const registerUser = async ({ name, email, password }) => {
  const existing = await User.findOne({ where: { email } });
  if (existing) throw new ApiError(409, "User with this email already exists");

  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, password: hashed });
  return sanitize(user);
};

const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ where: { email } });
  if (!user) throw new ApiError(404, "User not found");

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) throw new ApiError(401, "Invalid credentials");

  const token = jwt.sign(
    { id: user.id, email: user.email },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn }
  );

  return { user: sanitize(user), token };
};

const getProfile = async (id) => {
  const user = await User.findByPk(id);
  if (!user) throw new ApiError(404, "User not found");
  return sanitize(user);
};

module.exports = { registerUser, loginUser, getProfile };
