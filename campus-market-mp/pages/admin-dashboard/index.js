Page({
  handleGoUsers() {
    wx.navigateTo({ url: "/pages/admin-users/index" });
  },

  handleGoGoods() {
    wx.navigateTo({ url: "/pages/admin-goods/index" });
  },

  handleGoAnnouncements() {
    wx.navigateTo({ url: "/pages/admin-announcements/index" });
  },

  handleGoPenalties() {
    wx.navigateTo({ url: "/pages/admin-penalties/index" });
  },

  handleGoReports() {
    wx.navigateTo({ url: "/pages/admin-reports/index" });
  },

  handleGoWords() {
    wx.navigateTo({ url: "/pages/admin-words/index" });
  },
});
