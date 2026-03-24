const jwt = require('jsonwebtoken');
const config = require('./config');

// 生成 Token
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, role: user.role },
    config.jwt.secret,
    { expiresIn: '7d' }
  );
};

// 验证 Token
const verifyToken = (token) => {
  try {
    return jwt.verify(token, config.jwt.secret);
  } catch (err) {
    return null;
  }
};

module.exports = {
  generateToken,
  verifyToken,
  // setToken: (token) => localStorage.setItem('token', token),
  // clearToken: () => localStorage.removeItem('token')
};