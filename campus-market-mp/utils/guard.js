function requireLogin(targetUrl = "/pages/login/index", redirectRoute = "") {
  const token = wx.getStorageSync("campus_market_token");

  if (token) {
    return true;
  }

  const currentRoute = getCurrentPages().slice(-1)[0].route;
  const redirect = redirectRoute || currentRoute;

  wx.navigateTo({
    url: `${targetUrl}?redirect=${encodeURIComponent(redirect)}`,
  });

  return false;
}

module.exports = {
  requireLogin,
};
