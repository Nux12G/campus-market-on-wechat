const TOKEN_KEY = "campus_market_token";
const USER_KEY = "campus_market_user";

function setToken(token) {
  wx.setStorageSync(TOKEN_KEY, token);
}

function getToken() {
  return wx.getStorageSync(TOKEN_KEY);
}

function setUser(userInfo) {
  wx.setStorageSync(USER_KEY, userInfo);
}

function getUser() {
  return wx.getStorageSync(USER_KEY);
}

function clearAuth() {
  wx.removeStorageSync(TOKEN_KEY);
  wx.removeStorageSync(USER_KEY);
}

module.exports = {
  setToken,
  getToken,
  setUser,
  getUser,
  clearAuth,
};
